import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel

from app.models.schemas import (
    HistoricalEvent,
    HistoricalEventType,
    AnalysisRecord,
    ReportComparison
)
from app.core.database import get_db
from app.services.role_catalog import get_role_by_id

router = APIRouter(prefix="/history", tags=["Analysis History & Calendar"])

class CompareRequest(BaseModel):
    user_id: str
    report_id_a: str
    report_id_b: str

def get_demo_historical_events(user_id: str) -> List[HistoricalEvent]:
    today = datetime.utcnow()
    d1 = (today - timedelta(days=45)).strftime("%Y-%m-%d")
    d2 = (today - timedelta(days=28)).strftime("%Y-%m-%d")
    d3 = (today - timedelta(days=12)).strftime("%Y-%m-%d")
    d4 = today.strftime("%Y-%m-%d")

    return [
        HistoricalEvent(
            id="evt-1",
            user_id=user_id,
            event_type=HistoricalEventType.RESUME_UPLOADED,
            title="Resume Uploaded",
            description="Uploaded original resume 'Alex_Chen_ML_Resume_v1.pdf'. Extracted 14 skills and 2 projects.",
            date=d1,
            timestamp=f"{d1}T10:15:00Z",
            metadata={"filename": "Alex_Chen_ML_Resume_v1.pdf", "skills_count": 14}
        ),
        HistoricalEvent(
            id="evt-2",
            user_id=user_id,
            event_type=HistoricalEventType.ANALYSIS_RUN,
            title="Initial Readiness Analysis",
            description="Ran benchmark assessment for Machine Learning Engineer. Score: 48.5%.",
            date=d1,
            timestamp=f"{d1}T10:25:00Z",
            metadata={"role": "Machine Learning Engineer", "score": 48.5, "report_id": "rep-demo-1"}
        ),
        HistoricalEvent(
            id="evt-3",
            user_id=user_id,
            event_type=HistoricalEventType.PROFILE_SYNCED,
            title="GitHub Repository Connected",
            description="Connected GitHub repository 'alexchen/medical-imaging-cnn'. Extracted PyTorch CNN architecture and training logs.",
            date=d2,
            timestamp=f"{d2}T14:30:00Z",
            metadata={"repo": "alexchen/medical-imaging-cnn", "commits_observed": 38}
        ),
        HistoricalEvent(
            id="evt-4",
            user_id=user_id,
            event_type=HistoricalEventType.ANALYSIS_RUN,
            title="Evidence-Backed Assessment",
            description="Re-assessed readiness with verified GitHub source code. Score increased to 64.0%.",
            date=d2,
            timestamp=f"{d2}T15:00:00Z",
            metadata={"role": "Machine Learning Engineer", "score": 64.0, "report_id": "rep-demo-2"}
        ),
        HistoricalEvent(
            id="evt-5",
            user_id=user_id,
            event_type=HistoricalEventType.MILESTONE_COMPLETED,
            title="Milestone 1 Completed: Docker Containerization",
            description="Implemented multi-stage Dockerfile and deployed REST API with health check endpoint.",
            date=d3,
            timestamp=f"{d3}T16:45:00Z",
            metadata={"milestone": "milestone-1", "skill": "Containerization & Deployment"}
        ),
        HistoricalEvent(
            id="evt-6",
            user_id=user_id,
            event_type=HistoricalEventType.READINESS_REASSESSED,
            title="Progress Reassessment",
            description="Containerization competency upgraded to Strongly Supported. Score rose to 76.5%.",
            date=d3,
            timestamp=f"{d3}T17:00:00Z",
            metadata={"role": "Machine Learning Engineer", "score": 76.5, "report_id": "rep-demo-3"}
        ),
        HistoricalEvent(
            id="evt-7",
            user_id=user_id,
            event_type=HistoricalEventType.READINESS_REASSESSED,
            title="Live Viva Assessment & Verification",
            description="Completed architecture viva with 92% conceptual clarity. Current verified score: 82.5%.",
            date=d4,
            timestamp=f"{d4}T11:00:00Z",
            metadata={"role": "Machine Learning Engineer", "score": 82.5, "report_id": "rep-demo-4"}
        )
    ]

