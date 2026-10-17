import uuid
import shutil
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, Query, UploadFile, File, Form, HTTPException, Body
from typing import Optional, List, Dict, Any
from app.models.schemas import PlacementCohortAnalytics, EvidenceRecord, EvidenceStatus
from app.services.placement_service import PlacementService
from app.services.extraction_service import ExtractionService
from app.core.config import settings
from app.core.database import get_db
from app.services.sample_data import get_demo_student_alex_chen

router = APIRouter(prefix="/placement", tags=["Placement Team Intelligence"])

@router.get("/analytics", response_model=PlacementCohortAnalytics)
async def get_cohort_analytics(
    batch_year: int = Query(2026),
    role_filter: str = Query("all")
):
    return PlacementService.get_cohort_analytics(batch_year=batch_year, role_filter=role_filter)

@router.get("/students")
async def get_placement_students():
    """Returns candidate students for recruiter/placement selection."""
    db = get_db()
    users_cursor = db.get_collection("users").find({"role": "student"})
    users = await users_cursor.to_list(50)
    
    # Always include standard pre-configured student candidates for fast recruiter review
    candidates = [
        {
            "id": "demo-alex-chen",
            "full_name": "Alex Chen",
            "email": "alex.chen@proofpath.io",
            "target_role": "Machine Learning Engineer",
            "degree": "B.Tech Computer Science (2026)",
            "github_url": "https://github.com/alexchen-ml/diabetes-prediction-service",
            "has_resume": True,
            "resume_filename": "Alex_Chen_ML_Resume_2026.pdf",
            "verified_skills": ["Python", "scikit-learn", "FastAPI", "pytest"],
            "known_gaps": ["Docker / Containerization", "CI/CD Actions"]
        },
        {
            "id": "student-maya-sharma",
            "full_name": "Maya Sharma",
            "email": "maya.sharma@university.edu",
            "target_role": "Backend & Cloud Engineer",
            "degree": "B.Tech Information Technology (2026)",
            "github_url": "https://github.com/mayasharma/distributed-task-runner",
            "has_resume": True,
            "resume_filename": "Maya_Sharma_Backend_Resume.pdf",
            "verified_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            "known_gaps": ["Kubernetes", "Automated Pytest Mocking"]
        },
        {
            "id": "student-dev-patel",
            "full_name": "Dev Patel",
            "email": "dev.patel@university.edu",
            "target_role": "Full-Stack Developer",
            "degree": "B.E. Computer Engineering (2026)",
            "github_url": "https://github.com/devpatel/analytics-dashboard",
            "has_resume": True,
            "resume_filename": "Dev_Patel_FullStack_Resume.pdf",
            "verified_skills": ["React", "TypeScript", "Node.js", "Tailwind CSS"],
            "known_gaps": ["Backend Schema Validation", "E2E Testing"]
        }
    ]

    for u in users:
        u_id = str(u.get("_id") or u.get("id"))
        if not any(c["id"] == u_id or c["email"] == u.get("email") for c in candidates):
            candidates.append({
                "id": u_id,
                "full_name": u.get("full_name", "Registered Candidate"),
                "email": u.get("email", ""),
                "target_role": u.get("target_role", "Software Engineer"),
                "degree": u.get("degree", "Engineering"),
                "github_url": "https://github.com/" + u.get("full_name", "candidate").lower().replace(" ", ""),
                "has_resume": True,
                "resume_filename": "Uploaded_Candidate_Resume.pdf",
                "verified_skills": ["Python", "Algorithms"],
                "known_gaps": ["Docker Deployment", "Automated Testing"]
            })

    return candidates

