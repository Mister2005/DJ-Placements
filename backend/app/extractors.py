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

        prompt = f"""You are a resume parser. Extract ONLY technical skills from this resume.

RULES:
- Only include programming languages, frameworks, libraries, tools, databases, cloud platforms, and technical methodologies.
- DO NOT include: certifications, degrees, university names, company names, project names, soft skills (like "problem solving", "teamwork"), or generic terms (like "debugging", "system faults").
- Use standard naming conventions: "Python" not "python", "Node.js" not "nodejs", "React" not "ReactJS", "AWS" not "Amazon Web Services", "PostgreSQL" not "postgres", "TensorFlow" not "Tensorflow", "scikit-learn" not "sklearn".
- Keep each skill concise (1-3 words max).
- Maximum 20 skills.

VALID examples: Python, Java, React, Node.js, AWS, Docker, Kubernetes, PostgreSQL, MongoDB, TensorFlow, PyTorch, Flask, Django, Spring Boot, SQL, Git, Linux, Kafka, Redis, GraphQL

INVALID examples: Problem Solving, Debugging, System Faults, Google Colab, Kaggle, GitHub, BioBERT, ERP Systems, Communication, Leadership

Return ONLY a JSON array. Nothing else.

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
                seen = set()
                unique = []
                for s in skills:
                    if isinstance(s, str) and s.strip() and s.lower() not in seen:
                        seen.add(s.lower())
                        unique.append(s.strip())
                return unique[:30]
            return []
        except Exception as e:
            print(f"[LLMSkillExtractor] Error: {e}")
            return []
