from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import community_store
from app.models import User

community_bp = Blueprint("community", __name__)


@community_bp.route("/messages", methods=["GET"])
@jwt_required()
def get_messages():
    messages = sorted(
        community_store["messages"],
        key=lambda m: m["timestamp"],
        reverse=True,
    )
    return jsonify({"messages": messages[:50]}), 200


@community_bp.route("/messages", methods=["POST"])
@jwt_required()
def post_message():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()

    message_text = data.get("message")
    if not message_text:
        return jsonify({"error": "Message is required"}), 400

    existing = community_store["messages"]
    new_id = (max(m["id"] for m in existing) + 1) if existing else 1

    message = {
        "id": new_id,
        "author": user.name,
        "user_id": user_id,
        "message": message_text,
        "timestamp": datetime.utcnow().isoformat(),
        "replies": 0,
        "is_coordinator": False,
    }

    community_store["messages"].append(message)
    return jsonify({"message": message}), 201


@community_bp.route("/messages/<int:message_id>", methods=["DELETE"])
@jwt_required()
def delete_message(message_id):
    user_id = int(get_jwt_identity())

    msg = next((m for m in community_store["messages"] if m["id"] == message_id), None)
    if not msg:
        return jsonify({"error": "Message not found"}), 404

    if msg.get("user_id") != user_id:
        return jsonify({"error": "Not authorized"}), 403

    community_store["messages"] = [
        m for m in community_store["messages"] if m["id"] != message_id
    ]
    return jsonify({"message": "Deleted"}), 200


@community_bp.route("/messages/<int:message_id>/reply", methods=["POST"])
@jwt_required()
def reply_to_message(message_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()

    reply_text = data.get("reply")
    if not reply_text:
        return jsonify({"error": "Reply text is required"}), 400

    msg = next((m for m in community_store["messages"] if m["id"] == message_id), None)
    if not msg:
        return jsonify({"error": "Message not found"}), 404

    # Increment reply count
    msg["replies"] += 1

    # Store reply
    community_store["replies"].append({
        "message_id": message_id,
        "author": user.name,
        "user_id": user_id,
        "reply": reply_text,
        "timestamp": datetime.utcnow().isoformat(),
    })

    return jsonify({"message": "Reply posted"}), 201
