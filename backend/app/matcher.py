"""
Concrete implementation of JobMatcher.

Single Responsibility: Orchestrates matching using injected dependencies.
Open/Closed: New matching strategies can be added as new classes.
Dependency Inversion: Depends on EmbeddingProvider and VectorStore abstractions.
"""

from typing import Dict, List, Any

from app.interfaces import JobMatcher, EmbeddingProvider, VectorStore


class HybridJobMatcher(JobMatcher):
    """
    Matches users to jobs using a hybrid approach:
    1. Vector similarity (via EmbeddingProvider + VectorStore) — semantic matching
    2. Direct skill overlap — exact matching

    Final score = 60% vector similarity + 40% skill overlap

    Dependency Inversion: This class doesn't know if embeddings come from
    TF-IDF or OpenAI, or if vectors are stored in Pinecone or memory.
    It only talks to abstractions.
    """

    def __init__(self, embedding_provider: EmbeddingProvider, vector_store: VectorStore):
        self._embedder = embedding_provider
        self._store = vector_store

    def index_jobs(self, jobs: List[Dict[str, Any]]) -> None:
        """
        Index all jobs into the vector store.
        Called once at startup or when jobs change.
        """
        if not jobs:
            return

        texts = [self._build_job_text(job) for job in jobs]
        embeddings = self._embedder.embed_batch(texts)

        vectors = []
        for i, job in enumerate(jobs):
            vectors.append({
                "id": f"job_{job['id']}",
                "values": embeddings[i],
                "metadata": {
                    "job_id": job["id"],
                    "company": job.get("company", ""),
                    "role": job.get("role", ""),
                    "domain": job.get("domain", ""),
                    "skills": ",".join(job.get("skills", [])),
                },
            })

        self._store.upsert(vectors)

    def match(self, user_profile: Dict[str, Any], jobs: List[Dict[str, Any]]) -> Dict[int, int]:
        """
        Compute match scores for all jobs against a user profile.
        Returns {job_id: score (0-100)}.
        """
        if not jobs:
            return {}

        # Build user text and embed it
        user_text = self._build_user_text(user_profile)
        if not user_text.strip():
            return {job["id"]: 0 for job in jobs}

        # Index jobs (idempotent — overwrites existing)
        self.index_jobs(jobs)

        # Query vector store for similar jobs
        user_embedding = self._embedder.embed_batch([user_text] + [self._build_job_text(j) for j in jobs])[0]
        results = self._store.query(user_embedding, top_k=len(jobs))

        # Build score map from vector similarity
        vector_scores = {}
        for match in results:
            job_id = match["metadata"].get("job_id")
            if job_id is not None:
                vector_scores[job_id] = match["score"]

        # Compute hybrid scores
        user_skills = set(s.lower() for s in user_profile.get("skills", []))
        final_scores = {}

        for job in jobs:
            job_id = job["id"]
            job_skills = set(s.lower() for s in job.get("skills", []))

            # Vector similarity component (0-100)
            vec_score = vector_scores.get(job_id, 0.0) * 100

            # Skill overlap component (0-100)
            if job_skills:
                overlap = len(user_skills & job_skills)
                skill_score = (overlap / len(job_skills)) * 100
            else:
                skill_score = 0

            # Hybrid: 80% embedding + 20% exact skill match
            final = (vec_score * 0.8) + (skill_score * 0.2)
            final_scores[job_id] = min(round(final), 100)

        return final_scores

    def match_single(self, user_profile: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detailed match for a single job.
        Returns matched skills, missing skills, and percentage.
        """
        user_skills = set(s.lower() for s in user_profile.get("skills", []))
        job_skills = job.get("skills", [])

        matched = [s for s in job_skills if s.lower() in user_skills]
        missing = [s for s in job_skills if s.lower() not in user_skills]

        total = len(job_skills)
        pct = int((len(matched) / total) * 100) if total > 0 else 0

        return {
            "match_percentage": pct,
            "matched_skills": matched,
            "missing_skills": missing,
            "suggestions": missing[:5],
        }

    def _build_user_text(self, profile: Dict[str, Any]) -> str:
        parts = []
        if profile.get("skills"):
            parts.append("Skills: " + ", ".join(profile["skills"]))
        if profile.get("branch"):
            parts.append("Branch: " + profile["branch"])
        if profile.get("current_year"):
            parts.append("Year: " + profile["current_year"])
        return " ".join(parts)

    def _build_job_text(self, job: Dict[str, Any]) -> str:
        parts = [
            f"Role: {job.get('role', '')}",
            f"Company: {job.get('company', '')}",
            f"Domain: {job.get('domain', '')}",
            f"Skills: {', '.join(job.get('skills', []))}",
            f"Description: {job.get('description', '')}",
            f"Eligibility: {job.get('eligibility', '')}",
        ]
        if job.get("responsibilities"):
            parts.append("Responsibilities: " + ", ".join(job["responsibilities"]))
        return " ".join(parts)
