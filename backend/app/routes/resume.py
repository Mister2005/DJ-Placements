"""
Resume routes — AI skill extraction and job matching.

Dependency Inversion: This module depends on abstract services (get_text_extractor,
get_skill_extractor, get_job_matcher) — never on concrete implementations directly.

Single Responsibility: Each route handler does one thing — delegates to services.
"""

import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import User, Job
from app.services import get_text_extractor, get_skill_extractor, get_job_matcher

resume_bp = Blueprint("resume", __name__)


@resume_bp.route("/parse", methods=["POST"])
@jwt_required()
def parse_resume():
    """
    Parse uploaded PDF → extract text → extract skills → update user profile.
    Uses injected TextExtractor and SkillExtractor services.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if "resume" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["resume"]
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported"}), 400

    # Save temporarily
    temp_path = os.path.join(current_app.config["UPLOAD_FOLDER"], f"temp_{user_id}.pdf")
    file.save(temp_path)

    # Extract text (TextExtractor abstraction)
    extractor = get_text_extractor()
    resume_text = extractor.extract(temp_path)

    # Extract skills (SkillExtractor abstraction)
    skill_extractor = get_skill_extractor()
    extracted_skills = skill_extractor.extract_skills(resume_text)

    # Extract profile info (name, phone, cgpa, branch) via LLM
    profile_info = _extract_profile_info(resume_text)

    # Replace skills entirely with what AI extracted (fresh start)
    user.skills = extracted_skills

    # Auto-fill profile fields if found in resume and currently empty
    if profile_info.get("name") and not user.name.strip():
        user.name = profile_info["name"]
    if profile_info.get("phone") and not user.phone.strip():
        user.phone = profile_info["phone"]
    if profile_info.get("cgpa") and user.cgpa == 0.0:
        user.cgpa = profile_info["cgpa"]
    if profile_info.get("branch") and not user.branch.strip():
        user.branch = profile_info["branch"]
    if profile_info.get("current_year") and not user.current_year.strip():
        user.current_year = profile_info["current_year"]

    db.session.commit()

    # Cleanup
    try:
        os.remove(temp_path)
    except OSError:
        pass

    return jsonify({
        "parsed": True,
        "resume_text_preview": resume_text[:500] if resume_text else "",
        "extracted_skills": extracted_skills,
        "all_skills": extracted_skills,
        "profile_info": profile_info,
    }), 200


@resume_bp.route("/match/<int:job_id>", methods=["GET"])
@jwt_required()
def skill_matching(job_id):
    """Detailed skill match for a single job. Uses JobMatcher abstraction."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    job = Job.query.get(job_id)

    if not job:
        return jsonify({"error": "Job not found"}), 404

    matcher = get_job_matcher()
    user_profile = {"skills": user.skills or [], "branch": user.branch, "current_year": user.current_year}
    job_dict = job.to_dict()

    result = matcher.match_single(user_profile, job_dict)
    return jsonify(result), 200


@resume_bp.route("/auto-match", methods=["GET"])
@jwt_required()
def auto_match_jobs():
    """
    AI auto-filter: rank all jobs by match score.
    Uses JobMatcher abstraction (backed by Pinecone or in-memory vectors).
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    jobs = Job.query.all()
    job_dicts = [job.to_dict() for job in jobs]

    matcher = get_job_matcher()
    user_profile = {"skills": user.skills or [], "branch": user.branch, "current_year": user.current_year}
    scores = matcher.match(user_profile, job_dicts)

    # Attach scores and sort
    results = []
    for job_dict in job_dicts:
        job_dict["match_score"] = scores.get(job_dict["id"], 0)
        # Also compute direct skill match for display
        user_skills_lower = set(s.lower() for s in (user.skills or []))
        job_skills = job_dict.get("skills", [])
        matched = [s for s in job_skills if s.lower() in user_skills_lower]
        missing = [s for s in job_skills if s.lower() not in user_skills_lower]
        total = len(job_skills)
        job_dict["skill_match_pct"] = int((len(matched) / total) * 100) if total > 0 else 0
        job_dict["matched_skills"] = matched
        job_dict["missing_skills"] = missing
        results.append(job_dict)

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return jsonify({"jobs": results}), 200


def _extract_profile_info(resume_text: str) -> dict:
    """Use LLM to extract personal/academic info from resume text."""
    import os
    import json
    from groq import Groq

    if not resume_text or len(resume_text.strip()) < 50:
        return {}

    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return {}

    client = Groq(api_key=api_key)
    truncated = resume_text[:3000]

    prompt = f"""Extract personal and academic information from this resume. Return a JSON object with these fields ONLY:
- "name": full name of the person (string or null if not found)
- "phone": phone number with country code (string or null)
- "cgpa": CGPA/GPA as a number (float or null). Look for CGPA, GPA, percentage converted to 10-scale.
- "branch": field of study like "Computer Science", "Electronics", "Mechanical" (string or null)
- "current_year": academic year like "Final Year", "3rd Year", "Graduate" (string or null)

Return ONLY the JSON object. No explanation.

Resume:
{truncated}"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_completion_tokens=4096,
        )
        response = completion.choices[0].message.content.strip()

        # Find JSON object in response
        if "```" in response:
            parts = response.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("{"):
                    response = part
                    break

        start = response.find("{")
        end = response.rfind("}")
        if start != -1 and end != -1:
            response = response[start:end + 1]

        data = json.loads(response)
        result = {}

        if data.get("name") and isinstance(data["name"], str):
            result["name"] = data["name"].strip()
        if data.get("phone") and isinstance(data["phone"], str):
            result["phone"] = data["phone"].strip()
        if data.get("cgpa") is not None:
            try:
                result["cgpa"] = float(data["cgpa"])
            except (ValueError, TypeError):
                pass
        if data.get("branch") and isinstance(data["branch"], str):
            result["branch"] = data["branch"].strip()
        if data.get("current_year") and isinstance(data["current_year"], str):
            result["current_year"] = data["current_year"].strip()

        return result
    except Exception as e:
        print(f"[ProfileExtractor] Error: {e}")
        return {}
