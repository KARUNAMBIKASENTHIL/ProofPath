from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.models.schemas import ProofGraphData, EvidenceRecord
from app.core.database import get_db
from app.services.role_catalog import get_role_by_id
from app.services.proof_graph_service import ProofGraphService
from app.services.sample_data import get_demo_student_alex_chen

router = APIRouter(prefix="/proof-graph", tags=["ProofGraph Skill-to-Evidence Mapping"])

@router.get("", response_model=ProofGraphData)
async def get_proof_graph(
    user_id: str = Query(...),
    role_id: str = Query("mle")
):
    role = get_role_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
        
    db = get_db()
    cursor = db.get_collection("evidence").find({"user_id": user_id})
    evidence_docs = await cursor.to_list(200)
    
    user = await db.get_collection("users").find_one({"_id": user_id})
    if not user:
        user = await db.get_collection("users").find_one({"id": user_id})
    student_name = user.get("full_name") if user else ("Alex Chen" if user_id == "demo-alex-chen" else "Candidate")

    if not evidence_docs and user_id == "demo-alex-chen":
        demo = get_demo_student_alex_chen()
        evidence_records = demo["evidence_records"]
    else:
        evidence_records = [EvidenceRecord(**d) for d in evidence_docs]

    return ProofGraphService.generate_proof_graph(
        student_name=student_name,
        target_role=role,
        evidence_records=evidence_records
    )