def get_demo_analysis_records(user_id: str) -> List[AnalysisRecord]:
    today = datetime.utcnow()
    d1 = (today - timedelta(days=45)).strftime("%Y-%m-%d")
    d2 = (today - timedelta(days=28)).strftime("%Y-%m-%d")
    d3 = (today - timedelta(days=12)).strftime("%Y-%m-%d")
    d4 = today.strftime("%Y-%m-%d")

    return [
        AnalysisRecord(
            id="rep-demo-4",
            user_id=user_id,
            timestamp=f"{d4}T11:00:00Z",
            date=d4,
            resume_version="Alex_Chen_ML_Resume_v1.pdf",
            sources_available=["Resume PDF", "GitHub (alexchen/medical-imaging-cnn)", "Docker Container Artifacts", "Live Project Viva"],
            target_role="mle",
            target_role_name="Machine Learning Engineer",
            overall_readiness_score=82.5,
            previous_score=76.5,
            score_delta=6.0,
            category_breakdown={
                "Core ML & Deep Learning": 92.0,
                "Software Engineering & Architecture": 82.0,
                "Model Deployment & Cloud": 78.0,
                "Data Engineering & Pipelines": 72.0
            },
            supported_skills_count=10,
            partially_supported_count=2,
            not_yet_verified_count=1,
            conflicting_count=0,
            skill_evaluations=[
                {"skill": "PyTorch / Deep Learning", "status": "Strongly supported", "weight": 0.95, "coverage": 1.0, "source": "GitHub & Viva"},
                {"skill": "Containerization & Deployment", "status": "Strongly supported", "weight": 0.85, "coverage": 0.95, "source": "Docker Artifact"},
                {"skill": "REST API Development", "status": "Strongly supported", "weight": 0.80, "coverage": 0.90, "source": "FastAPI Repo"},
                {"skill": "Model Evaluation & Metrics", "status": "Supported", "weight": 0.85, "coverage": 0.80, "source": "Jupyter Notebooks"},
                {"skill": "Distributed Training", "status": "Partially supported", "weight": 0.70, "coverage": 0.40, "source": "Resume Claim"},
                {"skill": "Kubernetes Orchestration", "status": "Not yet verified", "weight": 0.75, "coverage": 0.0, "source": "None"}
            ],
            projects_referenced=["Medical Imaging CNN Classifier", "Real-Time Inference Microservice"],
            consistency_summary="High consistency across 45-day window with 4 continuous releases.",
            observation_window="Past 45 days",
            recommendations=[
                "Deploy FastAPI service onto a Managed Kubernetes cluster with Horizontal Pod Autoscaler.",
                "Implement automated CI/CD pipeline using GitHub Actions."
            ],
            roadmap_version="v2.1",
            methodology_version="v1.2.0-deterministic"
        ),
        AnalysisRecord(
            id="rep-demo-3",
            user_id=user_id,
            timestamp=f"{d3}T17:00:00Z",
            date=d3,
            resume_version="Alex_Chen_ML_Resume_v1.pdf",
            sources_available=["Resume PDF", "GitHub (alexchen/medical-imaging-cnn)", "Docker Container Artifacts"],
            target_role="mle",
            target_role_name="Machine Learning Engineer",
            overall_readiness_score=76.5,
            previous_score=64.0,
            score_delta=12.5,
            category_breakdown={
                "Core ML & Deep Learning": 88.0,
                "Software Engineering & Architecture": 78.0,
                "Model Deployment & Cloud": 75.0,
                "Data Engineering & Pipelines": 65.0
            },
            supported_skills_count=8,
            partially_supported_count=3,
            not_yet_verified_count=2,
            conflicting_count=0,
            skill_evaluations=[],
            projects_referenced=["Medical Imaging CNN Classifier"],
            consistency_summary="Steady activity with regular container commits.",
            observation_window="Past 30 days",
            recommendations=["Conduct code review viva and add automated pytest coverage."],
            roadmap_version="v2.0",
            methodology_version="v1.2.0-deterministic"
        ),
        AnalysisRecord(
            id="rep-demo-2",
            user_id=user_id,
            timestamp=f"{d2}T15:00:00Z",
            date=d2,
            resume_version="Alex_Chen_ML_Resume_v1.pdf",
            sources_available=["Resume PDF", "GitHub (alexchen/medical-imaging-cnn)"],
            target_role="mle",
            target_role_name="Machine Learning Engineer",
            overall_readiness_score=64.0,
            previous_score=48.5,
            score_delta=15.5,
            category_breakdown={
                "Core ML & Deep Learning": 82.0,
                "Software Engineering & Architecture": 65.0,
                "Model Deployment & Cloud": 45.0,
                "Data Engineering & Pipelines": 58.0
            },
            supported_skills_count=6,
            partially_supported_count=4,
            not_yet_verified_count=3,
            conflicting_count=0,
            skill_evaluations=[],
            projects_referenced=["Medical Imaging CNN Classifier"],
            consistency_summary="Initial repository link established.",
            observation_window="Past 15 days",
            recommendations=["Add containerization and test suites to repository."],
            roadmap_version="v1.5",
            methodology_version="v1.2.0-deterministic"
        ),
        AnalysisRecord(
            id="rep-demo-1",
            user_id=user_id,
            timestamp=f"{d1}T10:25:00Z",
            date=d1,
            resume_version="Alex_Chen_ML_Resume_v1.pdf",
            sources_available=["Resume PDF"],
            target_role="mle",
            target_role_name="Machine Learning Engineer",
            overall_readiness_score=48.5,
            previous_score=None,
            score_delta=None,
            category_breakdown={
                "Core ML & Deep Learning": 60.0,
                "Software Engineering & Architecture": 50.0,
                "Model Deployment & Cloud": 35.0,
                "Data Engineering & Pipelines": 45.0
            },
            supported_skills_count=4,
            partially_supported_count=7,
            not_yet_verified_count=5,
            conflicting_count=0,
            skill_evaluations=[],
            projects_referenced=["Resume project entries"],
            consistency_summary="Single resume upload point; no repository commits observed yet.",
            observation_window="Single timestamp",
            recommendations=["Connect GitHub repository to back up resume claims with tangible code."],
            roadmap_version="v1.0",
            methodology_version="v1.2.0-deterministic"
        )
    ]

