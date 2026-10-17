from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.schemas import JobRoleDefinition
from app.services.role_catalog import get_role_catalog, get_role_by_id

router = APIRouter(prefix="/roles", tags=["Job Role Intelligence Engine"])

@router.get("", response_model=List[Dict[str, Any]])
async def list_roles():
    catalog = get_role_catalog()
    return [
        {
            "id": r.id,
            "name": r.name,
            "domain": r.domain,
            "description": r.description,
            "competency_count": len(r.competencies),
            "recommended_prerequisites": r.recommended_prerequisites,
            "version": r.version
        }
        for r in catalog.values()
    ]

@router.get("/{role_id}", response_model=JobRoleDefinition)
async def get_role(role_id: str):
    role = get_role_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail=f"Job role '{role_id}' not found.")
    return role
