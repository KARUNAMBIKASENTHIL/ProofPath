import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from app.models.schemas import Roadmap, RoadmapMilestone, EvidenceRecord, EvidenceStatus
from app.core.database import get_db
from app.services.rag_engine import rag_engine
from app.services.sample_data import get_demo_student_alex_chen

router = APIRouter(prefix="/roadmaps", tags=["RAG-Powered Personalized Roadmaps"])

class GenerateRoadmapRequest(BaseModel):
    user_id: str
    target_role: Optional[str] = "Machine Learning Engineer"

class UpdateMilestoneRequest(BaseModel):
    status: str  # planned | in_progress | completed
    evidence_submitted: Optional[str] = None

@router.post("/generate", response_model=Roadmap)
async def generate_roadmap(req: GenerateRoadmapRequest):
    db = get_db()
    
    cursor = db.get_collection("evidence").find({"user_id": req.user_id})
    evidence_docs = await cursor.to_list(200)
    
    if not evidence_docs and req.user_id == "demo-alex-chen":
        demo = get_demo_student_alex_chen()
        evidence_records = demo["evidence_records"]
    else:
        evidence_records = [EvidenceRecord(**d) for d in evidence_docs]

    verified = [
        e.skill_name for e in evidence_records 
        if e.status in [EvidenceStatus.STRONGLY_SUPPORTED, EvidenceStatus.SUPPORTED]
    ]
    unverified = [
        e.skill_name for e in evidence_records 
        if e.status in [EvidenceStatus.NOT_YET_VERIFIED, EvidenceStatus.PARTIALLY_SUPPORTED, EvidenceStatus.CONFLICTING_EVIDENCE]
    ]

    roadmap = rag_engine.generate_personalized_roadmap(
        user_id=req.user_id,
        target_role=req.target_role or "Machine Learning Engineer",
        verified_strengths=verified,
        not_yet_verified_gaps=unverified
    )

    await db.get_collection("roadmaps").update_one(
        {"user_id": req.user_id, "target_role": req.target_role},
        {"$set": roadmap.dict()},
        upsert=True
    )

    return roadmap

@router.get("/current", response_model=Roadmap)
async def get_current_roadmap(
    user_id: str = Query(...),
    target_role: str = Query("Machine Learning Engineer")
):
    db = get_db()
    existing = await db.get_collection("roadmaps").find_one({"user_id": user_id, "target_role": target_role})
    if existing:
        return Roadmap(**existing)
        
    return await generate_roadmap(GenerateRoadmapRequest(user_id=user_id, target_role=target_role))

@router.patch("/{roadmap_id}/milestones/{milestone_id}")
async def update_milestone_status(
    roadmap_id: str,
    milestone_id: str,
    req: UpdateMilestoneRequest
):
    db = get_db()
    roadmap_dict = await db.get_collection("roadmaps").find_one({"id": roadmap_id})
    if not roadmap_dict:
        raise HTTPException(status_code=404, detail="Roadmap not found.")

    roadmap = Roadmap(**roadmap_dict)
    milestone = next((m for m in roadmap.milestones if m.id == milestone_id), None)
    if not milestone:
        milestone = roadmap.milestones[0]
        
    milestone.status = req.status
    if req.evidence_submitted:
        milestone.evidence_submitted = req.evidence_submitted
        milestone.reassessed_at = datetime.utcnow().isoformat()

    roadmap.updated_at = datetime.utcnow().isoformat()
    await db.get_collection("roadmaps").update_one(
        {"id": roadmap.id},
        {"$set": roadmap.dict()}
    )

    return {
        "message": "Milestone updated successfully.",
        "milestone": milestone,
        "next_step": "Submit your evidence link to trigger instant reassessment."
    }
