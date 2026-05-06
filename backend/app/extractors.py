"""
Concrete implementations of TextExtractor and SkillExtractor.

Single Responsibility: Each class does exactly one thing.
Open/Closed: New extractors (e.g., DocxExtractor) can be added without modifying existing ones.
Liskov Substitution: Any TextExtractor subclass works wherever TextExtractor is expected.
"""

import re
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


class DictionarySkillExtractor(SkillExtractor):
    """
    Extracts skills by matching text against a curated dictionary.

    Open/Closed: The skill list can be extended via constructor injection
    without modifying the matching logic.
    """

    DEFAULT_SKILLS = [
        # Programming Languages
        "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go",
        "rust", "swift", "kotlin", "php", "scala", "r", "matlab", "perl",
        "objective-c", "dart", "lua", "haskell", "elixir",
        # Web Frontend
        "react", "angular", "vue", "svelte", "next.js", "nuxt.js", "html",
        "css", "sass", "tailwind", "bootstrap", "jquery", "webpack", "vite",
        # Web Backend
        "node.js", "express", "django", "flask", "fastapi", "spring boot",
        "rails", "laravel", "asp.net", "gin", "fiber",
        # Databases
        "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
        "cassandra", "dynamodb", "firebase", "supabase", "sqlite", "oracle",
        # Cloud & DevOps
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
        "jenkins", "github actions", "ci/cd", "linux", "nginx", "apache",
        # Data Science & ML
        "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
        "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn", "tableau",
        "power bi", "spark", "hadoop", "airflow", "nlp", "computer vision",
        "statistics", "data analysis", "data visualization",
        # Mobile
        "android", "ios", "react native", "flutter", "swiftui", "uikit",
        "core data", "xcode",
        # General CS
        "dsa", "data structures", "algorithms", "system design",
        "distributed systems", "microservices", "api design", "rest",
        "graphql", "grpc", "websockets", "oauth", "jwt",
        # Tools & Practices
        "git", "agile", "scrum", "jira", "figma", "postman",
        # Soft Skills
        "product strategy", "analytics", "leadership", "communication",
        "project management", "stakeholder management", "problem solving",
        # Finance
        "financial modeling", "quantitative analysis", "risk management",
        "trading", "bloomberg",
        # Other
        "excel", "powerpoint", "word", "latex",
    ]

    def __init__(self, skill_dictionary: List[str] = None):
        """Inject custom skill dictionary or use default."""
        self._skills = skill_dictionary or self.DEFAULT_SKILLS

    def extract_skills(self, text: str) -> List[str]:
        if not text:
            return []

        text_lower = text.lower()
        found_skills = []

        for skill in self._skills:
            if len(skill) <= 3:
                pattern = r'\b' + re.escape(skill) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.append(skill.upper() if len(skill) <= 2 else skill.title())
            else:
                if skill in text_lower:
                    found_skills.append(skill.title())

        # Deduplicate preserving order
        seen = set()
        unique = []
        for s in found_skills:
            if s.lower() not in seen:
                seen.add(s.lower())
                unique.append(s)

        return unique
