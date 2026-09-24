from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import (
    Investigation,
    Event,
    UnknownGap,
    Hypothesis,
    NextBestEvidence
)
from app.schemas.schemas import (
    EventResponse,
    UnknownGapResponse,
    HypothesisDetailResponse,
    NextBestEvidenceResponse,
    EvidenceGraphResponse
)
from app.analysis.engine import AnalysisPipelineEngine

router = APIRouter(tags=["Analysis Engine"])

@router.post("/api/investigations/{investigation_id}/analyze")
def trigger_analysis(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    engine = AnalysisPipelineEngine(db)
    result = engine.run_investigation_analysis(investigation_id)
    return result

@router.get("/api/investigations/{investigation_id}/timeline")
def get_timeline(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    events = db.query(Event).filter(Event.investigation_id == investigation_id).order_by(Event.timestamp.asc()).all()
    gaps = db.query(UnknownGap).filter(UnknownGap.investigation_id == investigation_id).all()

    return {
        "investigation_id": investigation_id,
        "events": events,
        "unknown_gaps": gaps,
        "total_events": len(events),
        "total_gaps": len(gaps)
    }

@router.get("/api/investigations/{investigation_id}/hypotheses", response_model=List[HypothesisDetailResponse])
def get_hypotheses(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    hypotheses = db.query(Hypothesis).filter(Hypothesis.investigation_id == investigation_id).all()
    return hypotheses

@router.get("/api/investigations/{investigation_id}/graph", response_model=EvidenceGraphResponse)
def get_evidence_graph(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    engine = AnalysisPipelineEngine(db)
    return engine.build_evidence_graph(investigation_id)

@router.get("/api/investigations/{investigation_id}/analysis")
def get_full_analysis(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    events = db.query(Event).filter(Event.investigation_id == investigation_id).order_by(Event.timestamp.asc()).all()
    gaps = db.query(UnknownGap).filter(UnknownGap.investigation_id == investigation_id).all()
    hypotheses = db.query(Hypothesis).filter(Hypothesis.investigation_id == investigation_id).all()
    next_best = db.query(NextBestEvidence).filter(NextBestEvidence.investigation_id == investigation_id).order_by(NextBestEvidence.heuristic_info_value.desc()).all()

    return {
        "investigation_id": investigation_id,
        "investigation_title": inv.title,
        "status": inv.status,
        "events": events,
        "unknown_gaps": gaps,
        "hypotheses": hypotheses,
        "next_best_evidence": next_best
    }

@router.get("/api/analysis")
def list_all_analyses(db: Session = Depends(get_db)):
    """Overview of all analyzed investigations for Analysis Hub"""
    completed_invs = db.query(Investigation).filter(Investigation.status == "COMPLETED").all()
    results = []
    for inv in completed_invs:
        gaps_count = db.query(UnknownGap).filter(UnknownGap.investigation_id == inv.id).count()
        hyp_count = db.query(Hypothesis).filter(Hypothesis.investigation_id == inv.id).count()
        results.append({
            "investigation_id": inv.id,
            "title": inv.title,
            "domain": inv.domain,
            "gaps_count": gaps_count,
            "hypotheses_count": hyp_count,
            "updated_at": inv.updated_at
        })
    return results
