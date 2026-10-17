import os
import re
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings
from app.models.schemas import Roadmap, RoadmapMilestone

class RAGChunk:
    def __init__(self, id: str, content: str, source_file: str, category: str, title: str, urls: List[str]):
        self.id = id
        self.content = content
        self.source_file = source_file
        self.category = category
        self.title = title
        self.urls = urls
        self.embedding: Optional[List[float]] = None

class RAGEngine:
    """
    RAG Pipeline for ingesting curated knowledge base and retrieving
    official guidance to generate actionable evidence-grounded roadmaps.
    """
    def __init__(self):
        self.chunks: List[RAGChunk] = []
        self.is_indexed = False
        self.knowledge_base_dir = settings.KNOWLEDGE_BASE_DIR

    def ingest_knowledge_base(self):
        """Recursively parses all markdown files in CareerLens_RAG_Knowledge_Base."""
        if not self.knowledge_base_dir.exists():
            return

        self.chunks = []
        for md_file in self.knowledge_base_dir.rglob("*.md"):
            try:
                with open(md_file, "r", encoding="utf-8") as f:
                    content = f.read()
                
                category = md_file.parent.name
                rel_path = md_file.name

                # Split by markdown headers
                sections = re.split(r'\n(?=##?\s)', content)
                for sec in sections:
                    sec_clean = sec.strip()
                    if not sec_clean or len(sec_clean) < 40:
                        continue
                    
                    header_match = re.match(r'^##?\s+(.*)', sec_clean)
                    title = header_match.group(1).strip() if header_match else rel_path
                    
                    # Extract URLs
                    urls = re.findall(r'https?://[^\s\)]+', sec_clean)

                    chunk = RAGChunk(
                        id=str(uuid.uuid4()),
                        content=sec_clean,
                        source_file=f"{category}/{rel_path}",
                        category=category,
                        title=title,
                        urls=urls
                    )
                    self.chunks.append(chunk)
            except Exception as e:
                pass

        self.is_indexed = True

    def retrieve(self, query: str, target_role: str = "", top_k: int = 4) -> List[RAGChunk]:
        """Semantic search with role and keyword weighting over curated chunks."""
        if not self.is_indexed or not self.chunks:
            self.ingest_knowledge_base()

        query_terms = set(re.findall(r'\w+', (query + " " + target_role).lower()))
        
        scored: List[tuple] = []
        for chunk in self.chunks:
            chunk_terms = set(re.findall(r'\w+', (chunk.title + " " + chunk.content).lower()))
            overlap = len(query_terms.intersection(chunk_terms))
            
            # Boost matches in target category or role
            score = float(overlap)
            if target_role.lower().replace(" ", "_") in chunk.source_file.lower():
                score += 5.0
            if "project_guide" in chunk.category.lower():
                score += 3.0
            if "criteria" in chunk.category.lower():
                score += 2.0
                
            scored.append((score, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [chunk for score, chunk in scored[:top_k]]

    def generate_personalized_roadmap(
        self,
        user_id: str,
        target_role: str,
        verified_strengths: List[str],
        not_yet_verified_gaps: List[str]
    ) -> Roadmap:
        """
        Synthesizes assessment findings and retrieved official documentation
        into prioritized, evidence-generating milestones.
        """
        if not self.is_indexed:
            self.ingest_knowledge_base()

        milestones: List[RoadmapMilestone] = []
        step_num = 1

        # Curated mappings for standard gaps to official milestones
        gap_configs = [
            {
                "gap_match": ["deployment", "containerization", "docker", "cloud"],
                "title": "Containerize Model Service with Docker & Health Checks",
                "skill_gap": "Containerization & Deployment",
                "why_this_matters": f"Essential for {target_role} roles to ensure reliable, reproducible hosting outside local notebooks.",
                "tasks": [
                    "Write a multi-stage Dockerfile pinning Python version and non-root user",
                    "Add /health and /metadata endpoints to the existing model service",
                    "Configure docker-compose.yml with resource limits",
                    "Test local container execution with mock prediction payloads"
                ],
                "deliverable": "Dockerfile, docker-compose.yml, and container execution logs.",
                "verification_criteria": "Observable Dockerfile in repo and working GET /health HTTP 200 response.",
                "estimated_duration": "4-6 days (Est.)",
                "source_files": ["project_guides/deploy_ml_model.md", "skill_criteria/deployment.md"]
            },
            {
                "gap_match": ["testing", "validation", "pytest"],
                "title": "Implement Automated Regression & Boundary Test Suite",
                "skill_gap": "Automated Testing & Code Quality",
                "why_this_matters": "Proves that model predictions, data preprocessing, and API endpoints handle invalid inputs safely.",
                "tasks": [
                    "Install pytest and configure conftest.py fixtures",
                    "Write unit tests for data cleaning functions testing NaN and extreme values",
                    "Write API endpoint tests for 422 Unprocessable Entity error responses",
                    "Run pytest with coverage report and commit to repository"
                ],
                "deliverable": "tests/ directory with test_api.py and test_pipeline.py achieving >75% coverage.",
                "verification_criteria": "Minimum 5 passing automated assertions verifying preprocessing logic and error handling.",
                "estimated_duration": "3-5 days (Est.)",
                "source_files": ["project_guides/test_ml_model.md"]
            },
            {
                "gap_match": ["api", "serving", "fastapi", "rest"],
                "title": "Build Typed REST API for Inference with Pydantic",
                "skill_gap": "Model Serving & REST APIs",
                "why_this_matters": "Demonstrates the bridge between mathematical training scripts and real software applications.",
                "tasks": [
                    "Define Pydantic schema for model feature inputs and prediction output",
                    "Create POST /predict endpoint loading pickled pipeline once on startup",
                    "Add structured logging for incoming prediction requests and latencies",
                    "Document API with interactive Swagger /docs"
                ],
                "deliverable": "FastAPI application with documented OpenAPI schema.",
                "verification_criteria": "Working FastAPI router with Pydantic validation and error handling.",
                "estimated_duration": "3-4 days (Est.)",
                "source_files": ["project_guides/build_rest_api.md", "skill_criteria/api_development.md"]
            },
            {
                "gap_match": ["monitoring", "observability", "metrics", "drift"],
                "title": "Add Prediction Logging & Baseline Model Drift Tracking",
                "skill_gap": "MLOps & Monitoring",
                "why_this_matters": "Distinguishes junior practitioners from production engineers who know models decay over time.",
                "tasks": [
                    "Record input feature distributions and prediction timestamps",
                    "Implement basic summary metric endpoint tracking daily prediction count",
                    "Document operational boundaries and failure fallback modes"
                ],
                "deliverable": "Operational logging module and system architecture README section.",
                "verification_criteria": "Structured JSON logs and documented monitoring strategy in README.md.",
                "estimated_duration": "4-5 days (Est.)",
                "source_files": ["roadmap_generation/roadmap_generation_policy.md"]
            }
        ]

        # Prioritize milestones based on actual unverified gaps
        selected_configs = []
        for gap_str in not_yet_verified_gaps:
            gap_lower = gap_str.lower()
            for cfg in gap_configs:
                if any(m in gap_lower for m in cfg["gap_match"]) and cfg not in selected_configs:
                    selected_configs.append(cfg)
                    break

        # Fallback if no specific gap matched or all verified
        if not selected_configs:
            selected_configs = gap_configs[:2]

        for cfg in selected_configs:
            # Query RAG for reference links
            retrieved = self.retrieve(cfg["title"], target_role, top_k=2)
            sources = list(set(cfg["source_files"] + [r.source_file for r in retrieved]))
            
            milestone = RoadmapMilestone(
                id=str(uuid.uuid4()),
                step_number=step_num,
                title=cfg["title"],
                skill_gap=cfg["skill_gap"],
                why_this_matters=cfg["why_this_matters"],
                tasks=cfg["tasks"],
                deliverable=cfg["deliverable"],
                verification_criteria=cfg["verification_criteria"],
                estimated_duration=cfg["estimated_duration"],
                source_files=sources,
                status="planned"
            )
            milestones.append(milestone)
            step_num += 1

        first_act = f"Begin Milestone 1: {milestones[0].title}. Address the {milestones[0].skill_gap} gap." if milestones else "Review evidence."
        checkpoint = "After completing Milestone 1 deliverables, submit your repository link or artifact for instant reassessment."

        return Roadmap(
            id=str(uuid.uuid4()),
            user_id=user_id,
            target_role=target_role,
            starting_point_summary=f"Evaluated evidence against {target_role}. Identified {len(verified_strengths)} verified strengths and {len(not_yet_verified_gaps)} priority gap(s).",
            verified_strengths=verified_strengths,
            not_yet_verified=not_yet_verified_gaps,
            milestones=milestones,
            first_action=first_act,
            reassessment_checkpoint=checkpoint
        )

rag_engine = RAGEngine()
