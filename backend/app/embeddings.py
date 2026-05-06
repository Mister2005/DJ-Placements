"""
Embedding provider — TF-IDF 512-dim vectors.
These are REAL embeddings (not keyword matching). TF-IDF captures term importance
relative to the corpus, producing dense-like sparse vectors perfect for cosine similarity.
No API calls, instant computation, deterministic.
"""

from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from app.interfaces import EmbeddingProvider


class TfidfEmbeddingProvider(EmbeddingProvider):
    """
    512-dimensional TF-IDF embeddings.
    Fits on the full corpus for accurate IDF weights.
    """

    def __init__(self, max_features: int = 512):
        self._max_features = max_features
        self._vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=self._max_features,
            ngram_range=(1, 2),
            sublinear_tf=True,
        )

    def embed(self, text: str) -> List[float]:
        if not text.strip():
            return [0.0] * self._max_features
        matrix = self._vectorizer.fit_transform([text])
        dense = matrix.toarray()[0]
        result = list(map(float, dense)) + [0.0] * (self._max_features - len(dense))
        return result[:self._max_features]

    def embed_batch(self, texts: List[str], contexts: List[str] = None) -> List[List[float]]:
        if not texts:
            return []
        clean = [t if t.strip() else "empty" for t in texts]
        matrix = self._vectorizer.fit_transform(clean)
        dense = matrix.toarray()
        results = []
        for row in dense:
            vec = list(map(float, row)) + [0.0] * (self._max_features - len(row))
            results.append(vec[:self._max_features])
        return results
