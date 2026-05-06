"""
Concrete implementations of EmbeddingProvider.

Single Responsibility: Each class handles one embedding strategy.
Open/Closed: Add new providers (OpenAI, Cohere) without modifying existing ones.
Liskov Substitution: Any EmbeddingProvider works wherever the interface is expected.
Dependency Inversion: Routes depend on the EmbeddingProvider abstraction, not this file.
"""

from typing import List

from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

from app.interfaces import EmbeddingProvider


class TfidfEmbeddingProvider(EmbeddingProvider):
    """
    Generates embeddings using TF-IDF vectorization.
    Lightweight, no external API calls, works offline.
    Produces sparse vectors converted to dense for compatibility with vector stores.
    """

    def __init__(self, max_features: int = 768):
        self._max_features = max_features
        self._vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=self._max_features,
            ngram_range=(1, 2),
        )
        self._is_fitted = False

    def embed(self, text: str) -> List[float]:
        """Embed a single text. Fits vectorizer on this text alone."""
        if not text.strip():
            return [0.0] * self._max_features

        matrix = self._vectorizer.fit_transform([text])
        self._is_fitted = True
        dense = matrix.toarray()[0]

        # Pad or truncate to fixed dimension
        result = list(map(float, dense)) + [0.0] * (self._max_features - len(dense))
        return result[:self._max_features]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Embed multiple texts together (fitted on the full corpus).
        This produces better vectors since TF-IDF needs corpus context.
        """
        if not texts:
            return []

        clean_texts = [t if t.strip() else "empty" for t in texts]
        matrix = self._vectorizer.fit_transform(clean_texts)
        self._is_fitted = True
        dense = matrix.toarray()

        results = []
        for row in dense:
            vec = list(map(float, row)) + [0.0] * (self._max_features - len(row))
            results.append(vec[:self._max_features])

        return results
