"""
Concrete implementations of TextExtractor and SkillExtractor.

Single Responsibility: Each class does exactly one thing.
Open/Closed: New extractors can be added without modifying existing ones.
Liskov Substitution: Any subclass works wherever the parent interface is expected.
"""

import os
import json
from typing import List

from PyPDF2 import PdfReader

from app.interfaces import TextExtractor, SkillExtractor


class PdfTextExtractor(TextExtractor):
    """Extracts text from PDF files using PyPDF2."""

    def extract(self, file_path: str) -> str:
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        except Exception:
            return ""


class LLMSkillExtractor(SkillExtractor):
    """
    Extracts skills from resume text using Groq LLM (Llama 3.1).
    The AI reads the resume and identifies technical skills, tools,
    frameworks, and competencies — not just keyword matching.
    """

    def __init__(self):
        from groq import Groq
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            raise ValueError("GROQ_API_KEY must be set")
        self._client = Groq(api_key=api_key)

    def extract_skills(self, text: str) -> List[str]:
        if not text or len(text.strip()) < 50:
            return []

        from app.skills_dictionary import SKILLS

        # Truncate very long resumes to fit context window
        truncated = text[:4000]
        skills_list = ", ".join(SKILLS)

        prompt = f"""You are a resume parser. Extract skills from this resume.

You MUST ONLY select skills from this approved list:
{skills_list}

RULES:
- ONLY return skills that appear in the approved list above.
- Match the exact casing from the list (e.g., "Node.js" not "nodejs").
- If the resume mentions something similar to a skill in the list, use the list version.
- Maximum 20 skills.
- Return ONLY a JSON array. Nothing else.

Resume:
{truncated}"""

        try:
            completion = self._client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_completion_tokens=4096,
            )
            response = completion.choices[0].message.content.strip()

            # Parse JSON array from response
            # Handle cases where LLM wraps in markdown code blocks
            if "```" in response:
                parts = response.split("```")
                for part in parts:
                    part = part.strip()
                    if part.startswith("json"):
                        part = part[4:].strip()
                    if part.startswith("["):
                        response = part
                        break

            # Find the JSON array in the response
            start = response.find("[")
            end = response.rfind("]")
            if start != -1 and end != -1:
                response = response[start:end + 1]

            skills = json.loads(response)
            if isinstance(skills, list):
                from app.skills_dictionary import SKILLS_LOWER
                seen = set()
                unique = []
                for s in skills:
                    if isinstance(s, str) and s.strip():
                        # Map to canonical name from dictionary
                        canonical = SKILLS_LOWER.get(s.strip().lower())
                        if canonical and canonical.lower() not in seen:
                            seen.add(canonical.lower())
                            unique.append(canonical)
                return unique[:20]
            return []
        except Exception as e:
            print(f"[LLMSkillExtractor] Error: {e}")
            return []
