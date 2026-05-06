"""
Concrete implementations of VectorStore.

Single Responsibility: Each class handles one storage backend.
Open/Closed: Add new stores (Weaviate, Qdrant) without modifying existing ones.
Dependency Inversion: Consumers depend on VectorStore interface, not Pinecone directly.
"""

import os
from typing import List, Dict, Any

from app.interfaces import VectorStore


class PineconeVectorStore(VectorStore):
    """
    Vector store backed by Pinecone cloud service.
    Handles upsert, query, and delete operations against a Pinecone index.
    """

    def __init__(self):
        from pinecone import Pinecone

        api_key = os.getenv("PINECONE_API_KEY", "")
        host = os.getenv("PINECONE_HOST", "")

        if not api_key or not host:
            raise ValueError("PINECONE_API_KEY and PINECONE_HOST must be set in environment")

        self._pc = Pinecone(api_key=api_key)
        self._index = self._pc.Index(host=host)

    def upsert(self, vectors: List[Dict[str, Any]]) -> None:
        """
        Upsert vectors into Pinecone.
        Each vector dict: {'id': str, 'values': List[float], 'metadata': dict}
        """
        if not vectors:
            return

        # Pinecone expects list of tuples or dicts
        records = []
        for v in vectors:
            records.append({
                "id": str(v["id"]),
                "values": v["values"],
                "metadata": v.get("metadata", {}),
            })

        # Batch upsert (Pinecone supports up to 100 per call)
        batch_size = 100
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            self._index.upsert(vectors=batch)

    def query(self, vector: List[float], top_k: int = 10) -> List[Dict[str, Any]]:
        """Query Pinecone for similar vectors."""
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
        """Delete vectors by ID."""
        if ids:
            self._index.delete(ids=[str(i) for i in ids])


class InMemoryVectorStore(VectorStore):
    """
    Fallback vector store using in-memory numpy arrays.
    Used when Pinecone is unavailable (no API key, network issues).

    Liskov Substitution: Works identically to PineconeVectorStore from
    the consumer's perspective.
    """

    def __init__(self):
        self._vectors: Dict[str, Dict[str, Any]] = {}

    def upsert(self, vectors: List[Dict[str, Any]]) -> None:
        for v in vectors:
            self._vectors[str(v["id"])] = {
                "values": v["values"],
                "metadata": v.get("metadata", {}),
            }

    def query(self, vector: List[float], top_k: int = 10) -> List[Dict[str, Any]]:
        import numpy as np

        if not self._vectors:
            return []

        query_vec = np.array(vector)
        query_norm = np.linalg.norm(query_vec)
        if query_norm == 0:
            return []

        scores = []
        for vid, data in self._vectors.items():
            stored_vec = np.array(data["values"])
            stored_norm = np.linalg.norm(stored_vec)
            if stored_norm == 0:
                scores.append((vid, 0.0, data["metadata"]))
                continue
            similarity = float(np.dot(query_vec, stored_vec) / (query_norm * stored_norm))
            scores.append((vid, similarity, data["metadata"]))

        scores.sort(key=lambda x: x[1], reverse=True)

        return [
            {"id": vid, "score": score, "metadata": meta}
            for vid, score, meta in scores[:top_k]
        ]

    def delete(self, ids: List[str]) -> None:
        for vid in ids:
            self._vectors.pop(str(vid), None)
