"""
Concrete implementation of VectorStore using Pinecone.

Single Responsibility: Store and query vector embeddings.
No fallbacks — Pinecone is required.
"""

import os
from typing import List, Dict, Any

from app.interfaces import VectorStore


class PineconeVectorStore(VectorStore):
    """
    Vector store backed by Pinecone cloud service.
    Handles upsert, query, and delete operations.
    """

    def __init__(self):
        from pinecone import Pinecone

        api_key = os.getenv("PINECONE_API_KEY", "")
        host = os.getenv("PINECONE_HOST", "")

        if not api_key or not host:
            raise ValueError("PINECONE_API_KEY and PINECONE_HOST must be set")

        self._pc = Pinecone(api_key=api_key)
        self._index = self._pc.Index(host=host)

    def upsert(self, vectors: List[Dict[str, Any]]) -> None:
        if not vectors:
            return

        records = []
        for v in vectors:
            records.append({
                "id": str(v["id"]),
                "values": v["values"],
                "metadata": v.get("metadata", {}),
            })

        batch_size = 100
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            self._index.upsert(vectors=batch)

    def query(self, vector: List[float], top_k: int = 10) -> List[Dict[str, Any]]:
        results = self._index.query(
            vector=vector,
            top_k=top_k,
            include_metadata=True,
        )

        matches = []
        for match in results.get("matches", []):
            matches.append({
                "id": match["id"],
                "score": match["score"],
                "metadata": match.get("metadata", {}),
            })

        return matches

    def delete(self, ids: List[str]) -> None:
        if ids:
            self._index.delete(ids=[str(i) for i in ids])
