"""
Master skills dictionary — single source of truth.
All skills in the system must come from this list.
150 curated technical skills.
"""

SKILLS = [
    # Programming Languages (20)
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C", "C#", "Go",
    "Rust", "Swift", "Kotlin", "PHP", "Ruby", "Scala", "R", "MATLAB",
    "Dart", "Haskell", "Elixir", "Objective-C",
    # Frontend (15)
    "React", "Angular", "Vue.js", "Next.js", "Svelte", "HTML", "CSS",
    "Tailwind CSS", "Bootstrap", "Redux", "TypeScript", "Webpack", "Vite",
    "jQuery", "Sass",
    # Backend (15)
    "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot",
    "Ruby on Rails", "Laravel", "ASP.NET", "NestJS", "GraphQL", "gRPC",
    "REST APIs", "WebSockets", "Microservices",
    # Databases (12)
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch",
    "Cassandra", "DynamoDB", "Firebase", "SQLite", "Oracle DB", "Neo4j",
    # Cloud & DevOps (15)
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible",
    "Jenkins", "GitHub Actions", "CI/CD", "Linux", "Nginx", "Serverless",
    "Prometheus", "Grafana",
    # Data & ML (20)
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras",
    "Scikit-learn", "Pandas", "NumPy", "NLP", "Computer Vision",
    "Data Analysis", "Data Visualization", "Tableau", "Power BI",
    "Apache Spark", "Hadoop", "Airflow", "Statistics", "ETL", "MLOps",
    # Mobile (8)
    "Android", "iOS", "React Native", "Flutter", "SwiftUI", "UIKit",
    "Jetpack Compose", "Xcode",
    # Systems (12)
    "System Design", "Distributed Systems", "Operating Systems",
    "Networking", "Kafka", "RabbitMQ", "Concurrency", "Algorithms",
    "Data Structures", "API Design", "Low Latency", "Caching",
    # Security (5)
    "Cybersecurity", "OAuth", "JWT", "Encryption", "Penetration Testing",
    # Testing (6)
    "Unit Testing", "Selenium", "Jest", "Cypress", "PyTest", "TDD",
    # Tools (8)
    "Git", "Agile", "Scrum", "Jira", "Figma", "Postman", "Linux CLI", "VS Code",
    # Product & Business (6)
    "Product Strategy", "Product Management", "Analytics",
    "Stakeholder Management", "Communication", "Leadership",
    # Finance (5)
    "Financial Modeling", "Quantitative Analysis", "Risk Management",
    "Algorithmic Trading", "Monte Carlo Simulation",
    # Embedded & Hardware (5)
    "Embedded Systems", "RTOS", "ARM Architecture", "FPGA", "IoT",
]

# Remove duplicates and build lookup
_seen = set()
_unique = []
for s in SKILLS:
    if s.lower() not in _seen:
        _seen.add(s.lower())
        _unique.append(s)
SKILLS = _unique

# Lowercase lookup for fast matching
SKILLS_LOWER = {s.lower(): s for s in SKILLS}
