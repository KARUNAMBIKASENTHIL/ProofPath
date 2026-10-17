import uuid
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import db_manager, get_db
from app.services.rag_engine import rag_engine
from app.services.sample_data import get_demo_student_alex_chen
from app.services.scoring_engine import ScoringEngine
from app.services.role_catalog import get_role_by_id
from app.models.schemas import EvidenceRecord

# API Routers
from app.api.auth import router as auth_router
from app.api.resumes import router as resumes_router
from app.api.sources import router as sources_router
from app.api.roles import router as roles_router
from app.api.projects import router as projects_router
from app.api.assessments import router as assessments_router
from app.api.proof_graph import router as proof_graph_router
from app.api.viva import router as viva_router
from app.api.roadmaps import router as roadmaps_router
from app.api.simulator import router as simulator_router
from app.api.discovery import router as discovery_router
from app.api.growth import router as growth_router
from app.api.placement import router as placement_router
from app.api.mcp_routes import router as mcp_router
from app.api.history import router as history_router
from app.api.activity import router as activity_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("proofpath.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting CareerLens backend engine...")
    await db_manager.connect()
    
    # Pre-index RAG knowledge base
    try:
        rag_engine.ingest_knowledge_base()
        logger.info(f"Ingested {len(rag_engine.chunks)} knowledge chunks into RAG index.")
    except Exception as e:
        logger.warning(f"RAG ingestion warning: {e}")

    # Seed demo profile in DB
    try:
        db = get_db()
        demo = get_demo_student_alex_chen()
        for ev in demo["evidence_records"]:
            await db.get_collection("evidence").update_one(
                {"id": ev.id},
                {"$set": ev.dict()},
                upsert=True
            )
        for s in demo["sources"]:
            await db.get_collection("sources").update_one(
                {"id": s.id},
                {"$set": s.dict()},
                upsert=True
            )
        for p in demo["projects"]:
            await db.get_collection("projects").update_one(
                {"id": p.id},
                {"$set": p.dict()},
                upsert=True
            )
        for g in demo["growth_history"]:
            await db.get_collection("growth_snapshots").update_one(
                {"id": g.id},
                {"$set": g.dict()},
                upsert=True
            )
        # Seed demo user
        from app.core.security import hash_password
        await db.get_collection("users").update_one(
            {"email": "alex.chen@proofpath.io"},
            {"$set": {
                "id": "demo-alex-chen",
                "email": "alex.chen@proofpath.io",
                "password_hash": hash_password("password123"),
                "full_name": "Alex Chen",
                "role": "student",
                "degree": "B.S. in Computer Science",
                "graduation_year": 2026,
                "target_role": "Machine Learning Engineer",
                "preferred_domains": ["AI/ML", "Cloud Systems"]
            }},
            upsert=True
        )
        # Seed placement officer demo user
        await db.get_collection("users").update_one(
            {"email": "placement@proofpath.io"},
            {"$set": {
                "id": "placement-officer-1",
                "email": "placement@proofpath.io",
                "password_hash": hash_password("placement123"),
                "full_name": "Prof. Sarah Jenkins",
                "role": "placement_officer",
                "degree": "Department of Career Services",
                "graduation_year": 2026,
                "target_role": "Career Development Director",
                "preferred_domains": ["Placement Intelligence"]
            }},
            upsert=True
        )
        # Seed recruiter demo user
        await db.get_collection("users").update_one(
            {"email": "recruiter@proofpath.io"},
            {"$set": {
                "id": "recruiter-1",
                "email": "recruiter@proofpath.io",
                "password_hash": hash_password("recruiter123"),
                "full_name": "Marcus Vance (Lead Tech Recruiter)",
                "role": "recruiter",
                "degree": "Talent Acquisition & Placement Directorate",
                "graduation_year": 2026,
                "target_role": "Head of Technical Recruiting",
                "preferred_domains": ["Technical Hiring", "Candidate Auditing"]
            }},
            upsert=True
        )
        logger.info("Seeded Alex Chen, Recruiter & Placement Officer accounts successfully.")
    except Exception as e:
        logger.warning(f"Demo seeding warning: {e}")

    yield
    # Shutdown
    await db_manager.close()
    logger.info("CareerLens backend engine shutdown complete.")

app = FastAPI(
    title="CareerLens API",
    description="AI-Powered Employability Intelligence & Career Readiness Analyzer",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
api_v1 = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=api_v1)
app.include_router(resumes_router, prefix=api_v1)
app.include_router(sources_router, prefix=api_v1)
app.include_router(roles_router, prefix=api_v1)
app.include_router(projects_router, prefix=api_v1)
app.include_router(assessments_router, prefix=api_v1)
app.include_router(proof_graph_router, prefix=api_v1)
app.include_router(viva_router, prefix=api_v1)
app.include_router(roadmaps_router, prefix=api_v1)
app.include_router(simulator_router, prefix=api_v1)
app.include_router(discovery_router, prefix=api_v1)
app.include_router(growth_router, prefix=api_v1)
app.include_router(placement_router, prefix=api_v1)
app.include_router(mcp_router, prefix=api_v1)
app.include_router(history_router, prefix=api_v1)
app.include_router(activity_router, prefix=api_v1)

@app.get("/")
async def root():
    return {
        "app": "ProofPath",
        "tagline": "Your skills. Your proof. Your next step.",
        "status": "operational",
        "version": settings.APP_VERSION,
        "database_mode": "MongoDB Atlas" if db_manager.is_mongodb_connected else "Local File-Backed Store",
        "rag_chunks_indexed": len(rag_engine.chunks),
        "demo_mode": settings.DEMO_MODE,
        "docs_url": "/docs"
    }