@router.get("/events", response_model=List[HistoricalEvent])
async def get_historical_events(user_id: str = Query(...)):
    db = get_db()
    events_col = db.get_collection("historical_events")
    cursor = events_col.find({"user_id": user_id}).sort("timestamp", -1)
    docs = await cursor.to_list(100)

    if not docs:
        if user_id == "demo-alex-chen":
            return get_demo_historical_events(user_id)
        
        # Check if user has uploaded resume or has an assessment
        resume = await db.get_collection("resumes").find_one({"user_id": user_id})
        events = []
        if resume:
            events.append(HistoricalEvent(
                id=str(uuid.uuid4()),
                user_id=user_id,
                event_type=HistoricalEventType.RESUME_UPLOADED,
                title="Resume Uploaded",
                description=f"Uploaded '{resume.get('original_filename', 'Resume')}'",
                date=datetime.utcnow().strftime("%Y-%m-%d"),
                timestamp=datetime.utcnow().isoformat()
            ))
        return events

    return [HistoricalEvent(**d) for d in docs]

@router.post("/events", response_model=HistoricalEvent)
async def log_historical_event(event: HistoricalEvent):
    db = get_db()
    if not event.id:
        event.id = str(uuid.uuid4())
    await db.get_collection("historical_events").insert_one(event.dict())
    return event

@router.get("/reports", response_model=List[AnalysisRecord])
async def get_analysis_reports(
    user_id: str = Query(...),
    role_id: Optional[str] = Query(None)
):
    db = get_db()
    query = {"user_id": user_id}
    if role_id:
        query["target_role"] = role_id
        
    cursor = db.get_collection("analysis_reports").find(query).sort("timestamp", -1)
    docs = await cursor.to_list(50)

    if not docs:
        if user_id == "demo-alex-chen":
            return get_demo_analysis_records(user_id)
        
        # Check if user has any assessments
        ass_docs = await db.get_collection("assessments").find({"user_id": user_id}).to_list(50)
        reports = []
        for a in ass_docs:
            rec = AnalysisRecord(
                id=str(a.get("id", uuid.uuid4())),
                user_id=user_id,
                timestamp=a.get("timestamp", datetime.utcnow().isoformat()),
                date=a.get("timestamp", datetime.utcnow().isoformat())[:10],
                target_role=a.get("role_id", "mle"),
                target_role_name=a.get("role_name", "Target Role"),
                overall_readiness_score=a.get("overall_readiness_score", 0.0),
                supported_skills_count=len(a.get("positive_contributors", [])),
                partially_supported_count=len(a.get("missing_evidence", [])),
                not_yet_verified_count=0,
                skill_evaluations=a.get("skill_evaluations", []),
                projects_referenced=[],
                recommendations=a.get("missing_evidence", [])[:3]
            )
            reports.append(rec)
        return reports

    return [AnalysisRecord(**d) for d in docs]

