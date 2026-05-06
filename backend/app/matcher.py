"""
Job Matcher with pre-computed embeddings.

Jobs are indexed ONCE at startup (or when new jobs are added).
User profile is embedded ONCE when skills change (resume upload).
Auto-match just queries Pinecone — instant response.
"""

from typing import Dict, List, Any

from app.interfaces import JobMatcher, EmbeddingProvider, VectorStore


class HybridJobMatcher(JobMatcher):
    """
    Matches users to jobs using pre-computed embeddings.
    - Jobs are indexed at app startup (not per-request)
    - User embedding is computed on resume upload (cached)
    - Auto-match = one Pinecone query (fast)
    """

    def __init__(self, embedding_provider: EmbeddingProvider, vector_store: VectorStore):
        self._embedder = embedding_provider
        self._store = vector_store
        self._jobs_indexed = False
        self._user_embeddings_cache: Dict[int, List[float]] = {}

    def index_jobs(self, jobs: List[Dict[str, Any]]) -> None:
        """
        Index all jobs into Pinecone. Called ONCE at startup.
        LLM rewrites each job for optimal embedding.
        """
        if not jobs:
            return

        texts = [self._build_job_text(job) for job in jobs]
        contexts = ["job"] * len(texts)
        embeddings = self._embedder.embed_batch(texts, contexts)

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
        self._jobs_indexed = True

    def embed_user(self, user_id: int, user_profile: Dict[str, Any]) -> List[float]:
        """
        Compute and cache user embedding. Called on resume upload/skill change.
        """
        user_text = self._build_user_text(user_profile)
        if not user_text.strip():
            return [0.0] * 512

        embedding = self._embedder.embed_batch([user_text], ["user"])[0]
        self._user_embeddings_cache[user_id] = embedding
        return embedding

    def match(self, user_profile: Dict[str, Any], jobs: List[Dict[str, Any]]) -> Dict[int, int]:
        """
        Compute match scores. Uses cached embeddings — no LLM calls here.
        If jobs aren't indexed yet, index them first (one-time cost).
        """
        if not jobs:
            return {}

        user_text = self._build_user_text(user_profile)
        if not user_text.strip():
            return {job["id"]: 0 for job in jobs}

        # Index jobs if not done yet (first request only)
        if not self._jobs_indexed:
            self.index_jobs(jobs)

        # Get or compute user embedding (cached after first call)
        user_id = user_profile.get("user_id", 0)
        if user_id in self._user_embeddings_cache:
            user_embedding = self._user_embeddings_cache[user_id]
        else:
            user_embedding = self.embed_user(user_id, user_profile)

        # Query Pinecone — this is the only network call (fast, ~50ms)
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

            vec_score = vector_scores.get(job_id, 0.0) * 100

            if job_skills:
                overlap = len(user_skills & job_skills)
                skill_score = (overlap / len(job_skills)) * 100
            else:
                skill_score = 0

            # 80% embedding + 20% skill overlap
            final = (vec_score * 0.8) + (skill_score * 0.2)
            final_scores[job_id] = min(round(final), 100)

        return final_scores

    def match_single(self, user_profile: Dict[str, Any], job: Dict[str, Any]) -> Dict[str, Any]:
        """Detailed skill match for a single job (no embedding needed)."""
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

    def invalidate_user_cache(self, user_id: int) -> None:
        """Clear cached user embedding (call after skills change)."""
        self._user_embeddings_cache.pop(user_id, None)

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
