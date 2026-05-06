from datetime import datetime
from app import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    phone = db.Column(db.String(20), default="")
    cgpa = db.Column(db.Float, default=0.0)
    branch = db.Column(db.String(100), default="")
    current_year = db.Column(db.String(50), default="")
    skills = db.Column(db.JSON, default=list)
    resume_uploaded = db.Column(db.Boolean, default=False)
    resume_filename = db.Column(db.String(255), default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    applications = db.relationship("Application", backref="user", lazy=True)
    bookmarks = db.relationship("Bookmark", backref="user", lazy=True)
    notification_prefs = db.relationship(
        "NotificationPreference", backref="user", uselist=False, lazy=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "cgpa": self.cgpa,
            "branch": self.branch,
            "current_year": self.current_year,
            "skills": self.skills or [],
            "resume_uploaded": self.resume_uploaded,
            "resume_filename": self.resume_filename,
        }


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(200), nullable=False)
    domain = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    salary = db.Column(db.String(100), nullable=False)
    job_type = db.Column(db.String(50), nullable=False)
    skills = db.Column(db.JSON, nullable=False)
    last_date_to_apply = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text, nullable=False)
    eligibility = db.Column(db.String(500), nullable=False)
    responsibilities = db.Column(db.JSON, default=list)
    benefits = db.Column(db.JSON, default=list)
    about_company = db.Column(db.Text, default="")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    applications = db.relationship("Application", backref="job", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "company": self.company,
            "role": self.role,
            "domain": self.domain,
            "location": self.location,
            "salary": self.salary,
            "job_type": self.job_type,
            "skills": self.skills or [],
            "last_date_to_apply": self.last_date_to_apply.isoformat(),
            "description": self.description,
            "eligibility": self.eligibility,
            "responsibilities": self.responsibilities or [],
            "benefits": self.benefits or [],
            "about_company": self.about_company,
            "created_at": self.created_at.isoformat(),
        }


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    status = db.Column(db.String(50), default="applied")
    applied_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_update = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        job = Job.query.get(self.job_id)
        return {
            "id": self.id,
            "job_id": self.job_id,
            "company": job.company if job else "",
            "role": job.role if job else "",
            "status": self.status,
            "applied_date": self.applied_date.isoformat(),
            "last_update": self.last_update.isoformat(),
            "timeline": self._get_timeline(),
        }

    def _get_timeline(self):
        stages = [
            {"stage": "Applied", "date": self.applied_date.isoformat(), "completed": True}
        ]

        if self.status in ("shortlisted", "interview_scheduled", "selected", "rejected"):
            stages.append(
                {"stage": "Shortlisted", "date": self.last_update.isoformat(), "completed": True}
            )

        if self.status in ("interview_scheduled", "selected", "rejected"):
            stages.append(
                {"stage": "Interview", "date": self.last_update.isoformat(), "completed": True}
            )

        if self.status == "selected":
            stages.append(
                {"stage": "Selected", "date": self.last_update.isoformat(), "completed": True}
            )
        elif self.status == "rejected":
            stages.append(
                {"stage": "Rejected", "date": self.last_update.isoformat(), "completed": True}
            )
        else:
            # Add pending stages
            if self.status == "applied":
                stages.append({"stage": "Under Review", "date": None, "completed": False})
                stages.append({"stage": "Shortlist Decision", "date": None, "completed": False})
            elif self.status == "shortlisted":
                stages.append({"stage": "Interview", "date": None, "completed": False})
                stages.append({"stage": "Final Decision", "date": None, "completed": False})
            elif self.status == "interview_scheduled":
                stages.append({"stage": "Final Decision", "date": None, "completed": False})

        return stages


class Bookmark(db.Model):
    __tablename__ = "bookmarks"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint("user_id", "job_id"),)

    def to_dict(self):
        return {
            "id": self.id,
            "job_id": self.job_id,
            "created_at": self.created_at.isoformat(),
        }


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default="info")
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat(),
        }


class NotificationPreference(db.Model):
    __tablename__ = "notification_preferences"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    email_jobs = db.Column(db.Boolean, default=True)
    push_updates = db.Column(db.Boolean, default=True)
    deadline_emails = db.Column(db.Boolean, default=True)
    newsletter = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "email_jobs": self.email_jobs,
            "push_updates": self.push_updates,
            "deadline_emails": self.deadline_emails,
            "newsletter": self.newsletter,
        }
