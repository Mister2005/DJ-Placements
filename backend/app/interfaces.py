"""
SOLID Interfaces (Abstract Base Classes)

Dependency Inversion Principle: High-level modules depend on these abstractions,
not on concrete implementations. Any implementation can be swapped without
changing the consuming code.

Interface Segregation Principle: Each interface has a single focused purpose.
Clients are never forced to depend on methods they don't use.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any


class TextExtractor(ABC):
    """
    Single Responsibility: Extract text from a document.
    Interface Segregation: Only one method — extract.
    """

    @abstractmethod
    def extract(self, file_path: str) -> str:
        """Extract text content from a file. Returns empty string on failure."""
        pass


class SkillExtractor(ABC):
    """
    Single Responsibility: Identify skills from raw text.
    Interface Segregation: Only one method — extract_skills.
    """

    @abstractmethod
    def extract_skills(self, text: str) -> List[str]:
        """Extract skill names from text. Returns list of skill strings."""
        pass


class EmbeddingProvider(ABC):
    """
    Single Responsibility: Convert text into a numerical vector.
    Interface Segregation: Only one method — embed.
    """

    @abstractmethod
    def embed(self, text: str) -> List[float]:
        """Convert text to a vector embedding."""
        pass

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Convert multiple texts to vector embeddings."""
        pass


class VectorStore(ABC):
    """
    Single Responsibility: Store and query vector embeddings.
    Interface Segregation: Focused on upsert + query operations.
    """

    @abstractmethod
    def upsert(self, vectors: List[Dict[str, Any]]) -> None:
        """Store vectors. Each dict has 'id', 'values', 'metadata'."""
        pass

    @abstractmethod
    def query(self, vector: List[float], top_k: int = 10) -> List[Dict[str, Any]]:
        """Find top_k most similar vectors. Returns list of {id, score, metadata}."""
        pass

    @abstractmethod
    def delete(self, ids: List[str]) -> None:
        """Delete vectors by ID."""
        pass


class JobMatcher(ABC):
    """
    Single Responsibility: Compute match scores between a user and jobs.
    Interface Segregation: Only one method — match.
    """

    @abstractmethod
    def match(self, user_profile: Dict[str, Any], jobs: List[Dict[str, Any]]) -> Dict[int, int]:
        """
        Compute match scores.
        Returns {job_id: score (0-100)}.
        """
        pass
