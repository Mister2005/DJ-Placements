from datetime import date, timedelta, datetime
from werkzeug.security import generate_password_hash
from app import db, community_store
from app.models import User, Job, Notification, NotificationPreference, Application


def seed_data():
    """Seed the database with initial data if empty."""
    if User.query.first() is not None:
        return

    demo_user = User(
        name="Student Demo",
        email="student@college.edu",
        password_hash=generate_password_hash("password123"),
        phone="+91-9876543210",
        cgpa=8.2,
        branch="Computer Science",
        current_year="Final Year",
        skills=["Python", "JavaScript", "React", "Node.js", "SQL"],
        resume_uploaded=False,
    )
    db.session.add(demo_user)
    db.session.flush()

    prefs = NotificationPreference(user_id=demo_user.id, email_jobs=True, push_updates=True, deadline_emails=True, newsletter=False)
    db.session.add(prefs)

    today = date.today()

    from app.jobs_data import get_all_jobs
    jobs_data = get_all_jobs(today)

    for jd in jobs_data:
        db.session.add(Job(**jd))
    db.session.flush()

    all_jobs = Job.query.all()
    app1 = Application(user_id=demo_user.id, job_id=all_jobs[0].id, status="shortlisted", applied_date=datetime.utcnow() - timedelta(days=5), last_update=datetime.utcnow() - timedelta(days=2))
    app2 = Application(user_id=demo_user.id, job_id=all_jobs[1].id, status="interview_scheduled", applied_date=datetime.utcnow() - timedelta(days=10), last_update=datetime.utcnow() - timedelta(days=1))
    app3 = Application(user_id=demo_user.id, job_id=all_jobs[2].id, status="applied", applied_date=datetime.utcnow() - timedelta(days=3), last_update=datetime.utcnow() - timedelta(days=3))
    db.session.add_all([app1, app2, app3])

    notifications = [
        Notification(user_id=demo_user.id, title="New Job Posted", message="Google has posted Software Engineer - Cloud Infrastructure.", type="job"),
        Notification(user_id=demo_user.id, title="Shortlisted!", message="You have been shortlisted for Google - Software Engineer.", type="application"),
        Notification(user_id=demo_user.id, title="Deadline Alert", message="Flipkart Full Stack Intern closes in 3 days.", type="deadline"),
        Notification(user_id=demo_user.id, title="Interview Scheduled", message="Microsoft PM interview scheduled for next week.", type="application"),
    ]
    for n in notifications:
        db.session.add(n)

    db.session.commit()

    community_store["messages"] = [
        {"id": 1, "author": "Placement Coordinator", "user_id": 0, "message": "Welcome to PlaceHub community! Ask placement questions here.", "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat(), "replies": 3, "is_coordinator": True},
        {"id": 2, "author": "Akshay Sharma", "user_id": 0, "message": "Cleared Google phone screen! 2 medium LC problems (sliding window + BFS). Think out loud.", "timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat(), "replies": 5, "is_coordinator": False},
        {"id": 3, "author": "Priya Menon", "user_id": 0, "message": "Got Amazon offer! LP round was hardest — prepare 8-10 STAR stories.", "timestamp": datetime.utcnow().isoformat(), "replies": 2, "is_coordinator": False},
    ]


def _get_jobs_data(today):
    """Return list of 50 unique job dictionaries."""
    return [
        {"company": "Google", "role": "Software Engineer - Cloud Infrastructure", "domain": "Software", "location": "Bangalore", "salary": "₹15-20 LPA", "job_type": "Full-time", "skills": ["Python", "Go", "Kubernetes", "Docker", "System Design", "Distributed Systems", "gRPC", "Linux"], "last_date_to_apply": today + timedelta(days=10), "description": "Build and operate Google Cloud Platform's core compute and networking stack. Design fault-tolerant distributed systems handling millions of requests per second across global data centers. Write performance-critical code in Go and Python, operate large-scale Kubernetes clusters, and maintain 99.99% uptime SLAs.", "eligibility": "B.Tech/M.Tech in CS/IT with 7+ CGPA", "responsibilities": ["Design horizontally scalable microservices", "Own full lifecycle from design to production", "Optimize p99 latency under 50ms", "Lead incident response"], "benefits": ["₹15-20 LPA + RSUs", "Health insurance", "20% time for projects", "₹2L learning budget"], "about_company": "Google Cloud serves millions of organizations worldwide."},
        {"company": "Microsoft", "role": "Product Manager - Azure DevOps", "domain": "Product", "location": "Pune", "salary": "₹18-25 LPA", "job_type": "Full-time", "skills": ["Product Strategy", "SQL", "Analytics", "Leadership", "Agile", "Communication", "Data Analysis", "Stakeholder Management"], "last_date_to_apply": today + timedelta(days=15), "description": "Own the CI/CD pipeline experience used by 500,000+ development teams globally. Synthesize customer research, usage telemetry, and competitive analysis into a coherent product roadmap. Sit with engineering daily, make scope tradeoffs in real-time, and present quarterly plans to CVPs.", "eligibility": "Any engineering degree with 2+ years product experience", "responsibilities": ["Own product roadmap for Azure Pipelines", "Run weekly customer calls", "Define success metrics", "Coordinate cross-team dependencies"], "benefits": ["₹18-25 LPA + bonus", "ESPP 15% discount", "Unlimited sick leave", "MBA sponsorship"], "about_company": "Microsoft Azure is the world's second-largest cloud platform."},
        {"company": "Amazon", "role": "Data Analyst - Supply Chain", "domain": "Data", "location": "Hyderabad", "salary": "₹10-15 LPA", "job_type": "Full-time", "skills": ["SQL", "Python", "Excel", "Tableau", "Statistics", "Data Analysis", "ETL", "Pandas"], "last_date_to_apply": today + timedelta(days=5), "description": "Analyze movement of 12 billion packages annually across 185 fulfillment centers. Build automated Tableau dashboards surfacing anomalies. Write complex queries against petabyte-scale Redshift warehouses joining shipment records, inventory snapshots, and demand forecasts.", "eligibility": "B.Tech/M.Tech any stream with 6.5+ CGPA", "responsibilities": ["Build 15+ Tableau dashboards", "Write optimized SQL on 500M+ rows", "Develop Python ETL pipelines", "Present weekly business reviews"], "benefits": ["₹10-15 LPA", "₹1.5L sign-on bonus", "Health insurance", "Internal transfer to ML roles"], "about_company": "Amazon's supply chain delivers to 100+ countries."},
        {"company": "Flipkart", "role": "Full Stack Engineering Intern", "domain": "Software", "location": "Bangalore", "salary": "₹50,000/month", "job_type": "Internship", "skills": ["React", "Node.js", "MongoDB", "JavaScript", "HTML", "CSS", "Git", "REST"], "last_date_to_apply": today + timedelta(days=3), "description": "6-month internship building features for 400 million users. Ship production code through the same review process as full-time engineers. Past interns built the Similar Products widget, order tracking redesign, and seller rating microservice.", "eligibility": "Currently pursuing B.Tech 3rd/4th year CS/IT", "responsibilities": ["Build end-to-end features", "Write Jest tests", "Participate in daily standups", "Present in monthly all-hands"], "benefits": ["₹50K/month stipend", "PPO ₹18-24 LPA", "Free meals", "MacBook provided"], "about_company": "Flipkart processes 10 million orders daily during sales."},
        {"company": "Meta", "role": "Backend Engineer - Messaging", "domain": "Software", "location": "Delhi", "salary": "₹25-35 LPA", "job_type": "Full-time", "skills": ["C++", "Python", "Distributed Systems", "Databases", "API Design", "System Design", "Linux", "Networking"], "last_date_to_apply": today + timedelta(days=2), "description": "Build systems delivering 100 billion messages per day across WhatsApp, Messenger, and Instagram DMs. Work on the storage and delivery layer ensuring exactly-once delivery even when recipients are offline for days. Write C++ for hot paths and Python for tooling.", "eligibility": "B.Tech/M.Tech CS with 7.5+ CGPA", "responsibilities": ["Design message storage at 10M+ writes/sec", "Optimize p99 delivery < 500ms globally", "Build chaos engineering tools", "Contribute to open-source (Folly, RocksDB)"], "benefits": ["₹25-35 LPA + RSUs", "15-25% annual bonus", "Unlimited PTO", "₹5L wellness budget"], "about_company": "Meta's messaging connects 3 billion people daily."},
        {"company": "Apple", "role": "iOS Developer - Health & Fitness", "domain": "Software", "location": "Mumbai", "salary": "₹22-28 LPA", "job_type": "Full-time", "skills": ["Swift", "iOS", "UIKit", "SwiftUI", "Core Data", "Xcode", "HealthKit", "Objective-C"], "last_date_to_apply": today + timedelta(days=20), "description": "Build next-generation health monitoring features for Apple Watch and iPhone. Deep integration with HealthKit, CoreMotion, and custom sensor fusion algorithms. All processing on-device for privacy — no cloud dependency.", "eligibility": "B.Tech/M.Tech CS/IT with 7+ CGPA", "responsibilities": ["Implement health features using HealthKit", "Build SwiftUI interfaces", "Optimize battery < 2% daily", "Write XCTest suites 90%+ coverage"], "benefits": ["₹22-28 LPA + RSUs", "25% Apple discount", "₹3L education budget", "On-site fitness center"], "about_company": "Apple Health used by 150 million people worldwide."},
        {"company": "Goldman Sachs", "role": "Quantitative Strategist", "domain": "Finance", "location": "Bangalore", "salary": "₹20-28 LPA", "job_type": "Full-time", "skills": ["Python", "C++", "Statistics", "Machine Learning", "Financial Modeling", "Mathematics", "R", "Quantitative Analysis"], "last_date_to_apply": today + timedelta(days=8), "description": "Develop mathematical models pricing exotic options, calculating risk sensitivities (Greeks), and generating hedging strategies for a $50 billion portfolio. Work at the intersection of stochastic calculus, numerical methods, and high-performance computing.", "eligibility": "B.Tech/M.Tech with strong math, 8+ CGPA", "responsibilities": ["Develop pricing models for derivatives", "Implement C++ pricing engines sub-ms latency", "Build Python calibration tools", "Present to risk committees"], "benefits": ["₹20-28 LPA + 30-80% bonus", "Stock purchase plan", "CFA/FRM sponsorship", "Global rotation program"], "about_company": "Goldman Sachs is a leading global financial institution."},
    ]
