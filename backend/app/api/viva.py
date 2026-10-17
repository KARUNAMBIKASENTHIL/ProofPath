import uuid
from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from app.models.schemas import VivaSession, VivaAnswerSubmit, VivaEvaluation, ProjectDepthAnalysis
from app.core.database import get_db
from app.services.viva_service import VivaService
from app.services.sample_data import get_demo_student_alex_chen

router = APIRouter(prefix="/viva", tags=["AI Project Viva"])

class StartVivaRequest(BaseModel):
    user_id: str
    project_id: Optional[str] = None

@router.get("/sessions", response_model=List[VivaSession])
async def list_viva_sessions(
    user_id: str = Query(...),
    project_id: Optional[str] = Query(None)
):
    db = get_db()
    query: Dict[str, Any] = {"user_id": user_id}
    if project_id:
        query["project_id"] = project_id
    cursor = db.get_collection("viva_sessions").find(query).sort("_id", -1)
    sessions = await cursor.to_list(20)
    return [VivaSession(**s) for s in sessions]

@router.post("/sessions", response_model=VivaSession)
async def start_viva_session(req: StartVivaRequest):
    db = get_db()
    
    # Try finding user's specific project by id or demo project
    project = None
    if req.project_id:
        project = await db.get_collection("projects").find_one({"id": req.project_id})
        if not project:
            project = await db.get_collection("projects").find_one({"title": req.project_id})
        if not project and req.user_id == "demo-alex-chen":
            demo = get_demo_student_alex_chen()
            for p in demo["projects"]:
                if p.id == req.project_id or p.title.lower() == req.project_id.lower():
                    project = p.dict()
                    break

    if not project:
        cursor = db.get_collection("projects").find({"user_id": req.user_id})
        user_projects = await cursor.to_list(10)
        if user_projects:
            project = user_projects[0]

    if not project:
        if req.user_id == "demo-alex-chen":
            demo = get_demo_student_alex_chen()
            project = demo["projects"][0].dict()
        else:
            # Check user target role
            user = await db.get_collection("users").find_one({"_id": req.user_id}) or await db.get_collection("users").find_one({"id": req.user_id})
            target = user.get("target_role", "Software Development") if user else "Software Development"
            project = {
                "id": str(uuid.uuid4()),
                "user_id": req.user_id,
                "title": f"{target} Implementation Project",
                "problem_definition": f"Core engineering project addressing {target} domain competencies.",
                "architecture_overview": "Service Architecture",
                "technologies_used": ["Python", "FastAPI", "Testing"],
                "implementation_depth_score": 60.0,
                "test_evidence": {"has_tests": True, "test_framework": "pytest"},
                "error_handling_evidence": {"has_robust_handling": True},
                "documentation_quality": {"rating": "Standard"},
                "deployment_evidence": {"has_deployment": False},
                "commit_insights": {},
                "demonstrated_competencies": ["Python", "System Design"],
                "positive_highlights": [],
                "identified_gaps": [],
                "recommended_improvements": [],
                "is_sandbox_verified": False
            }

    project_obj = ProjectDepthAnalysis(**project)
    session = VivaService.generate_project_viva(project_obj)
    session.user_id = req.user_id

    await db.get_collection("viva_sessions").insert_one(session.dict())
    return session

@router.get("/sessions/{session_id}", response_model=VivaSession)
async def get_viva_session(session_id: str):
    db = get_db()
    session = await db.get_collection("viva_sessions").find_one({"id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Viva session not found.")
    return VivaSession(**session)

@router.post("/sessions/{session_id}/answer", response_model=VivaSession)
async def submit_viva_answer(session_id: str, submission: VivaAnswerSubmit):
    db = get_db()
    session_dict = await db.get_collection("viva_sessions").find_one({"id": session_id})
    if not session_dict:
        raise HTTPException(status_code=404, detail="Viva session not found.")
        
    session = VivaSession(**session_dict)

    question = next((q for q in session.questions if q.id == submission.question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found in this Viva session.")

    eval_result = VivaService.evaluate_viva_answer(question, submission.student_answer)
    
    session.answers.append({
        "question_id": submission.question_id,
        "student_answer": submission.student_answer
    })
    session.evaluations.append(eval_result)

    if len(session.evaluations) >= len(session.questions):
        session.status = "completed"
        total_score = sum(e.score for e in session.evaluations) / len(session.evaluations)
        session.overall_viva_score = round(total_score, 1)
        session.summary_findings = (
            f"Candidate demonstrated {session.overall_viva_score}% technical soundness in project viva defense. "
            f"Strongest grasp in {question.focus_area}."
        )

    await db.get_collection("viva_sessions").update_one(
        {"id": session_id},
        {"$set": session.dict()},
        upsert=True
    )

    return session
