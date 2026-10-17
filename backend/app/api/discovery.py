from fastapi import APIRouter, Query, Body
from typing import List, Optional
from pydantic import BaseModel
from app.models.schemas import CareerRecommendation, EvidenceRecord
from app.core.database import get_db
from app.services.discovery_service import CareerDiscoveryService
from app.services.sample_data import get_demo_student_alex_chen

router = APIRouter(prefix="/career", tags=["Career Discovery Engine"])

class CareerDiscoverRequest(BaseModel):
    user_id: str

@router.post("/discover", response_model=List[CareerRecommendation])
async def discover_careers(req: CareerDiscoverRequest):
    db = get_db()
    cursor = db.get_collection("evidence").find({"user_id": req.user_id})
    evidence_docs = await cursor.to_list(100)
    
    if not evidence_docs and req.user_id == "demo-alex-chen":
        demo = get_demo_student_alex_chen()
        evidence_records = demo["evidence_records"]
    else:
        evidence_records = [EvidenceRecord(**d) for d in evidence_docs]

    return CareerDiscoveryService.discover_careers(evidence_records)
