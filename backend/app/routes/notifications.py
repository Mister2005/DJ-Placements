from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models import Notification, NotificationPreference

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifications = Notification.query.filter_by(user_id=user_id).order_by(
        Notification.created_at.desc()
    ).all()
    return jsonify({"notifications": [n.to_dict() for n in notifications]}), 200


@notifications_bp.route("/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_as_read(notification_id):
    user_id = int(get_jwt_identity())
    notification = Notification.query.filter_by(
        id=notification_id, user_id=user_id
    ).first()
    if not notification:
        return jsonify({"error": "Notification not found"}), 404

    notification.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"}), 200


@notifications_bp.route("/preferences", methods=["GET"])
@jwt_required()
def get_preferences():
    user_id = int(get_jwt_identity())
    prefs = NotificationPreference.query.filter_by(user_id=user_id).first()
    if not prefs:
        prefs = NotificationPreference(user_id=user_id)
        db.session.add(prefs)
        db.session.commit()
    return jsonify({"preferences": prefs.to_dict()}), 200


@notifications_bp.route("/preferences", methods=["PUT"])
@jwt_required()
def update_preferences():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    prefs = NotificationPreference.query.filter_by(user_id=user_id).first()
    if not prefs:
        prefs = NotificationPreference(user_id=user_id)
        db.session.add(prefs)

    if "email_jobs" in data:
        prefs.email_jobs = data["email_jobs"]
    if "push_updates" in data:
        prefs.push_updates = data["push_updates"]
    if "deadline_emails" in data:
        prefs.deadline_emails = data["deadline_emails"]
    if "newsletter" in data:
        prefs.newsletter = data["newsletter"]

    db.session.commit()
    return jsonify({"preferences": prefs.to_dict()}), 200
