from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.demo_data import seed_synthetic_demo_data, DEMO_INVESTIGATION_ID
from app.models.models import Investigation

router = APIRouter(prefix="/api/demo", tags=["Demo Mode"])

@router.post("/seed")
def seed_demo(db: Session = Depends(get_db)):
    """
    Seeds or re-seeds the built-in synthetic Campus Parking Incident demo.
    Returns the investigation metadata.
    """
    inv = seed_synthetic_demo_data(db)
    return {
        "status": "success",
        "message": "Campus Parking Incident synthetic demo seeded successfully",
        "investigation_id": inv.id,
        "title": inv.title,
        "is_synthetic_demo": True
    }

@router.get("/status")
def get_demo_status(db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == DEMO_INVESTIGATION_ID).first()
    return {
        "exists": bool(inv),
        "investigation_id": DEMO_INVESTIGATION_ID if inv else None,
        "title": inv.title if inv else None
    }
