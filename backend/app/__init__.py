import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

from config import Config

db = SQLAlchemy()
jwt = JWTManager()

# In-memory store for community messages (replaces MongoDB)
community_store = {
    "messages": [],
    "replies": [],
}


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Ensure upload folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Initialize extensions
    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.jobs import jobs_bp
    from app.routes.applications import applications_bp
    from app.routes.notifications import notifications_bp
    from app.routes.resume import resume_bp
    from app.routes.community import community_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(applications_bp, url_prefix="/api/applications")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(resume_bp, url_prefix="/api/resume")
    app.register_blueprint(community_bp, url_prefix="/api/community")

    # Create tables and seed
    with app.app_context():
        db.create_all()
        from app.seed import seed_data
        seed_data()

    return app
