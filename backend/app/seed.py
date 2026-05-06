from datetime import date, timedelta, datetime
from werkzeug.security import generate_password_hash
from app import db, community_store
from app.models import User, Job, Notification, NotificationPreference, Application


def seed_data():
    """Seed the database with initial data if empty."""
    if User.query.first() is not None:
        return

    # Create demo user
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

    prefs = NotificationPreference(
        user_id=demo_user.id,
        email_jobs=True,
        push_updates=True,
        deadline_emails=True,
        newsletter=False,
    )
    db.session.add(prefs)

    today = date.today()

    jobs = [
        Job(
            company="Google",
            role="Software Engineer - Cloud Infrastructure",
            domain="Software",
            location="Bangalore",
            salary="₹15-20 LPA",
            job_type="Full-time",
            skills=["Python", "Go", "Kubernetes", "Docker", "System Design", "Distributed Systems", "gRPC", "Linux"],
            last_date_to_apply=today + timedelta(days=10),
            description="""We are hiring Software Engineers for our Cloud Infrastructure division in Bangalore. You will work on Google Cloud Platform's core compute and networking stack, building services that handle millions of requests per second across global data centers.

Your day-to-day will involve designing fault-tolerant distributed systems, writing performance-critical code in Go and Python, and operating large-scale Kubernetes clusters. You'll collaborate with SRE teams to maintain 99.99% uptime SLAs and participate in on-call rotations.

We value engineers who think in systems — understanding how a single code change propagates through load balancers, service meshes, and storage layers. You should be comfortable reading RFCs, writing design documents, and defending architectural decisions in review meetings.

The ideal candidate has built and operated production services at scale, understands the CAP theorem beyond textbook definitions, and can debug a latency spike by reading flame graphs and distributed traces.""",
            eligibility="B.Tech/M.Tech in CS/IT with 7+ CGPA. Strong fundamentals in operating systems and networking.",
            responsibilities=[
                "Design and implement horizontally scalable microservices for GCP compute products",
                "Own the full lifecycle from design doc to production deployment and monitoring",
                "Optimize critical path latency — target p99 under 50ms for API endpoints",
                "Conduct capacity planning and lead incident response for your services",
                "Mentor junior engineers through code reviews and architecture discussions",
            ],
            benefits=[
                "Base salary ₹15-20 LPA + RSUs vesting over 4 years",
                "Comprehensive health insurance covering family",
                "20% time for personal projects and open-source contributions",
                "Annual learning budget of ₹2L for conferences and courses",
                "Relocation support and flexible hybrid work policy",
            ],
            about_company="Google Cloud serves millions of organizations worldwide, providing compute, storage, networking, and AI/ML infrastructure.",
        ),
        Job(
            company="Microsoft",
            role="Product Manager - Azure DevOps",
            domain="Product",
            location="Pune",
            salary="₹18-25 LPA",
            job_type="Full-time",
            skills=["Product Strategy", "SQL", "Analytics", "Leadership", "Agile", "Communication", "Data Analysis", "Stakeholder Management"],
            last_date_to_apply=today + timedelta(days=15),
            description="""Microsoft's Azure DevOps team in Pune is looking for a Product Manager to own the CI/CD pipeline experience used by 500,000+ development teams globally. You will define what we build next by synthesizing customer research, usage telemetry, and competitive analysis into a coherent product roadmap.

This is not a role where you write specs and throw them over the wall. You'll sit with engineering daily, make scope tradeoffs in real-time, and present quarterly plans to CVPs. You need to be equally comfortable analyzing a SQL query showing adoption funnels and whiteboarding a user journey with designers.

The Azure DevOps product has a unique challenge: our users are developers, which means they have strong opinions, file detailed bug reports, and will call out bad UX on Twitter within hours of a release. You need thick skin, fast iteration cycles, and a genuine love for developer tools.

Success in this role means shipping features that move our monthly active user count, reducing time-to-value for new customers, and maintaining an NPS above 50 in a competitive market against GitHub Actions and GitLab CI.""",
            eligibility="Any engineering degree. 2+ years in product or technical program management. Strong analytical and communication skills.",
            responsibilities=[
                "Own the product roadmap for Azure Pipelines — prioritize across 200+ feature requests",
                "Run weekly customer calls and synthesize feedback into actionable insights",
                "Define success metrics and build dashboards tracking feature adoption",
                "Coordinate cross-team dependencies with Azure Repos, Boards, and Artifacts teams",
                "Write clear PRDs with acceptance criteria that engineering can execute against",
            ],
            benefits=[
                "₹18-25 LPA base + annual bonus (15-20% of base)",
                "ESPP with 15% discount on Microsoft stock",
                "Unlimited sick leave and 30 days PTO",
                "Sponsorship for MBA/executive education programs",
                "Hybrid work — 3 days office, 2 days remote",
            ],
            about_company="Microsoft Azure is the world's second-largest cloud platform, serving enterprises across 60+ regions globally.",
        ),
        Job(
            company="Amazon",
            role="Data Analyst - Supply Chain Intelligence",
            domain="Data",
            location="Hyderabad",
            salary="₹10-15 LPA",
            job_type="Full-time",
            skills=["SQL", "Python", "Excel", "Tableau", "Statistics", "Data Analysis", "ETL", "Pandas"],
            last_date_to_apply=today + timedelta(days=5),
            description="""Amazon's Supply Chain Intelligence team in Hyderabad analyzes the movement of 12 billion packages annually across 185 fulfillment centers. As a Data Analyst, you will build the analytical foundation that helps operations leaders decide where to place inventory, how to route shipments, and when to scale warehouse capacity.

Your primary tool is SQL — you'll write complex queries against petabyte-scale data warehouses (Redshift) joining shipment records, inventory snapshots, and demand forecasts. Beyond querying, you'll build automated Tableau dashboards that surface anomalies before they become customer-impacting events.

A typical week involves: Monday analyzing why a specific fulfillment center's throughput dropped 8%, Tuesday building a Python script to automate a manual Excel report, Wednesday presenting findings to an operations VP, Thursday designing an A/B test for a new routing algorithm, Friday documenting your methodology for the team wiki.

We need someone who treats data quality as a first-class concern — you should be the person who notices when a metric looks "too good" and investigates whether it's a real improvement or a logging bug.""",
            eligibility="B.Tech/M.Tech in any stream with 6.5+ CGPA. Demonstrated SQL proficiency required.",
            responsibilities=[
                "Build and maintain 15+ Tableau dashboards tracking supply chain KPIs",
                "Write optimized SQL queries processing 500M+ row datasets daily",
                "Develop Python ETL pipelines for data cleaning and transformation",
                "Conduct root cause analysis for operational anomalies within 24-hour SLA",
                "Present weekly business reviews to senior leadership with actionable recommendations",
            ],
            benefits=[
                "₹10-15 LPA with annual performance-based increment",
                "Sign-on bonus of ₹1.5L",
                "Health insurance for self, spouse, and parents",
                "Employee discount on Amazon purchases",
                "Internal transfer opportunities to ML/DS roles after 18 months",
            ],
            about_company="Amazon's supply chain is one of the most complex logistics networks ever built, delivering to 100+ countries with same-day and next-day options.",
        ),
        Job(
            company="Flipkart",
            role="Full Stack Engineering Intern",
            domain="Software",
            location="Bangalore",
            salary="₹50,000/month",
            job_type="Internship",
            skills=["React", "Node.js", "MongoDB", "JavaScript", "HTML", "CSS", "Git", "REST"],
            last_date_to_apply=today + timedelta(days=3),
            description="""Flipkart's Consumer Experience team is offering a 6-month internship for students who want to build features used by 400 million registered users. This is not a "make a landing page" internship — you will ship production code that goes through the same review process as full-time engineers.

Past interns have built: the "Similar Products" recommendation widget on product pages, the order tracking timeline redesign, and the seller rating aggregation microservice. Your project will be scoped to be completable in 6 months but impactful enough to be a talking point in your career.

Tech stack: React 18 with TypeScript on the frontend, Node.js with Express on the backend, MongoDB for flexible document storage, and Redis for caching. You'll deploy via Flipkart's internal CI/CD platform (built on Kubernetes) and monitor your service using Grafana dashboards.

We pair every intern with a senior engineer mentor who does weekly 1:1s, reviews your design docs, and helps you navigate the codebase. You'll also join a cohort of 20 interns with shared social events and a final demo day where leadership attends.""",
            eligibility="Currently pursuing B.Tech (3rd or 4th year) in CS/IT/ECE. Must be available full-time for 6 months.",
            responsibilities=[
                "Build end-to-end features: database schema → API → React UI → deployment",
                "Write unit tests (Jest) and integration tests for all new code",
                "Participate in daily standups and bi-weekly sprint planning",
                "Present your project progress in monthly engineering all-hands",
                "Document your work in Confluence for future team reference",
            ],
            benefits=[
                "₹50,000/month stipend (among highest for internships in India)",
                "Pre-placement offer (PPO) for top performers — ₹18-24 LPA CTC",
                "Free lunch and dinner at office cafeteria",
                "MacBook Pro provided for the internship duration",
                "Certificate of completion and LinkedIn recommendation from mentor",
            ],
            about_company="Flipkart is India's largest e-commerce company, processing 10 million orders daily during sale events.",
        ),
        Job(
            company="Meta",
            role="Backend Engineer - Messaging Infrastructure",
            domain="Software",
            location="Delhi",
            salary="₹25-35 LPA",
            job_type="Full-time",
            skills=["C++", "Python", "Distributed Systems", "Databases", "API Design", "System Design", "Linux", "Networking"],
            last_date_to_apply=today + timedelta(days=2),
            description="""Meta's Messaging Infrastructure team builds the systems that deliver 100 billion messages per day across WhatsApp, Messenger, and Instagram DMs. We're hiring Backend Engineers in our Delhi office to work on the storage and delivery layer — the part that ensures your message arrives exactly once, in order, even when the recipient's phone has been offline for 3 days.

The technical challenges here are unlike anything in a typical web application. We operate at a scale where a 0.001% failure rate means 1 million lost messages per day. Our systems must handle network partitions gracefully, replicate data across continents with sub-second lag, and do all of this while keeping per-message cost below $0.00001.

You'll write C++ for the hot path (message routing and storage) and Python for tooling, testing, and data analysis. You'll need to understand memory allocation patterns, lock-free data structures, and how to squeeze every microsecond out of a critical section.

This role requires someone who has opinions about consistency models, can explain the difference between linearizability and causal consistency, and has debugged production issues where the root cause was a kernel parameter misconfiguration.""",
            eligibility="B.Tech/M.Tech in CS with 7.5+ CGPA. Systems programming experience required.",
            responsibilities=[
                "Design and implement message storage systems handling 10M+ writes/second",
                "Optimize end-to-end message delivery latency (target: p99 < 500ms globally)",
                "Build chaos engineering tools to validate system resilience",
                "Contribute to open-source projects (Folly, RocksDB) used by the team",
                "Participate in cross-team architecture reviews for new messaging features",
            ],
            benefits=[
                "₹25-35 LPA base + RSUs (significant equity component)",
                "Annual bonus of 15-25% based on performance rating",
                "Unlimited PTO with minimum 25 days encouraged",
                "₹5L annual wellness budget (gym, therapy, hobbies)",
                "Bi-annual team offsites (previous: Bali, Iceland, Japan)",
            ],
            about_company="Meta's messaging platforms connect 3 billion people daily, making it the largest real-time communication system ever built.",
        ),
        Job(
            company="Apple",
            role="iOS Developer - Health & Fitness",
            domain="Software",
            location="Mumbai",
            salary="₹22-28 LPA",
            job_type="Full-time",
            skills=["Swift", "iOS", "UIKit", "SwiftUI", "Core Data", "Xcode", "HealthKit", "Objective-C"],
            last_date_to_apply=today + timedelta(days=20),
            description="""Apple's Health & Fitness team in Mumbai is building the next generation of health monitoring features for Apple Watch and iPhone. As an iOS Developer, you'll work on features that have literally saved lives — Fall Detection, irregular heart rhythm notifications, and Crash Detection were all built by teams like ours.

Your work will involve deep integration with HealthKit, CoreMotion, and custom sensor fusion algorithms. You'll write Swift code that runs on-device (no cloud dependency for privacy), processes real-time sensor data, and presents insights through beautiful SwiftUI interfaces that feel effortless to use.

Privacy is not an afterthought here — it's a design constraint. Every feature you build must work without sending health data to Apple's servers. This means on-device ML inference, local-only data storage with hardware encryption, and careful API design that prevents third-party apps from accessing sensitive information.

We ship software to 1.5 billion active devices. A bug in your code could trigger a false health alert for millions of people. We take testing seriously: unit tests, UI tests, performance tests, and a 6-week internal dogfooding period before any public release.""",
            eligibility="B.Tech/M.Tech in CS/IT with 7+ CGPA. Published iOS apps or significant Swift/Objective-C projects required.",
            responsibilities=[
                "Implement health monitoring features using HealthKit and CoreMotion APIs",
                "Build responsive SwiftUI interfaces that adapt to Watch, iPhone, and iPad",
                "Optimize battery consumption — health features must use < 2% daily battery",
                "Write comprehensive XCTest suites with 90%+ code coverage requirement",
                "Collaborate with ML team to integrate on-device inference models",
            ],
            benefits=[
                "₹22-28 LPA with annual RSU refresh grants",
                "25% employee discount on all Apple products",
                "₹3L annual education reimbursement (courses, certifications, conferences)",
                "On-site fitness center and wellness programs",
                "Relocation package including 3 months temporary housing",
            ],
            about_company="Apple Health features are used by 150 million people worldwide, with Apple Watch being the #1 selling watch globally.",
        ),
        Job(
            company="Goldman Sachs",
            role="Quantitative Strategist - Derivatives Pricing",
            domain="Finance",
            location="Bangalore",
            salary="₹20-28 LPA",
            job_type="Full-time",
            skills=["Python", "C++", "Statistics", "Machine Learning", "Financial Modeling", "Mathematics", "R", "Quantitative Analysis"],
            last_date_to_apply=today + timedelta(days=8),
            description="""Goldman Sachs' Securities Division in Bangalore is hiring Quantitative Strategists to work on derivatives pricing models. You will develop mathematical models that price exotic options, calculate risk sensitivities (Greeks), and generate hedging strategies for a $50 billion notional portfolio.

This role sits at the intersection of mathematics, programming, and finance. A typical day might involve: deriving a closed-form solution for a barrier option under stochastic volatility, implementing it in C++ with SIMD optimizations for real-time pricing, validating it against Monte Carlo simulations in Python, and explaining the model assumptions to a trader who needs to quote a client in 30 minutes.

You'll work with stochastic calculus (Itô's lemma, Girsanov's theorem), numerical methods (finite differences, Monte Carlo with variance reduction), and machine learning (neural network approximations for expensive calibration routines). The math is graduate-level, but we care more about your ability to translate theory into robust production code than about publishing papers.

Our pricing library processes 2 million valuations per day. Correctness is non-negotiable — a pricing error of 0.1% on a $100M trade is a $100K loss. You'll write extensive unit tests, implement numerical stability checks, and participate in model validation reviews with our risk team.""",
            eligibility="B.Tech/M.Tech with strong mathematics background (8+ CGPA). Coursework in probability, stochastic processes, or numerical methods preferred.",
            responsibilities=[
                "Develop and maintain pricing models for equity and FX derivatives",
                "Implement high-performance C++ pricing engines with sub-millisecond latency",
                "Build Python tools for model calibration, backtesting, and P&L attribution",
                "Collaborate with traders to understand hedging requirements and model limitations",
                "Present model methodology to risk committees and regulators",
            ],
            benefits=[
                "₹20-28 LPA base + discretionary bonus (typically 30-80% of base)",
                "Goldman Sachs stock purchase plan at discounted rate",
                "Comprehensive health coverage including mental health support",
                "CFA/FRM exam sponsorship and study leave",
                "Global mobility program — opportunity to rotate to London/NYC/HK offices",
            ],
            about_company="Goldman Sachs is a leading global financial institution providing investment banking, securities, and investment management services to corporations, governments, and individuals worldwide.",
        ),
    ]

    for job in jobs:
        db.session.add(job)
    db.session.flush()

    # Sample applications
    app1 = Application(user_id=demo_user.id, job_id=jobs[0].id, status="shortlisted", applied_date=datetime.utcnow() - timedelta(days=5), last_update=datetime.utcnow() - timedelta(days=2))
    app2 = Application(user_id=demo_user.id, job_id=jobs[1].id, status="interview_scheduled", applied_date=datetime.utcnow() - timedelta(days=10), last_update=datetime.utcnow() - timedelta(days=1))
    app3 = Application(user_id=demo_user.id, job_id=jobs[2].id, status="applied", applied_date=datetime.utcnow() - timedelta(days=3), last_update=datetime.utcnow() - timedelta(days=3))
    db.session.add_all([app1, app2, app3])

    # Notifications
    notifications = [
        Notification(user_id=demo_user.id, title="New Job Posted", message="Google has posted Software Engineer - Cloud Infrastructure.", type="job"),
        Notification(user_id=demo_user.id, title="Shortlisted!", message="You have been shortlisted for Google - Software Engineer.", type="application"),
        Notification(user_id=demo_user.id, title="Deadline Alert", message="Flipkart Full Stack Intern closes in 3 days — apply now!", type="deadline"),
        Notification(user_id=demo_user.id, title="Interview Scheduled", message="Microsoft PM interview scheduled for next week.", type="application"),
    ]
    for notif in notifications:
        db.session.add(notif)

    db.session.commit()

    # Seed community messages
    community_store["messages"] = [
        {
            "id": 1,
            "author": "Placement Coordinator",
            "user_id": 0,
            "message": "Welcome to the PlaceHub community! This is your space to ask questions, share interview experiences, and help each other. Placement coordinators are active here — tag your questions clearly.",
            "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat(),
            "replies": 3,
            "is_coordinator": True,
        },
        {
            "id": 2,
            "author": "Akshay Sharma",
            "user_id": 0,
            "message": "Just cleared Google's phone screen! They asked 2 medium LC problems (sliding window + BFS on graph). Took about 45 mins total. Tips: think out loud and discuss edge cases before coding.",
            "timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat(),
            "replies": 5,
            "is_coordinator": False,
        },
        {
            "id": 3,
            "author": "Priya Menon",
            "user_id": 0,
            "message": "Got my Amazon offer today! The LP (Leadership Principles) round was the hardest — prepare 8-10 STAR stories covering different principles. Technical rounds were standard DSA.",
            "timestamp": datetime.utcnow().isoformat(),
            "replies": 2,
            "is_coordinator": False,
        },
    ]
