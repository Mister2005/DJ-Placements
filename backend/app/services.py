"""
Service Registry / Composition Root

Dependency Inversion Principle: This is the ONLY place where concrete
implementations are instantiated. All other modules depend on abstractions.

Open/Closed: To swap Pinecone for Weaviate, change ONE line here.
No route or matcher code changes needed.
"""

import os
from app.interfaces import TextExtractor, SkillExtractor, EmbeddingProvider, VectorStore, JobMatcher
from app.extractors import PdfTextExtractor, DictionarySkillExtractor
from app.embeddings import TfidfEmbeddingProvider
from app.vector_store import PineconeVectorStore, InMemoryVectorStore
from app.matcher import HybridJobMatcher


def _create_vector_store() -> VectorStore:
    """
    Factory: creates Pinecone store if credentials exist, else falls back to in-memory.
    This is NOT a fallback in the data sense — it's a deployment flexibility choice.
    """
    api_key = os.getenv("PINECONE_API_KEY", "")
    host = os.getenv("PINECONE_HOST", "")

    if api_key and host:
        try:
            store = PineconeVectorStore()
            return store
        except Exception as e:
            print(f"[WARN] Pinecone unavailable ({e}), using in-memory vector store")
            return InMemoryVectorStore()
    else:
        return InMemoryVectorStore()


# Singleton instances — created once, reused across requests
_text_extractor: TextExtractor = PdfTextExtractor()
_skill_extractor: SkillExtractor = DictionarySkillExtractor()
_embedding_provider: EmbeddingProvider = TfidfEmbeddingProvider(max_features=512)
_vector_store: VectorStore = None  # Lazy init (needs env vars loaded)
_job_matcher: JobMatcher = None  # Lazy init


def get_text_extractor() -> TextExtractor:
    return _text_extractor


def get_skill_extractor() -> SkillExtractor:
    return _skill_extractor


def get_embedding_provider() -> EmbeddingProvider:
    return _embedding_provider


def get_vector_store() -> VectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = _create_vector_store()
    return _vector_store


def get_job_matcher() -> JobMatcher:
    global _job_matcher
    if _job_matcher is None:
        _job_matcher = HybridJobMatcher(
            embedding_provider=get_embedding_provider(),
            vector_store=get_vector_store(),
        )
    return _job_matcher
