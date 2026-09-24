import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import (
    Investigation,
    EvidenceSource,
    EvidenceFile,
    Event,
    UnknownGap,
    Hypothesis,
    NextBestEvidence,
    Profile
)
from app.schemas.schemas import (
    InvestigationCreate,
    InvestigationUpdate,
    InvestigationResponse,
    InvestigationDetailResponse
)
from app.routers.auth import get_current_user_profile

router = APIRouter(prefix="/api/investigations", tags=["Investigations"])

@router.get("", response_model=List[InvestigationResponse])
def list_investigations(
    current_user: Profile = Depends(get_current_user_profile),
    db: Session = Depends(get_db)
):
    investigations = db.query(Investigation).order_by(Investigation.created_at.desc()).all()
    
    results = []
    for inv in investigations:
        ev_count = db.query(EvidenceFile).filter(EvidenceFile.investigation_id == inv.id).count()
        hyp_count = db.query(Hypothesis).filter(Hypothesis.investigation_id == inv.id).count()
        gap_count = db.query(UnknownGap).filter(UnknownGap.investigation_id == inv.id).count()

        results.append(InvestigationResponse(
            id=inv.id,
            user_id=inv.user_id,
            title=inv.title,
            description=inv.description,
            domain=inv.domain,
            status=inv.status,
            is_synthetic_demo=inv.is_synthetic_demo,
            evidence_count=ev_count,
            hypotheses_count=hyp_count,
            gaps_count=gap_count,
            created_at=inv.created_at,
            updated_at=inv.updated_at
        ))
    return results

@router.post("", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED)
def create_investigation(
    payload: InvestigationCreate,
    current_user: Profile = Depends(get_current_user_profile),
    db: Session = Depends(get_db)
):
    new_inv = Investigation(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        domain=payload.domain,
        status="ACTIVE",
        is_synthetic_demo=False
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)

    return InvestigationResponse(
        id=new_inv.id,
        user_id=new_inv.user_id,
        title=new_inv.title,
        description=new_inv.description,
        domain=new_inv.domain,
        status=new_inv.status,
        is_synthetic_demo=new_inv.is_synthetic_demo,
        evidence_count=0,
        hypotheses_count=0,
        gaps_count=0,
        created_at=new_inv.created_at,
        updated_at=new_inv.updated_at
    )

@router.get("/{id}", response_model=InvestigationDetailResponse)
def get_investigation_detail(
    id: str,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    ev_count = db.query(EvidenceFile).filter(EvidenceFile.investigation_id == inv.id).count()
    hyp_count = db.query(Hypothesis).filter(Hypothesis.investigation_id == inv.id).count()
    gap_count = db.query(UnknownGap).filter(UnknownGap.investigation_id == inv.id).count()

    sources = db.query(EvidenceSource).filter(EvidenceSource.investigation_id == id).all()
    evidence_files = db.query(EvidenceFile).filter(EvidenceFile.investigation_id == id).all()
    events = db.query(Event).filter(Event.investigation_id == id).order_by(Event.timestamp).all()
    gaps = db.query(UnknownGap).filter(UnknownGap.investigation_id == id).all()
    hypotheses = db.query(Hypothesis).filter(Hypothesis.investigation_id == id).all()
    next_best = db.query(NextBestEvidence).filter(NextBestEvidence.investigation_id == id).order_by(NextBestEvidence.heuristic_info_value.desc()).all()

    return InvestigationDetailResponse(
        id=inv.id,
        user_id=inv.user_id,
        title=inv.title,
        description=inv.description,
        domain=inv.domain,
        status=inv.status,
        is_synthetic_demo=inv.is_synthetic_demo,
        evidence_count=ev_count,
        hypotheses_count=hyp_count,
        gaps_count=gap_count,
        created_at=inv.created_at,
        updated_at=inv.updated_at,
        sources=sources,
        evidence_files=evidence_files,
        events=events,
        unknown_gaps=gaps,
        hypotheses=hypotheses,
        next_best_evidence_items=next_best
    )

@router.put("/{id}", response_model=InvestigationResponse)
def update_investigation(
    id: str,
    payload: InvestigationUpdate,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    if payload.title is not None:
        inv.title = payload.title
    if payload.description is not None:
        inv.description = payload.description
    if payload.domain is not None:
        inv.domain = payload.domain
    if payload.status is not None:
        inv.status = payload.status

    db.commit()
    db.refresh(inv)

    ev_count = db.query(EvidenceFile).filter(EvidenceFile.investigation_id == inv.id).count()
    hyp_count = db.query(Hypothesis).filter(Hypothesis.investigation_id == inv.id).count()
    gap_count = db.query(UnknownGap).filter(UnknownGap.investigation_id == inv.id).count()

    return InvestigationResponse(
        id=inv.id,
        user_id=inv.user_id,
        title=inv.title,
        description=inv.description,
        domain=inv.domain,
        status=inv.status,
        is_synthetic_demo=inv.is_synthetic_demo,
        evidence_count=ev_count,
        hypotheses_count=hyp_count,
        gaps_count=gap_count,
        created_at=inv.created_at,
        updated_at=inv.updated_at
    )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investigation(
    id: str,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    
    db.delete(inv)
    db.commit()
    return None
