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

        # Truncate very long resumes to fit context window
        truncated = text[:4000]

        prompt = f"""Analyze this resume text and extract ALL technical skills, tools, frameworks, programming languages, and professional competencies mentioned.

Return ONLY a JSON array of skill strings. No explanations, no markdown, just the JSON array.
Example output: ["Python", "React", "System Design", "AWS", "Machine Learning"]

Resume text:
{truncated}

JSON array of extracted skills:"""

        try:
            completion = self._client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_completion_tokens=512,
            )
            response = completion.choices[0].message.content.strip()

            # Parse JSON array from response
            # Handle cases where LLM wraps in markdown code blocks
            if response.startswith("```"):
                response = response.split("```")[1]
                if response.startswith("json"):
                    response = response[4:]
                response = response.strip()

            skills = json.loads(response)
            if isinstance(skills, list):
                # Clean and deduplicate
                seen = set()
                unique = []
                for s in skills:
                    if isinstance(s, str) and s.strip() and s.lower() not in seen:
                        seen.add(s.lower())
                        unique.append(s.strip())
                return unique[:30]  # Cap at 30 skills
            return []
        except Exception as e:
            print(f"[LLMSkillExtractor] Error: {e}")
            return []