@router.get("/reports/{report_id}", response_model=AnalysisRecord)
async def get_analysis_report_by_id(report_id: str):
    db = get_db()
    doc = await db.get_collection("analysis_reports").find_one({"id": report_id})
    if not doc:
        # Check demo records
        demo_recs = get_demo_analysis_records("demo-alex-chen")
        match = next((r for r in demo_recs if r.id == report_id), None)
        if match:
            return match
        raise HTTPException(status_code=404, detail="Analysis report not found.")
    return AnalysisRecord(**doc)

@router.post("/compare", response_model=ReportComparison)
async def compare_reports(req: CompareRequest):
    db = get_db()
    # Try finding in DB or demo pool
    doc_a = await db.get_collection("analysis_reports").find_one({"id": req.report_id_a})
    doc_b = await db.get_collection("analysis_reports").find_one({"id": req.report_id_b})

    if not doc_a or not doc_b:
        demo_recs = {r.id: r for r in get_demo_analysis_records("demo-alex-chen")}
        rep_a = doc_a and AnalysisRecord(**doc_a) or demo_recs.get(req.report_id_a)
        rep_b = doc_b and AnalysisRecord(**doc_b) or demo_recs.get(req.report_id_b)
    else:
        rep_a = AnalysisRecord(**doc_a)
        rep_b = AnalysisRecord(**doc_b)

    if not rep_a or not rep_b:
        raise HTTPException(status_code=404, detail="One or both reports could not be found for comparison.")

    # Determine older vs newer report
    if rep_a.timestamp > rep_b.timestamp:
        older, newer = rep_b, rep_a
    else:
        older, newer = rep_a, rep_b

    score_diff = round(newer.overall_readiness_score - older.overall_readiness_score, 1)

    # Compute what improved
    what_improved = []
    if score_diff > 0:
        what_improved.append(f"Overall readiness increased by +{score_diff}% (from {older.overall_readiness_score}% to {newer.overall_readiness_score}%).")
    
    new_supp = newer.supported_skills_count - older.supported_skills_count
    if new_supp > 0:
        what_improved.append(f"Verified {new_supp} additional required skills with tangible proof.")

    for k, v in newer.category_breakdown.items():
        old_val = older.category_breakdown.get(k, 0)
        if v > old_val:
            what_improved.append(f"Category '{k}' strengthened from {round(old_val, 1)}% to {round(v, 1)}%.")

    if not what_improved:
        what_improved.append("Skill foundations maintained consistently across the period.")

    # What stayed the same
    what_stayed = []
    for k, v in newer.category_breakdown.items():
        old_val = older.category_breakdown.get(k, 0)
        if abs(v - old_val) < 2.0:
            what_stayed.append(f"Competency in '{k}' remained stable ({round(v, 1)}%).")
    if not what_stayed:
        what_stayed.append("Baseline programming and software fundamentals remained consistent.")

    # New evidence that appeared
    older_sources = set(older.sources_available)
    newer_sources = set(newer.sources_available)
    new_sources = list(newer_sources - older_sources)
    new_evidence = []
    if new_sources:
        for s in new_sources:
            new_evidence.append(f"Integrated new verified evidence source: {s}")
    else:
        new_evidence.append("Fresh commits and refined artifacts registered for existing connected sources.")

    # Remaining gaps
    remaining_gaps = []
    if newer.not_yet_verified_count > 0:
        remaining_gaps.append(f"{newer.not_yet_verified_count} competency requirements still lack primary source evidence.")
    if newer.partially_supported_count > 0:
        remaining_gaps.append(f"{newer.partially_supported_count} skills remain partially supported (supported by claims/docs but missing unit tests or deployed live URLs).")
    for r in newer.recommendations[:2]:
        remaining_gaps.append(r)

    # Completed recommendations
    completed_recs = []
    for rec in older.recommendations:
        if rec not in newer.recommendations:
            completed_recs.append(rec)
    if not completed_recs and score_diff > 0:
        completed_recs.append("Addressed deployment and containerization milestone.")

    return ReportComparison(
        report_a_id=older.id,
        report_b_id=newer.id,
        date_a=older.date,
        date_b=newer.date,
        role_name=newer.target_role_name,
        score_a=older.overall_readiness_score,
        score_b=newer.overall_readiness_score,
        score_diff=score_diff,
        what_improved=what_improved,
        what_stayed_the_same=what_stayed,
        new_evidence_appeared=new_evidence,
        remaining_gaps=remaining_gaps,
        completed_recommendations=completed_recs,
        scoring_methodology_notes="Evaluated using Scoring Engine v1.2.0 (Deterministic weighted coverage formula: 100 * sum(weight * coverage) / sum(weights)). Unverified competencies are weighted as 0 coverage without penalizing unrelated domains."
    )
