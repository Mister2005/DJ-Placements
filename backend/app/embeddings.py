"""
Dense embedding provider using Pinecone Inference API.
Model: multilingual-e5-large (1024 dimensions)
Batch support — embeds multiple texts in one API call.
"""

import os
from typing import List
from app.interfaces import EmbeddingProvider


class PineconeEmbeddingProvider(EmbeddingProvider):
    """
    Real dense embeddings via Pinecone's inference API.
    Uses multilingual-e5-large model (1024-dim).
    Supports batching — up to 96 texts per call.
    """

    def __init__(self):
        from pinecone import Pinecone
        api_key = os.getenv("PINECONE_API_KEY", "")
        if not api_key:
            raise ValueError("PINECONE_API_KEY required")
        self._pc = Pinecone(api_key=api_key)

    def embed(self, text: str) -> List[float]:
        if not text.strip():
            return [0.0] * 1024
        result = self._pc.inference.embed(
            model="multilingual-e5-large",
            inputs=[text],
            parameters={"input_type": "passage", "truncate": "END"},
        )
        return list(result.data[0].values)

    def embed_batch(self, texts: List[str], contexts: List[str] = None) -> List[List[float]]:
        if not texts:
            return []

        clean = [t if t.strip() else "empty document" for t in texts]
        all_embeddings = []

        # Pinecone batch limit is 96
        batch_size = 96
        for i in range(0, len(clean), batch_size):
            batch = clean[i:i + batch_size]
            result = self._pc.inference.embed(
                model="multilingual-e5-large",
                inputs=batch,
                parameters={"input_type": "passage", "truncate": "END"},
            )
            for item in result.data:
                all_embeddings.append(list(item.values))

        return all_embeddings
