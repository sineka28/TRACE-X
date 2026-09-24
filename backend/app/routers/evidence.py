import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import (
    Investigation,
    EvidenceSource,
    EvidenceFile
)
from app.schemas.schemas import (
    EvidenceFileCreate,
    EvidenceFileResponse,
    EvidenceSourceCreate,
    EvidenceSourceResponse
)

router = APIRouter(tags=["Evidence Ingestion & Management"])

@router.get("/api/evidence", response_model=List[EvidenceFileResponse])
def list_all_evidence(db: Session = Depends(get_db)):
    """Global evidence list across all investigations for Evidence Hub"""
    return db.query(EvidenceFile).order_by(EvidenceFile.created_at.desc()).all()

@router.get("/api/investigations/{investigation_id}/evidence", response_model=List[EvidenceFileResponse])
def get_investigation_evidence(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return db.query(EvidenceFile).filter(EvidenceFile.investigation_id == investigation_id).order_by(EvidenceFile.created_at.desc()).all()

@router.post("/api/investigations/{investigation_id}/sources", response_model=EvidenceSourceResponse, status_code=status.HTTP_201_CREATED)
def create_evidence_source(
    investigation_id: str,
    payload: EvidenceSourceCreate,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    new_src = EvidenceSource(
        id=str(uuid.uuid4()),
        investigation_id=investigation_id,
        name=payload.name,
        source_category=payload.source_category,
        description=payload.description,
        location=payload.location,
        coverage_time_window=payload.coverage_time_window,
        source_metadata=payload.source_metadata or {}
    )
    db.add(new_src)
    db.commit()
    db.refresh(new_src)
    return new_src

@router.post("/api/investigations/{investigation_id}/evidence", response_model=EvidenceFileResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence_file(
    investigation_id: str,
    file: Optional[UploadFile] = File(None),
    name: Optional[str] = Form(None),
    file_type: Optional[str] = Form(None),
    timestamp: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    source_category: Optional[str] = Form("Other"),
    source_name: Optional[str] = Form(None),
    extracted_text: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    file_name = name or (file.filename if file else "evidence_record")
    f_type = file_type or (file_name.split(".")[-1].lower() if "." in file_name else "log")
    
    file_size = 0
    if file:
        content = await file.read()
        file_size = len(content)
        # Attempt to decode text content for unstructured ingestion
        if not extracted_text:
            try:
                extracted_text = content.decode("utf-8", errors="ignore")[:2000]
            except Exception:
                pass

    # Ensure source exists or create one
    source_label = source_name or f"{source_category} Source"
    source = db.query(EvidenceSource).filter(
        EvidenceSource.investigation_id == investigation_id,
        EvidenceSource.name == source_label
    ).first()

    if not source:
        source = EvidenceSource(
            id=str(uuid.uuid4()),
            investigation_id=investigation_id,
            name=source_label,
            source_category=source_category or "Other",
            location=location,
            coverage_time_window=timestamp or "Event Time"
        )
        db.add(source)
        db.commit()
        db.refresh(source)

    new_file = EvidenceFile(
        id=str(uuid.uuid4()),
        investigation_id=investigation_id,
        source_id=source.id,
        name=file_name,
        file_type=f_type,
        file_size=file_size,
        timestamp=timestamp or "10:00:00",
        location=location or "Perimeter",
        status="READY",
        extracted_text=extracted_text,
        file_path_or_url=f"/uploads/{file_name}"
    )
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    return new_file

@router.get("/api/evidence/{id}", response_model=EvidenceFileResponse)
def get_evidence_file(id: str, db: Session = Depends(get_db)):
    f = db.query(EvidenceFile).filter(EvidenceFile.id == id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Evidence file not found")
    return f

@router.delete("/api/evidence/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evidence_file(id: str, db: Session = Depends(get_db)):
    f = db.query(EvidenceFile).filter(EvidenceFile.id == id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Evidence file not found")
    db.delete(f)
    db.commit()
    return None
