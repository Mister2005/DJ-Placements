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

    # Merge with existing (additive — never removes user's manual skills)
    existing_lower = set(s.lower() for s in (user.skills or []))
    new_skills = list(user.skills or [])
    for skill in extracted_skills:
        if skill.lower() not in existing_lower:
            new_skills.append(skill)
            existing_lower.add(skill.lower())

    user.skills = new_skills
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
        "all_skills": new_skills,
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
        results.append(job_dict)

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return jsonify({"jobs": results}), 200
