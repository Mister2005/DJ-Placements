from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import Application, Job, Notification

applications_bp = Blueprint("applications", __name__)


@applications_bp.route("/apply/<int:job_id>", methods=["POST"])
@jwt_required()
def apply_for_job(job_id):
    user_id = int(get_jwt_identity())

    job = Job.query.get(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    existing = Application.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing:
        return jsonify({"error": "Already applied for this job"}), 409

    application = Application(
        user_id=user_id,
        job_id=job_id,
        status="applied",
    )
    db.session.add(application)

    # Create notification
    notification = Notification(
        user_id=user_id,
        title="Application Submitted",
        message=f"You applied for {job.role} at {job.company}.",
        type="application",
    )
    db.session.add(notification)
    db.session.commit()

    return jsonify({"application": application.to_dict()}), 201


@applications_bp.route("", methods=["GET"])
@jwt_required()
def get_applications():
    user_id = int(get_jwt_identity())
    applications = Application.query.filter_by(user_id=user_id).order_by(
        Application.applied_date.desc()
    ).all()
    return jsonify({"applications": [app.to_dict() for app in applications]}), 200


@applications_bp.route("/<int:job_id>", methods=["GET"])
@jwt_required()
def get_application_status(job_id):
    user_id = int(get_jwt_identity())
    application = Application.query.filter_by(
        user_id=user_id, job_id=job_id
    ).first()
    if not application:
        return jsonify({"error": "Application not found"}), 404
    return jsonify({"application": application.to_dict()}), 200


@applications_bp.route("/<int:job_id>", methods=["DELETE"])
@jwt_required()
def withdraw_application(job_id):
    user_id = int(get_jwt_identity())
    application = Application.query.filter_by(
        user_id=user_id, job_id=job_id
    ).first()
    if not application:
        return jsonify({"error": "Application not found"}), 404

    db.session.delete(application)
    db.session.commit()
    return jsonify({"message": "Application withdrawn"}), 200


@applications_bp.route("/<int:job_id>/timeline", methods=["GET"])
@jwt_required()
def get_application_timeline(job_id):
    user_id = int(get_jwt_identity())
    application = Application.query.filter_by(
        user_id=user_id, job_id=job_id
    ).first()
    if not application:
        return jsonify({"error": "Application not found"}), 404
    return jsonify({"timeline": application._get_timeline()}), 200
