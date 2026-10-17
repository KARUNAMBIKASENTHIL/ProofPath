import uuid
from datetime import datetime
from fastapi import APIRouter, Query
from typing import List
from app.models.schemas import GrowthSnapshot
from app.core.database import get_db
from app.services.sample_data import get_demo_student_alex_chen

router = APIRouter(prefix="/growth", tags=["GrowthDNA Longitudinal Tracking"])

@router.get("/history", response_model=List[GrowthSnapshot])
async def get_growth_history(user_id: str = Query(...)):
    db = get_db()
    cursor = db.get_collection("growth_snapshots").find({"user_id": user_id})
    snapshots = await cursor.to_list(50)
    
    if not snapshots:
        if user_id == "demo-alex-chen":
            demo = get_demo_student_alex_chen()
            return demo["growth_history"]
        else:
            # Create an initial onboarding snapshot for the real user
            initial_snap = GrowthSnapshot(
                id=str(uuid.uuid4()),
                user_id=user_id,
                date=datetime.utcnow().strftime("%Y-%m-%d"),
                readiness_score=0.0,
                evidence_completeness=0.0,
                verified_skills_count=0,
                projects_analyzed=0,
                new_competencies=[],
                notes="Candidate profile created on CareerLens. Awaiting initial resume or repository evidence upload."
            )
            await db.get_collection("growth_snapshots").insert_one(initial_snap.dict())
            return [initial_snap]
            
    return [GrowthSnapshot(**s) for s in snapshots]