@router.post("/extract-github")
async def extract_candidate_github(payload: Dict[str, Any] = Body(...)):
    """
    Extracts candidate profile, public repositories, and implementation code
    directly from GitHub for instant proof-of-work auditing.
    """
    url = (payload.get("github_url") or "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="Please enter a candidate GitHub Profile URL or username.")
    return PlacementService.extract_github_candidate(url)

@router.post("/analyze-candidate")
async def analyze_candidate_against_jd(
    job_description: str = Form(...),
    job_role_title: str = Form("Machine Learning & Backend Engineer"),
    candidate_id: Optional[str] = Form(None),
    candidate_name: Optional[str] = Form(None),
    candidate_email: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None)
):
    """
    Recruiter / Placement Officer Assessment:
    Uploads a student resume and checks it against a Job Description.
    Calculates Proof of Work Job Readiness Score (NOT just keyword matching!),
    pinpoints exactly where the student lags behind, and returns a detailed report.
    """
    db = get_db()
    raw_resume_text = resume_text or ""
    extracted_skills = []
    extracted_projects = []
    detected_name = candidate_name or "Candidate Student"
    detected_email = candidate_email or ""
    detected_github = github_url or ""
    db_evidence = []

    # 1. Process uploaded resume file if provided
    if resume_file:
        ext = Path(resume_file.filename).suffix.lower()
        if ext not in [".pdf", ".docx", ".doc", ".txt"]:
            raise HTTPException(status_code=400, detail="Invalid format. Please upload PDF, DOCX, or TXT resume.")
        
        file_id = str(uuid.uuid4())
        save_path = settings.UPLOAD_DIR / f"placement_{file_id}_{resume_file.filename}"
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(resume_file.file, buffer)

        extracted = ExtractionService.extract_text_from_file(save_path)
        raw_resume_text = extracted.get("raw_text", "")
        structured = ExtractionService.parse_resume_structure(raw_resume_text, extracted.get("pages", []))
        extracted_skills = structured.get("skills", [])
        extracted_projects = structured.get("projects", [])

        if not detected_name or detected_name == "Candidate Student":
            lines = [l.strip() for l in raw_resume_text.split("\n") if l.strip()]
            if lines:
                detected_name = lines[0][:40]

        links = structured.get("detected_links", {})
        if not detected_github and links.get("github"):
            detected_github = links["github"]
    elif raw_resume_text:
        structured = ExtractionService.parse_resume_structure(raw_resume_text, [])
        extracted_skills = structured.get("skills", [])
        extracted_projects = structured.get("projects", [])
        if not detected_name or detected_name == "Candidate Student":
            lines = [l.strip() for l in raw_resume_text.split("\n") if l.strip()]
            if lines:
                detected_name = lines[0][:40]

    resume_text = raw_resume_text

    # 2. If student_id or candidate_id is specified, fetch verified evidence from database
    if candidate_id:
        if candidate_id == "demo-alex-chen":
            demo = get_demo_student_alex_chen()
            db_evidence = [e.dict() for e in demo["evidence_records"]]
            if not resume_text:
                resume_text = "Alex Chen\nMachine Learning Engineer\nSkills: Python, scikit-learn, FastAPI, pytest, Docker, Kubernetes, Pandas, SQL."
                detected_name = "Alex Chen"
                detected_email = "alex.chen@proofpath.io"
                detected_github = "https://github.com/alexchen-ml/diabetes-prediction-service"
        elif candidate_id == "student-maya-sharma":
            db_evidence = [
                {
                    "skill_name": "Python Idiomatic Programming",
                    "normalized_skill": "python",
                    "code_snippet": "async def process_task(task_id: str, db: AsyncSession): ...",
                    "observed_evidence": "Production async routines with type annotations",
                    "file_path_or_url": "https://github.com/mayasharma/distributed-task-runner/blob/main/app/tasks.py",
                    "project_name": "Distributed Task Runner"
                },
                {
                    "skill_name": "REST API Architecture & Web Services",
                    "normalized_skill": "fastapi",
                    "code_snippet": "@app.post('/tasks', response_model=TaskResponse, status_code=201)",
                    "observed_evidence": "FastAPI routers with HTTP 201 created status and OpenAPI tags",
                    "file_path_or_url": "https://github.com/mayasharma/distributed-task-runner/blob/main/app/main.py",
                    "project_name": "Distributed Task Runner"
                },
                {
                    "skill_name": "Containerization & Docker Deployment",
                    "normalized_skill": "docker",
                    "code_snippet": "FROM python:3.11-slim\nWORKDIR /app\nRUN pip install -r requirements.txt\nCMD ['uvicorn', 'app.main:app']",
                    "observed_evidence": "Multi-stage Dockerfile and docker-compose.yml running Redis + App",
                    "file_path_or_url": "https://github.com/mayasharma/distributed-task-runner/blob/main/Dockerfile",
                    "project_name": "Distributed Task Runner"
                }
            ]
            if not resume_text:
                resume_text = "Maya Sharma\nBackend & Cloud Engineer\nSkills: Python, FastAPI, Docker, PostgreSQL, Kubernetes, Redis, Pytest, Microservices."
                detected_name = "Maya Sharma"
                detected_email = "maya.sharma@university.edu"
                detected_github = "https://github.com/mayasharma/distributed-task-runner"
        elif candidate_id == "student-dev-patel":
            db_evidence = [
                {
                    "skill_name": "Python Idiomatic Programming",
                    "normalized_skill": "python",
                    "code_snippet": "def aggregate_metrics(data: list) -> dict: return {k: sum(v) for k, v in data}",
                    "observed_evidence": "Python metric calculation modules",
                    "file_path_or_url": "https://github.com/devpatel/analytics-dashboard/blob/main/api/metrics.py",
                    "project_name": "Analytics Dashboard"
                },
                {
                    "skill_name": "Database Modeling & ACID Integrity",
                    "normalized_skill": "sql",
                    "code_snippet": "SELECT date, sum(amount) FROM transactions GROUP BY date",
                    "observed_evidence": "SQL analytics aggregations and PostgreSQL queries",
                    "file_path_or_url": "https://github.com/devpatel/analytics-dashboard/blob/main/queries.sql",
                    "project_name": "Analytics Dashboard"
                }
            ]
            if not resume_text:
                resume_text = "Dev Patel\nFull-Stack Developer\nSkills: React, TypeScript, Python, SQL, Docker, AWS, Pytest, Next.js, Node.js."
                detected_name = "Dev Patel"
                detected_email = "dev.patel@university.edu"
                detected_github = "https://github.com/devpatel/analytics-dashboard"
        else:
            # Query from DB evidence collection
            ev_cursor = db.get_collection("evidence").find({"user_id": candidate_id})
            docs = await ev_cursor.to_list(100)
            db_evidence = docs
            # Query user doc for name
            u = await db.get_collection("users").find_one({"$or": [{"_id": candidate_id}, {"id": candidate_id}]})
            if u:
                detected_name = u.get("full_name", detected_name)
                detected_email = u.get("email", detected_email)

    if not resume_text and not db_evidence:
        if detected_github or detected_name:
            resume_text = f"Candidate: {detected_name}\nTarget Role: {job_role_title}\nGitHub: {detected_github}\nSkills Claimed: Python, FastAPI, Machine Learning, SQL, Pytest, Docker, Data Pipelines, Algorithms"
        else:
            raise HTTPException(
                status_code=400,
                detail="Please upload a candidate resume file (PDF/DOCX/TXT) or provide candidate details."
            )

    # 3. Execute Proof of Work vs Keyword Matching Placement Assessment
    report = PlacementService.analyze_candidate_against_jd(
        resume_text=resume_text,
        job_description=job_description,
        candidate_name=detected_name,
        candidate_email=detected_email,
        target_role_title=job_role_title,
        github_url=detected_github,
        extracted_skills=extracted_skills,
        extracted_projects=extracted_projects,
        student_user_id=candidate_id,
        db_evidence=db_evidence
    )

    # Attach metadata
    report["candidate_id"] = candidate_id
    report["github_url"] = detected_github
    report["job_description"] = job_description
    report["timestamp"] = datetime.utcnow().isoformat()

    # Save to placement_reports collection for persistent retrieval
    await db.get_collection("placement_reports").insert_one(dict(report))

    return report

@router.get("/reports")
async def list_recruiter_reports():
    """List historical recruiter candidate assessment reports."""
    db = get_db()
    cursor = db.get_collection("placement_reports").find().sort("timestamp", -1)
    reports = await cursor.to_list(30)
    for r in reports:
        if "_id" in r:
            r["_id"] = str(r["_id"])
    return reports

@router.get("/reports/{report_id}")
async def get_recruiter_report(report_id: str):
    """Fetch a specific candidate audit report by ID."""
    db = get_db()
    rep = await db.get_collection("placement_reports").find_one({"report_id": report_id})
    if not rep:
        rep = await db.get_collection("placement_reports").find_one({"id": report_id})
    if not rep:
        raise HTTPException(status_code=404, detail="Candidate audit report not found.")
    if "_id" in rep:
        rep["_id"] = str(rep["_id"])
    return rep
