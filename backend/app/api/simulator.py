from fastapi import APIRouter, Query, Body
from typing import List, Optional
from pydantic import BaseModel
from app.models.schemas import SimulatorOption, EvidenceRecord
from app.core.database import get_db
from app.services.discovery_service import CareerDiscoveryService
from app.services.sample_data import get_demo_student_alex_chen

router = APIRouter(prefix="/simulator", tags=["Career What-If Simulator"])

class SimulatorRequest(BaseModel):
    user_id: str
    target_role_id: Optional[str] = "mle"
    current_score: Optional[float] = 0.0

@router.post("/compare", response_model=List[SimulatorOption])
async def compare_simulated_interventions(req: SimulatorRequest):
    db = get_db()
    cursor = db.get_collection("evidence").find({"user_id": req.user_id})
    evidence_docs = await cursor.to_list(100)
    
    if not evidence_docs and req.user_id == "demo-alex-chen":
        demo = get_demo_student_alex_chen()
        evidence_records = demo["evidence_records"]
    else:
        evidence_records = [EvidenceRecord(**d) for d in evidence_docs]

    return CareerDiscoveryService.simulate_what_if_options(
        target_role_id=req.target_role_id or "mle",
        current_score=req.current_score if req.current_score is not None else 0.0,
        evidence_records=evidence_records
    )
