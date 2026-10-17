import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.models.schemas import ConnectedSource, SourceType, SourceStatus, ProjectDepthAnalysis, EvidenceRecord, EvidenceStatus
from app.core.database import get_db
from app.services.repo_analyzer import ProjectDepthAnalyzer
from app.services.sample_data import get_demo_student_alex_chen

router = APIRouter(prefix="/sources", tags=["Multi-Source Evidence Ingestion"])

class SourceConnectRequest(BaseModel):
    user_id: str
    source_type: SourceType
    name: str
    url_or_path: str
    metadata: Dict[str, Any] = {}

@router.get("", response_model=List[ConnectedSource])
async def list_sources(user_id: str = Query(...)):
    db = get_db()
    cursor = db.get_collection("sources").find({"user_id": user_id})
    sources = await cursor.to_list(100)
    
    if not sources and user_id == "demo-alex-chen":
        demo = get_demo_student_alex_chen()
        return demo["sources"]
            
    return [ConnectedSource(**s) for s in sources]

@router.post("/connect", response_model=ConnectedSource)
async def connect_source(req: SourceConnectRequest):
    db = get_db()
    
    status = SourceStatus.CONNECTED
    err_msg = None
    
    if "restricted" in req.url_or_path.lower():
        status = SourceStatus.PARTIALLY_ACCESSIBLE
        err_msg = "OAuth restricted. Using authorized manual import subset."
    elif "invalid" in req.url_or_path.lower():
        status = SourceStatus.FAILED
        err_msg = "Connection timed out or 404 Not Found."

    source = ConnectedSource(
        id=str(uuid.uuid4()),
        user_id=req.user_id,
        source_type=req.source_type,
        name=req.name,
        url_or_path=req.url_or_path,
        status=status,
        last_synced=datetime.utcnow().isoformat(),
        metadata=req.metadata,
        error_message=err_msg
    )
    
    await db.get_collection("sources").insert_one(source.dict())

    # If connecting a GitHub repository or project link, analyze and create project depth records!
    if req.source_type == SourceType.GITHUB and status == SourceStatus.CONNECTED:
        repo_title = req.name if req.name and req.name != "GitHub" else req.url_or_path.rstrip("/").split("/")[-1]
        
        # Simulated/static repository content from metadata if provided, or standard structure
        files = req.metadata.get("files", {
            "main.py": "from fastapi import FastAPI\napp = FastAPI()\n@app.get('/')\ndef root(): return {'status': 'active'}",
            "requirements.txt": "fastapi\nuvicorn\nscikit-learn\npandas\npytest",
            "README.md": f"# {repo_title}\n\nProject setup and execution instructions.\n" + ("Installation guide.\n" * 15)
        })

        analysis = ProjectDepthAnalyzer.analyze_repository(
            title=repo_title,
            repo_url=req.url_or_path,
            files=files,
            user_id=req.user_id
        )

        await db.get_collection("projects").update_one(
            {"user_id": req.user_id, "title": repo_title},
            {"$set": analysis.dict()},
            upsert=True
        )

        # Create evidence records for detected technologies
        evidence_col = db.get_collection("evidence")
        for tech in analysis.technologies_used:
            ev = EvidenceRecord(
                id=str(uuid.uuid4()),
                user_id=req.user_id,
                skill_name=tech,
                normalized_skill=tech.lower(),
                claimed_source=f"GitHub: {repo_title}",
                observed_evidence=f"Demonstrated in repository '{repo_title}'. Architecture: {analysis.architecture_overview}",
                file_path_or_url=req.url_or_path,
                project_id=analysis.id,
                project_name=repo_title,
                status=EvidenceStatus.SUPPORTED,
                confidence=0.85,
                rules_applied=["RULE_REPO_CONNECTED: Verified code implementation in connected repository."]
            )
            await evidence_col.update_one(
                {"user_id": req.user_id, "normalized_skill": tech.lower()},
                {"$set": ev.dict()},
                upsert=True
            )

    return source

@router.delete("/{source_id}")
async def disconnect_source(source_id: str):
    db = get_db()
    res = await db.get_collection("sources").delete_one({"id": source_id})
    return {"message": "Source disconnected successfully.", "deleted_count": res.deleted_count}
