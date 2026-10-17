from typing import Dict, List, Optional
from app.models.schemas import JobRoleDefinition, CompetencyRequirement

ROLE_CATALOG: Dict[str, JobRoleDefinition] = {
    "mle": JobRoleDefinition(
        id="mle",
        name="Machine Learning Engineer",
        domain="Artificial Intelligence & Machine Learning",
        description="Designs, builds, evaluates, packages, deploys, and monitors production machine learning pipelines and models.",
        competencies=[
            CompetencyRequirement(
                skill_id="python",
                name="Python Programming",
                category="Core Programming",
                importance_weight=0.95,
                expected_evidence_type="Modular code, clean functions/classes, type hints, PEP8 compliance",
                description="Idiomatic Python for data manipulation and modeling."
            ),
            CompetencyRequirement(
                skill_id="ml_modeling",
                name="Machine Learning Algorithms & Training",
                category="Modeling",
                importance_weight=0.90,
                expected_evidence_type="Model training scripts, baseline comparisons, cross-validation, hyperparameter tuning",
                description="Selecting and training supervised/unsupervised models using scikit-learn, XGBoost, or LightGBM."
            ),
            CompetencyRequirement(
                skill_id="model_evaluation",
                name="Model Evaluation & Leakage Prevention",
                category="Validation",
                importance_weight=0.85,
                expected_evidence_type="Confusion matrices, ROC-AUC, PR curves, strict train/val/test splits without target leakage",
                description="Validating generalization performance beyond naive accuracy."
            ),
            CompetencyRequirement(
                skill_id="api_development",
                name="Model Serving & REST APIs",
                category="Software Engineering",
                importance_weight=0.85,
                expected_evidence_type="FastAPI/Flask inference routes, Pydantic request/response schemas, error handling",
                description="Exposing trained models via reliable microservices."
            ),
            CompetencyRequirement(
                skill_id="testing",
                name="Automated Testing & Code Quality",
                category="Software Engineering",
                importance_weight=0.75,
                expected_evidence_type="pytest or unittest files testing data preprocessing, edge inputs, and model outputs",
                description="Automated tests ensuring reproducibility and robustness."
            ),
            CompetencyRequirement(
                skill_id="deployment",
                name="Containerization & Deployment",
                category="DevOps & MLOps",
                importance_weight=0.80,
                expected_evidence_type="Dockerfile, docker-compose.yml, cloud deployment configs, CI/CD pipeline",
                description="Packaging services into reproducible containers ready for production cloud hosting."
            ),
            CompetencyRequirement(
                skill_id="data_processing",
                name="Data Wrangling & Pipeline Engineering",
                category="Data",
                importance_weight=0.80,
                expected_evidence_type="pandas, numpy, polars data pipelines, feature engineering, missing value strategies",
                description="Handling raw data, cleaning, and feature transformations."
            ),
            CompetencyRequirement(
                skill_id="version_control_docs",
                name="Git Version Control & Documentation",
                category="Engineering Standards",
                importance_weight=0.70,
                expected_evidence_type="Structured commit history, comprehensive README with setup and architecture docs",
                description="Clear communication and team collaboration hygiene."
            )
        ],
        recommended_prerequisites=[
            "Data structures & algorithms in Python",
            "Linear algebra, multivariable calculus & probability",
            "Hands-on experience with scikit-learn & pandas"
        ]
    ),
    "java_backend": JobRoleDefinition(
        id="java_backend",
        name="Java Backend Developer",
        domain="Backend Engineering",
        description="Architects robust enterprise services, RESTful APIs, transactional databases, and microservices using Java and Spring Boot.",
        competencies=[
            CompetencyRequirement(
                skill_id="java",
                name="Core Java & OOP",
                category="Core Programming",
                importance_weight=0.95,
                expected_evidence_type="Solid OOP design, interfaces, exception hierarchy, collections framework, Java 17+",
                description="Modern Java fundamentals and design patterns."
            ),
            CompetencyRequirement(
                skill_id="spring_boot",
                name="Spring Boot & Spring Framework",
                category="Frameworks",
                importance_weight=0.90,
                expected_evidence_type="Spring Boot controllers, services, repositories, dependency injection, JPA/Hibernate",
                description="Building enterprise REST APIs and services with Spring Boot."
            ),
            CompetencyRequirement(
                skill_id="sql_database",
                name="Relational Databases & SQL",
                category="Data Persistence",
                importance_weight=0.85,
                expected_evidence_type="Schema migrations (Flyway/Liquibase), complex SQL queries, index optimization",
                description="PostgreSQL/MySQL transactional schema design and performance."
            ),
            CompetencyRequirement(
                skill_id="testing",
                name="Unit & Integration Testing",
                category="Quality",
                importance_weight=0.80,
                expected_evidence_type="JUnit 5, Mockito tests, Testcontainers, mockMvc integration tests",
                description="Comprehensive test coverage of service and controller layers."
            ),
            CompetencyRequirement(
                skill_id="api_security",
                name="API Security & Authentication",
                category="Security",
                importance_weight=0.80,
                expected_evidence_type="Spring Security, JWT token validation, role-based access control (RBAC)",
                description="Securing backend endpoints against unauthorized access."
            ),
            CompetencyRequirement(
                skill_id="deployment",
                name="Docker & Build Tooling",
                category="DevOps",
                importance_weight=0.75,
                expected_evidence_type="Maven/Gradle build files, multi-stage Dockerfile, container deployment",
                description="Automating builds and container packaging."
            )
        ],
        recommended_prerequisites=[
            "Data structures in Java",
            "Relational database design",
            "HTTP/REST conventions"
        ]
    ),
    "python_backend": JobRoleDefinition(
        id="python_backend",
        name="Python Backend Developer",
        domain="Backend Engineering",
        description="Develops scalable server-side systems, asynchronous APIs, ORMs, and background workers in Python.",
        competencies=[
            CompetencyRequirement(
                skill_id="python",
                name="Advanced Python & AsyncIO",
                category="Core Programming",
                importance_weight=0.95,
                expected_evidence_type="Async/await handlers, generators, decorators, typing, dataclasses",
                description="Deep mastery of modern asynchronous Python."
            ),
            CompetencyRequirement(
                skill_id="fastapi_django",
                name="FastAPI or Django / Flask",
                category="Web Frameworks",
                importance_weight=0.90,
                expected_evidence_type="Pydantic models, routers, middleware, dependency injection, REST endpoints",
                description="Building high-performance web APIs."
            ),
            CompetencyRequirement(
                skill_id="sql_database",
                name="SQL & ORM Persistence",
                category="Data",
                importance_weight=0.85,
                expected_evidence_type="SQLAlchemy/SQLModel, Alembic migrations, database indexing and connection pooling",
                description="Designing robust data models and querying efficiently."
            ),
            CompetencyRequirement(
                skill_id="testing",
                name="Automated Testing",
                category="Engineering Standards",
                importance_weight=0.80,
                expected_evidence_type="pytest fixtures, test coverage, mocking external services with httpx/respx",
                description="Maintaining regression test suites."
            ),
            CompetencyRequirement(
                skill_id="deployment",
                name="Docker & Cloud Hosting",
                category="DevOps",
                importance_weight=0.80,
                expected_evidence_type="Dockerfile, Gunicorn/Uvicorn configuration, environment configuration",
                description="Production server deployment."
            )
        ]
    ),
    "fullstack": JobRoleDefinition(
        id="fullstack",
        name="Full-Stack Developer",
        domain="Full Stack Engineering",
        description="Creates end-to-end web applications bridging modern responsive frontends with secure backend services.",
        competencies=[
            CompetencyRequirement(
                skill_id="frontend_framework",
                name="React / Next.js / TypeScript",
                category="Frontend",
                importance_weight=0.90,
                expected_evidence_type="React components, state management, hooks, TypeScript interfaces, responsive UI",
                description="Building interactive user interfaces."
            ),
            CompetencyRequirement(
                skill_id="backend_api",
                name="Node.js / Express / Python / Java API",
                category="Backend",
                importance_weight=0.90,
                expected_evidence_type="RESTful/GraphQL API endpoints, business logic, validation, authentication",
                description="Server-side API architecture."
            ),
            CompetencyRequirement(
                skill_id="sql_database",
                name="Database Design & Integration",
                category="Database",
                importance_weight=0.85,
                expected_evidence_type="PostgreSQL, MongoDB, Prisma, or Mongoose schemas, queries, migrations",
                description="Data modeling and querying."
            ),
            CompetencyRequirement(
                skill_id="api_security",
                name="Authentication & Authorization",
                category="Security",
                importance_weight=0.80,
                expected_evidence_type="JWT/session auth, CORS setup, secure password hashing, protected routes",
                description="End-to-end authentication flows."
            ),
            CompetencyRequirement(
                skill_id="deployment",
                name="Deployment & CI/CD",
                category="DevOps",
                importance_weight=0.75,
                expected_evidence_type="Vercel/Render/AWS deployment URL, GitHub Actions workflow, Dockerfile",
                description="Live application deployment."
            )
        ]
    ),
    "data_analyst": JobRoleDefinition(
        id="data_analyst",
        name="Data Analyst",
        domain="Data Analytics & BI",
        description="Transforms raw business data into actionable dashboards, insights, statistical summaries, and reports.",
        competencies=[
            CompetencyRequirement(
                skill_id="sql",
                name="Advanced SQL & Aggregations",
                category="Querying",
                importance_weight=0.95,
                expected_evidence_type="Window functions, CTEs, complex JOINs, GROUP BY aggregations, query tuning",
                description="Extracting insights from relational and analytical databases."
            ),
            CompetencyRequirement(
                skill_id="python_data",
                name="Python for Data Analysis (pandas/numpy)",
                category="Data Wrangling",
                importance_weight=0.85,
                expected_evidence_type="pandas dataframes, missing value handling, datetime manipulation, merges",
                description="Data cleaning and exploratory analysis."
            ),
            CompetencyRequirement(
                skill_id="visualization",
                name="Data Visualization & BI Dashboards",
                category="Communication",
                importance_weight=0.90,
                expected_evidence_type="Power BI / Tableau / Seaborn / Plotly interactive charts with clear business metrics",
                description="Translating numbers into visual executive insights."
            ),
            CompetencyRequirement(
                skill_id="statistics",
                name="Applied Statistics & Hypothesis Testing",
                category="Analysis",
                importance_weight=0.80,
                expected_evidence_type="A/B test analysis, p-values, confidence intervals, correlation vs causation",
                description="Rigorous statistical deduction."
            )
        ]
    ),
    "data_scientist": JobRoleDefinition(
        id="data_scientist",
        name="Data Scientist",
        domain="Data Science",
        description="Applies statistical learning, machine learning, predictive modeling, and feature engineering to solve complex business questions.",
        competencies=[
            CompetencyRequirement(
                skill_id="python",
                name="Python Programming",
                category="Core",
                importance_weight=0.90,
                expected_evidence_type="Structured notebooks or modular scripts, clean data handling",
                description="Core scientific programming."
            ),
            CompetencyRequirement(
                skill_id="statistical_modeling",
                name="Statistical Inference & Modeling",
                category="Statistics",
                importance_weight=0.90,
                expected_evidence_type="Regression, classification, hypothesis testing, experiment design",
                description="Deep understanding of distributions and mathematical modeling."
            ),
            CompetencyRequirement(
                skill_id="ml_modeling",
                name="Machine Learning Algorithms",
                category="ML",
                importance_weight=0.85,
                expected_evidence_type="Supervised & unsupervised models, cross-validation, hyperparameter tuning",
                description="Scikit-learn, XGBoost, clustering, ensemble models."
            ),
            CompetencyRequirement(
                skill_id="data_storytelling",
                name="Data Storytelling & Visualization",
                category="Business",
                importance_weight=0.80,
                expected_evidence_type="Compelling project report or presentation explaining business impact",
                description="Communicating findings to non-technical stakeholders."
            )
        ]
    ),
    "ai_engineer": JobRoleDefinition(
        id="ai_engineer",
        name="AI & Deep Learning Engineer",
        domain="Artificial Intelligence",
        description="Builds modern intelligent applications, neural pipelines, embeddings, semantic search, and autonomous workflows.",
        competencies=[
            CompetencyRequirement(
                skill_id="rag_pipelines",
                name="Information Retrieval & Vector Search",
                category="Intelligent Systems Architecture",
                importance_weight=0.95,
                expected_evidence_type="Chunking strategies, embedding generation, vector database queries, reranking",
                description="Building grounded question-answering systems over unstructured corpora."
            ),
            CompetencyRequirement(
                skill_id="llm_orchestration",
                name="Pipeline Orchestration & Tool Integration",
                category="AI Systems Engineering",
                importance_weight=0.90,
                expected_evidence_type="Structured output parsing (Pydantic/JSON), workflow graphs, function calling",
                description="Controlling execution pipelines, reasoning loops, and external tool integrations."
            ),
            CompetencyRequirement(
                skill_id="python",
                name="Python & Async API Development",
                category="Backend",
                importance_weight=0.85,
                expected_evidence_type="FastAPI endpoints, streaming responses (SSE), rate limiting",
                description="Serving AI applications."
            ),
            CompetencyRequirement(
                skill_id="evaluation_safety",
                name="LLM Evaluation & Guardrails",
                category="Safety & Quality",
                importance_weight=0.80,
                expected_evidence_type="Hallucination benchmarks, prompt injection defense, grounding checks",
                description="Ensuring AI outputs are factual and safe."
            )
        ]
    ),
    "devops": JobRoleDefinition(
        id="devops",
        name="DevOps Engineer",
        domain="Infrastructure & Automation",
        description="Automates infrastructure provisioning, CI/CD pipelines, container orchestration, and system observability.",
        competencies=[
            CompetencyRequirement(
                skill_id="docker_kubernetes",
                name="Docker & Container Orchestration",
                category="Containers",
                importance_weight=0.95,
                expected_evidence_type="Multi-stage Dockerfiles, Kubernetes manifests, Helm charts",
                description="Packaging and scaling microservices."
            ),
            CompetencyRequirement(
                skill_id="cicd_pipelines",
                name="CI/CD Pipeline Automation",
                category="Automation",
                importance_weight=0.90,
                expected_evidence_type="GitHub Actions or GitLab CI workflows with linting, testing, and deployment stages",
                description="Continuous integration and delivery."
            ),
            CompetencyRequirement(
                skill_id="cloud_infra",
                name="Cloud Infrastructure & Terraform (IaC)",
                category="Cloud",
                importance_weight=0.85,
                expected_evidence_type="AWS/GCP resources, Terraform/OpenTofu HCL code, VPCs, IAM security",
                description="Infrastructure as Code."
            ),
            CompetencyRequirement(
                skill_id="monitoring_observability",
                name="Monitoring & Observability",
                category="Operations",
                importance_weight=0.80,
                expected_evidence_type="Prometheus metrics, Grafana dashboards, structured logging, alert rules",
                description="Keeping systems healthy and debuggable."
            )
        ]
    ),
    "cloud_engineer": JobRoleDefinition(
        id="cloud_engineer",
        name="Cloud Engineer",
        domain="Cloud Computing",
        description="Architects secure, highly available, and cost-optimized multi-region cloud workloads on AWS, GCP, or Azure.",
        competencies=[
            CompetencyRequirement(
                skill_id="cloud_services",
                name="Core Cloud Architecture (AWS/GCP/Azure)",
                category="Cloud",
                importance_weight=0.95,
                expected_evidence_type="Compute (EC2/ECS), storage (S3), networking (VPC/Subnets), IAM policies",
                description="Cloud service configuration and architectural design."
            ),
            CompetencyRequirement(
                skill_id="iac",
                name="Infrastructure as Code (Terraform)",
                category="IaC",
                importance_weight=0.90,
                expected_evidence_type="Terraform modules, state management, provider configuration",
                description="Automating cloud provisioning."
            ),
            CompetencyRequirement(
                skill_id="cloud_security",
                name="Cloud Security & Compliance",
                category="Security",
                importance_weight=0.85,
                expected_evidence_type="Least-privilege IAM, encryption at rest and in transit, KMS, WAF",
                description="Hardening cloud perimeters."
            )
        ]
    ),
    "cybersecurity": JobRoleDefinition(
        id="cybersecurity",
        name="Cybersecurity Analyst",
        domain="Information Security",
        description="Identifies vulnerabilities, audits network traffic, responds to incidents, and enforces defensive security best practices.",
        competencies=[
            CompetencyRequirement(
                skill_id="vuln_assessment",
                name="Vulnerability Assessment & PenTesting",
                category="Defensive/Offensive",
                importance_weight=0.90,
                expected_evidence_type="Nmap/Wireshark captures, OWASP Top 10 mitigation reports, remediation plans",
                description="Finding and patching system flaws."
            ),
            CompetencyRequirement(
                skill_id="network_security",
                name="Network Protocols & Traffic Analysis",
                category="Networking",
                importance_weight=0.85,
                expected_evidence_type="Packet capture analysis, firewall rule configuration, TLS inspection",
                description="Securing network communications."
            ),
            CompetencyRequirement(
                skill_id="incident_response",
                name="SIEM & Incident Investigation",
                category="Operations",
                importance_weight=0.80,
                expected_evidence_type="Log analysis (Splunk/ELK), threat detection rules, incident timelines",
                description="Investigating suspicious system events."
            )
        ]
    ),
    "ui_ux": JobRoleDefinition(
        id="ui_ux",
        name="UI/UX Designer",
        domain="Design & Human-Computer Interaction",
        description="Crafts intuitive user experiences, design systems, interactive prototypes, and conducts usability testing.",
        competencies=[
            CompetencyRequirement(
                skill_id="figma_prototyping",
                name="Figma & High-Fidelity Prototyping",
                category="Design Tools",
                importance_weight=0.95,
                expected_evidence_type="Figma link, auto-layout, interactive components, design system tokens",
                description="Creating pixel-perfect interfaces and flows."
            ),
            CompetencyRequirement(
                skill_id="user_research",
                name="User Research & Usability Testing",
                category="Research",
                importance_weight=0.90,
                expected_evidence_type="User journey maps, personas, wireframes, usability test summaries",
                description="Validating UX decisions with user feedback."
            ),
            CompetencyRequirement(
                skill_id="design_systems",
                name="Design Systems & Accessibility",
                category="Standards",
                importance_weight=0.85,
                expected_evidence_type="Color tokens, typography scale, WCAG AA/AAA contrast adherence",
                description="Building scalable, accessible design foundations."
            )
        ]
    )
}

def get_role_catalog() -> Dict[str, JobRoleDefinition]:
    return ROLE_CATALOG

def get_role_by_id(role_id: str) -> Optional[JobRoleDefinition]:
    if not role_id:
        return ROLE_CATALOG.get("mle")
    if role_id in ROLE_CATALOG:
        return ROLE_CATALOG[role_id]
    normalized = role_id.lower().strip().replace(" ", "_").replace("-", "_")
    if normalized in ROLE_CATALOG:
        return ROLE_CATALOG[normalized]
    aliases = {
        "python_dev": "python_backend",
        "python": "python_backend",
        "ml": "mle",
        "ml_engineer": "mle",
        "machine_learning": "mle",
        "ai": "ai_engineer",
        "java": "java_backend",
        "backend": "python_backend",
        "frontend": "fullstack",
        "full_stack": "fullstack",
        "data_science": "data_scientist",
        "analyst": "data_analyst",
    }
    target_key = aliases.get(normalized)
    if target_key and target_key in ROLE_CATALOG:
        return ROLE_CATALOG[target_key]
    return ROLE_CATALOG.get("mle")

def get_all_roles() -> List[JobRoleDefinition]:
    return list(ROLE_CATALOG.values())

