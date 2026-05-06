from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import Job, Bookmark, Application

jobs_bp = Blueprint("jobs", __name__)


@jobs_bp.route("", methods=["GET"])
@jwt_required()
def get_all_jobs():
    jobs = Job.query.order_by(Job.created_at.desc()).all()
    return jsonify({"jobs": [job.to_dict() for job in jobs]}), 200


@jobs_bp.route("/<int:job_id>", methods=["GET"])
@jwt_required()
def get_job_by_id(job_id):
    user_id = int(get_jwt_identity())
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    has_applied = Application.query.filter_by(
        user_id=user_id, job_id=job_id
    ).first() is not None

    return jsonify({"job": job.to_dict(), "has_applied": has_applied}), 200


@jobs_bp.route("/search", methods=["GET"])
@jwt_required()
def search_jobs():
    query = request.args.get("q", "").lower()
    if not query:
        jobs = Job.query.all()
    else:
        jobs = Job.query.filter(
            db.or_(
                Job.company.ilike(f"%{query}%"),
                Job.role.ilike(f"%{query}%"),
            )
        ).all()

    return jsonify({"jobs": [job.to_dict() for job in jobs]}), 200


@jobs_bp.route("/filter", methods=["GET"])
@jwt_required()
def filter_jobs():
    domain = request.args.get("domain")
    location = request.args.get("location")
    job_type = request.args.get("jobType")

    query = Job.query

    if domain:
        query = query.filter(Job.domain == domain)
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if job_type:
        query = query.filter(Job.job_type == job_type)

    jobs = query.order_by(Job.created_at.desc()).all()
    return jsonify({"jobs": [job.to_dict() for job in jobs]}), 200


@jobs_bp.route("/deadlines", methods=["GET"])
@jwt_required()
def get_deadlines():
    today = date.today()
    jobs = Job.query.filter(Job.last_date_to_apply >= today).order_by(
        Job.last_date_to_apply.asc()
    ).all()

    deadlines = []
    for job in jobs:
        days_remaining = (job.last_date_to_apply - today).days
        deadlines.append({
            "id": job.id,
            "company": job.company,
            "role": job.role,
            "last_date_to_apply": job.last_date_to_apply.isoformat(),
            "days_remaining": days_remaining,
        })

    return jsonify({"deadlines": deadlines}), 200


@jobs_bp.route("/<int:job_id>/bookmark", methods=["POST"])
@jwt_required()
def bookmark_job(job_id):
    user_id = int(get_jwt_identity())

    existing = Bookmark.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing:
        return jsonify({"message": "Already bookmarked"}), 200

    bookmark = Bookmark(user_id=user_id, job_id=job_id)
    db.session.add(bookmark)
    db.session.commit()
    return jsonify({"message": "Job bookmarked"}), 201


@jobs_bp.route("/<int:job_id>/bookmark", methods=["DELETE"])
@jwt_required()
def remove_bookmark(job_id):
    user_id = int(get_jwt_identity())
    bookmark = Bookmark.query.filter_by(user_id=user_id, job_id=job_id).first()
    if bookmark:
        db.session.delete(bookmark)
        db.session.commit()
    return jsonify({"message": "Bookmark removed"}), 200


@jobs_bp.route("/bookmarks", methods=["GET"])
@jwt_required()
def get_bookmarks():
    user_id = int(get_jwt_identity())
    bookmarks = Bookmark.query.filter_by(user_id=user_id).all()
    return jsonify({"bookmarks": [b.to_dict() for b in bookmarks]}), 200
