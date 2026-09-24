from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.models import Profile
from app.schemas.schemas import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/api/auth", tags=["Authentication & Profile"])

def get_current_user_profile(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Profile:
    """
    Retrieves the active user profile. In demo/development mode, ensures a default profile exists.
    If Supabase token is provided, matches or creates the profile.
    """
    # Fallback to default demo user if not logged in
    user_id = "demo-investigator-001"
    
    # In production, Supabase JWT would be decoded here:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        # In full Supabase deployment, verify JWT with SUPABASE_JWT_SECRET or call supabase.auth.get_user(token)
        # If user ID embedded in demo token:
        if token != "undefined" and len(token) > 10:
            pass

    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        profile = Profile(
            id=user_id,
            email="investigator@trace-x.ai",
            full_name="Dr. Alex Rivera",
            organization="TRACE-X Campus Safety Intelligence",
            role="Senior Forensic Analyst",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile

@router.get("/me", response_model=ProfileResponse)
def get_me(current_user: Profile = Depends(get_current_user_profile)):
    return current_user

@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    updates: ProfileUpdate,
    current_user: Profile = Depends(get_current_user_profile),
    db: Session = Depends(get_db)
):
    if updates.full_name is not None:
        current_user.full_name = updates.full_name
    if updates.organization is not None:
        current_user.organization = updates.organization
    if updates.role is not None:
        current_user.role = updates.role
    if updates.avatar_url is not None:
        current_user.avatar_url = updates.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user
