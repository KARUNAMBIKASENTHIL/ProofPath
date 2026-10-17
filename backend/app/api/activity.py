from datetime import datetime, timedelta
import random
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query
from app.models.schemas import ActivityConsistencySummary, DailyActivity
from app.core.database import get_db

import uuid
from pydantic import BaseModel

router = APIRouter(prefix="/activity", tags=["Activity Consistency Analysis"])

class TrackLoginRequest(BaseModel):
    user_id: str
    action_label: Optional[str] = "Platform Login"

@router.post("/track-login")
async def track_login(req: TrackLoginRequest):
    db = get_db()
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    events_col = db.get_collection("historical_events")
    
    existing = await events_col.find_one({
        "user_id": req.user_id,
        "date": today_str,
        "event_type": "profile_synced"
    })
    if not existing:
        await events_col.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": req.user_id,
            "event_type": "profile_synced",
            "title": req.action_label or "Platform Login",
            "description": "User logged in and actively practiced in ProofPath workspace.",
            "date": today_str,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {"action": "login"}
        })
    return {"status": "success", "date": today_str}

@router.get("/consistency", response_model=ActivityConsistencySummary)
async def get_activity_consistency(
    user_id: str = Query(...),
    range_days: int = Query(90)
):
    if range_days not in [30, 60, 90, 180, 365]:
        range_days = 90
        
    db = get_db()
    today = datetime.utcnow()
    start_date = today - timedelta(days=range_days)
    
    # Query events in this period
    events_cursor = db.get_collection("historical_events").find({
        "user_id": user_id,
        "date": {"$gte": start_date.strftime("%Y-%m-%d")}
    })
    events = await events_cursor.to_list(500)
    
    # Check if demo user
    is_demo = (user_id == "demo-alex-chen" or len(events) == 0)
    
    daily_records: List[DailyActivity] = []
    active_days_count = 0
    total_events_count = 0
    
    # Generate daily breakdown
    for d in range(range_days):
        current_day = start_date + timedelta(days=d)
        date_str = current_day.strftime("%Y-%m-%d")
        
        # Count actual events matching date
        day_events = [e for e in events if e.get("date") == date_str]
        
        if is_demo and user_id == "demo-alex-chen":
            # Realistic simulation of a dedicated CS student over time
            # Coding active mostly on weekdays, with clusters around project milestones
            weekday = current_day.weekday() # 0-4 weekdays
            seed = (current_day.year * 1000) + (current_day.month * 31) + current_day.day
            rng = random.Random(seed)
            
            if weekday < 5 and rng.random() > 0.40:
                commits = rng.randint(1, 6)
                submissions = rng.randint(0, 3) if rng.random() > 0.6 else 0
                evt_cnt = len(day_events)
                total = commits + submissions + evt_cnt
                daily_records.append(DailyActivity(
                    date=date_str,
                    commit_count=commits,
                    submission_count=submissions,
                    events_count=evt_cnt,
                    total_activities=total
                ))
                active_days_count += 1
                total_events_count += total
            else:
                daily_records.append(DailyActivity(
                    date=date_str,
                    commit_count=0,
                    submission_count=0,
                    events_count=len(day_events),
                    total_activities=len(day_events)
                ))
                if len(day_events) > 0:
                    active_days_count += 1
                    total_events_count += len(day_events)
        else:
            # Genuine user data
            commits = 0
            submissions = 0
            evt_cnt = len(day_events)
            total = commits + submissions + evt_cnt
            if total > 0:
                active_days_count += 1
                total_events_count += total
            daily_records.append(DailyActivity(
                date=date_str,
                commit_count=commits,
                submission_count=submissions,
                events_count=evt_cnt,
                total_activities=total
            ))
            
    consistency_pct = round((active_days_count / max(range_days, 1)) * 100, 1)
    
    if consistency_pct > 40:
        pattern = "Sustained Longitudinal Iteration: Frequent weekly code updates and continuous repository refinement."
    elif consistency_pct > 20:
        pattern = "Sprint-Based Activity: Work is conducted in periodic milestone bursts with periods of offline study."
    elif active_days_count > 0:
        pattern = "Initial Activity Detected: Recent evidence contributions detected. Continuous weekly tracking recommended."
    else:
        pattern = "No Observable Activity Yet: Connect GitHub or upload weekly project updates to establish consistency patterns."
        
    return ActivityConsistencySummary(
        user_id=user_id,
        observation_period=f"Last {range_days} Days",
        start_date=start_date.strftime("%Y-%m-%d"),
        end_date=today.strftime("%Y-%m-%d"),
        total_active_days=active_days_count,
        total_observed_events=total_events_count,
        consistency_percentage=consistency_pct,
        maintenance_pattern=pattern,
        daily_breakdown=daily_records,
        limitations_disclosure="ProofPath measures only observable activity from explicitly connected platforms (e.g. public GitHub commits, LeetCode submissions, platform milestone submissions). Unobserved activity such as private repositories, offline reading, coursework, and local sandboxes are not recorded and are not penalized in skill readiness."
    )
