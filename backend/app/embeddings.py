"""
Embedding pipeline:
1. LLM rewrites job descriptions and resumes into embedding-optimized summaries
2. TF-IDF generates vectors from the rewritten text (for Pinecone storage)

Single Responsibility: This module handles text → vector conversion.
Dependency Inversion: Consumers depend on EmbeddingProvider interface.
"""

import os
import json
from typing import List

from sklearn.feature_extraction.text import TfidfVectorizer

from app.interfaces import EmbeddingProvider


class LLMEnhancedEmbeddingProvider(EmbeddingProvider):
    """
    Uses Groq LLM to rewrite text into embedding-friendly format,
    then generates TF-IDF vectors from the rewritten text.

    The LLM rewrites:
    - Job descriptions → structured skill/requirement summaries
    - User profiles → structured capability summaries

    This makes embeddings much more accurate because the LLM normalizes
    different phrasings ("proficient in Python" → "Python expert",
    "3 years React experience" → "React advanced") into consistent
    embedding-friendly representations.
    """

    def __init__(self, max_features: int = 512):
        self._max_features = max_features
        self._vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=self._max_features,
            ngram_range=(1, 2),
        )
        self._groq_client = None

    def _get_groq(self):
        if self._groq_client is None:
            from groq import Groq
            api_key = os.getenv("GROQ_API_KEY", "")
            if api_key:
                self._groq_client = Groq(api_key=api_key)
        return self._groq_client

    def _rewrite_for_embedding(self, text: str, context: str = "general") -> str:
        """
        Use LLM to rewrite text into a format optimized for semantic embedding.
        Extracts key skills, requirements, and competencies in a normalized way.
        """
        client = self._get_groq()
        if not client or len(text.strip()) < 20:
            return text

        if context == "job":
            prompt = f"""Rewrite this job posting into a concise embedding-friendly summary. Focus on: required skills, experience level, domain, key technologies, and role type. Use consistent terminology (e.g., "Python programming", "cloud infrastructure AWS", "frontend React TypeScript"). Keep it under 200 words.

Job text: {text[:2000]}

Embedding summary:"""
        elif context == "user":
            prompt = f"""Rewrite this user profile into a concise embedding-friendly summary. Focus on: skills they have, their experience level, domain expertise, and technologies they know. Use consistent terminology. Keep it under 150 words.

Profile: {text[:1500]}

Embedding summary:"""
        else:
            return text

        try:
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_completion_tokens=4096,
            )
            rewritten = completion.choices[0].message.content.strip()
            return rewritten if rewritten else text
        except Exception:
            return text

    def embed(self, text: str) -> List[float]:
        """Embed a single text."""
        if not text.strip():
            return [0.0] * self._max_features

        matrix = self._vectorizer.fit_transform([text])
        dense = matrix.toarray()[0]
        result = list(map(float, dense)) + [0.0] * (self._max_features - len(dense))
        return result[:self._max_features]

    def embed_batch(self, texts: List[str], contexts: List[str] = None) -> List[List[float]]:
        """
        Embed multiple texts. First rewrites each via LLM for better embeddings,
        then vectorizes the rewritten versions together.
        """
        if not texts:
            return []

        # Rewrite texts via LLM for embedding optimization
        if contexts and len(contexts) == len(texts):
            rewritten = []
            for text, ctx in zip(texts, contexts):
                rewritten.append(self._rewrite_for_embedding(text, ctx))
        else:
            rewritten = texts

        clean_texts = [t if t.strip() else "empty" for t in rewritten]
        matrix = self._vectorizer.fit_transform(clean_texts)
        dense = matrix.toarray()

        results = []
        for row in dense:
            vec = list(map(float, row)) + [0.0] * (self._max_features - len(row))
            results.append(vec[:self._max_features])

        return results
