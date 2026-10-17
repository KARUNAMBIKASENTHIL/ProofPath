import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, Dict, Any
from app.models.schemas import UserRegister, UserLogin, Token, UserProfile, UserRole, UserProfileUpdate
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(req: UserRegister):
    db = get_db()
    users_col = db.get_collection("users")
    
    existing = await users_col.find_one({"email": req.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    user_doc = {
        "email": req.email.lower().strip(),
        "password_hash": hash_password(req.password),
        "full_name": req.full_name.strip(),
        "role": req.role.value if hasattr(req.role, 'value') else req.role,
        "degree": req.degree,
        "institution": None,
        "graduation_year": req.graduation_year,
        "target_role": req.target_role,
        "phone": None,
        "location": None,
        "linkedin_url": None,
        "github_url": None,
        "portfolio_url": None,
        "summary": None,
        "preferred_domains": []
    }
    res = await users_col.insert_one(user_doc)
    user_id = str(res.inserted_id)
    user_doc["id"] = user_id

    # Track registration login event
    try:
        events_col = db.get_collection("historical_events")
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        await events_col.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "event_type": "profile_synced",
            "title": "Account Created & Initial Login",
            "description": "User created account and accessed ProofPath workspace.",
            "date": today_str,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {"action": "register"}
        })
    except Exception:
        pass

    token = create_access_token({"sub": user_id, "email": user_doc["email"], "role": user_doc["role"]})
    return Token(access_token=token, user=user_doc)

@router.post("/login", response_model=Token)
async def login(req: UserLogin):
    db = get_db()
    users_col = db.get_collection("users")
    
    clean_email = req.email.lower().strip()
    user = await users_col.find_one({"email": clean_email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    if not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
            
    user_id = str(user.get("_id") or user.get("id"))
    user_data = {
        "id": user_id,
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user.get("role", "student"),
        "degree": user.get("degree"),
        "institution": user.get("institution"),
        "graduation_year": user.get("graduation_year"),
        "target_role": user.get("target_role"),
        "phone": user.get("phone"),
        "location": user.get("location"),
        "linkedin_url": user.get("linkedin_url"),
        "github_url": user.get("github_url"),
        "portfolio_url": user.get("portfolio_url"),
        "summary": user.get("summary")
    }

    # Log login event in historical_events if not already recorded today
    try:
        events_col = db.get_collection("historical_events")
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        existing_today = await events_col.find_one({
            "user_id": user_id,
            "date": today_str,
            "event_type": "profile_synced"
        })
        if not existing_today:
            await events_col.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "event_type": "profile_synced",
                "title": "Platform Login",
                "description": "User logged in to ProofPath Career Intelligence workspace.",
                "date": today_str,
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": {"action": "login"}
            })
    except Exception:
        pass

    token = create_access_token({"sub": user_id, "email": user["email"], "role": user_data["role"]})
    return Token(access_token=token, user=user_data)

@router.get("/me", response_model=UserProfile)
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token required.")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")
        
    db = get_db()
    user_id = payload.get("sub")
    user = await db.get_collection("users").find_one({"_id": user_id})
    if not user:
        user = await db.get_collection("users").find_one({"id": user_id})
    if not user:
        user = await db.get_collection("users").find_one({"email": payload.get("email")})
        
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
        
    return UserProfile(
        id=str(user.get("_id") or user.get("id")),
        email=user["email"],
        full_name=user["full_name"],
        role=UserRole(user.get("role", "student")),
        degree=user.get("degree"),
        institution=user.get("institution"),
        graduation_year=user.get("graduation_year"),
        target_role=user.get("target_role"),
        phone=user.get("phone"),
        location=user.get("location"),
        linkedin_url=user.get("linkedin_url"),
        github_url=user.get("github_url"),
        portfolio_url=user.get("portfolio_url"),
        summary=user.get("summary")
    )

@router.put("/profile", response_model=UserProfile)
async def update_profile_authenticated(req: UserProfileUpdate, authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token required.")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")
        
    user_id = payload.get("sub")
    return await _do_update_profile(user_id, req)

@router.put("/profile/{user_id}", response_model=UserProfile)
async def update_profile_by_id(user_id: str, req: UserProfileUpdate):
    return await _do_update_profile(user_id, req)

async def _do_update_profile(user_id: str, req: UserProfileUpdate) -> UserProfile:
    db = get_db()
    users_col = db.get_collection("users")
    
    user = await users_col.find_one({"_id": user_id})
    if not user:
        user = await users_col.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    update_fields = {}
    for field, val in req.dict().items():
        if val is not None:
            update_fields[field] = val

    if update_fields:
        target_id = user.get("_id") or user.get("id")
        await users_col.update_one({"$or": [{"_id": target_id}, {"id": target_id}]}, {"$set": update_fields})
        user = await users_col.find_one({"$or": [{"_id": target_id}, {"id": target_id}]})

    return UserProfile(
        id=str(user.get("_id") or user.get("id")),
        email=user["email"],
        full_name=user["full_name"],
        role=UserRole(user.get("role", "student")),
        degree=user.get("degree"),
        institution=user.get("institution"),
        graduation_year=user.get("graduation_year"),
        target_role=user.get("target_role"),
        phone=user.get("phone"),
        location=user.get("location"),
        linkedin_url=user.get("linkedin_url"),
        github_url=user.get("github_url"),
        portfolio_url=user.get("portfolio_url"),
        summary=user.get("summary")
    )
