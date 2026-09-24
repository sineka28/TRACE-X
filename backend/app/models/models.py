import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    organization = Column(String, default="TRACE-X Labs")
    role = Column(String, default="Lead Investigator")
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    domain = Column(String, default="General")  # Transportation, Campus Safety, Public Safety, Infrastructure, Healthcare, Security, Other
    status = Column(String, default="ACTIVE")    # ACTIVE, IN_PROGRESS, COMPLETED, ARCHIVED
    is_synthetic_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    sources = relationship("EvidenceSource", back_populates="investigation", cascade="all, delete-orphan")
    evidence_files = relationship("EvidenceFile", back_populates="investigation", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="investigation", cascade="all, delete-orphan")
    unknown_gaps = relationship("UnknownGap", back_populates="investigation", cascade="all, delete-orphan")
    hypotheses = relationship("Hypothesis", back_populates="investigation", cascade="all, delete-orphan")
    expected_evidence_items = relationship("ExpectedEvidence", back_populates="investigation", cascade="all, delete-orphan")
    next_best_evidence_items = relationship("NextBestEvidence", back_populates="investigation", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="investigation", cascade="all, delete-orphan")


class EvidenceSource(Base):
    __tablename__ = "evidence_sources"

    id = Column(String, primary_key=True, default=generate_uuid)
    investigation_id = Column(String, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    source_category = Column(String, nullable=False) # CCTV, GPS, Access Control, Sensor, Statement, Document, Image, Video, Log, Other
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    coverage_time_window = Column(String, nullable=True)
    source_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="sources")
    files = relationship("EvidenceFile", back_populates="source")
    events = relationship("Event", back_populates="source")


class EvidenceFile(Base):
    __tablename__ = "evidence_files"

    id = Column(String, primary_key=True, default=generate_uuid)
    investigation_id = Column(String, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    source_id = Column(String, ForeignKey("evidence_sources.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # image, video, csv, json, txt, pdf, log
    file_path_or_url = Column(String, nullable=True)
    file_size = Column(Integer, default=0)
    timestamp = Column(String, nullable=True)
    location = Column(String, nullable=True)
    status = Column(String, default="READY") # UPLOADING, PROCESSING, READY, FAILED
    extracted_text = Column(Text, nullable=True)
    file_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="evidence_files")
    source = relationship("EvidenceSource", back_populates="files")


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=generate_uuid)
    investigation_id = Column(String, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    source_id = Column(String, ForeignKey("evidence_sources.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(String, nullable=False, index=True)
    end_timestamp = Column(String, nullable=True)
    event_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=True)
    entities = Column(JSON, default=list) # e.g. ["Person A", "Vehicle X"]
    status = Column(String, default="OBSERVED") # OBSERVED, INFERRED, UNKNOWN, CONFLICTING
    confidence = Column(Float, default=1.0)
    event_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="events")
    source = relationship("EvidenceSource", back_populates="events")


class UnknownGap(Base):
    __tablename__ = "unknown_gaps"

    id = Column(String, primary_key=True, default=generate_uuid)
    investigation_id = Column(String, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    duration = Column(String, nullable=False) # e.g. "9 seconds"
    preceding_event = Column(Text, nullable=True)
    following_event = Column(Text, nullable=True)
    sources_available = Column(JSON, default=list)
    sources_missing = Column(JSON, default=list)
    significance = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="unknown_gaps")


class Hypothesis(Base):
    __tablename__ = "hypotheses"

    id = Column(String, primary_key=True, default=generate_uuid)
    investigation_id = Column(String, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="UNCERTAIN") # SUPPORTED, PARTIALLY_SUPPORTED, UNCERTAIN, CONTRADICTED, INSUFFICIENT_EVIDENCE
    heuristic_score = Column(Float, default=50.0) # HEURISTIC REASONING SCORE (0-100)
    assumptions = Column(JSON, default=list)
    supporting_evidence = Column(JSON, default=list)
    contradicting_evidence = Column(JSON, default=list)
    missing_evidence = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="hypotheses")
    expected_items = relationship("ExpectedEvidence", back_populates="hypothesis", cascade="all, delete-orphan")
    counterfactuals = relationship("CounterfactualFactor", back_populates="hypothesis", cascade="all, delete-orphan")


class ExpectedEvidence(Base):
    __tablename__ = "expected_evidence"

    id = Column(String, primary_key=True, default=generate_uuid)
    investigation_id = Column(String, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    hypothesis_id = Column(String, ForeignKey("hypotheses.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text, nullable=False)
    source_type = Column(String, nullable=False)
    time_window = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    actual_status = Column(String, default="UNKNOWN") # FOUND, PARTIAL, MISSING, CONTRADICTED, UNKNOWN
    actual_finding = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="expected_evidence_items")
    hypothesis = relationship("Hypothesis", back_populates="expected_items")


class CounterfactualFactor(Base):
    """What Would Change My Mind factors"""
    __tablename__ = "counterfactual_factors"

    id = Column(String, primary_key=True, default=generate_uuid)
    hypothesis_id = Column(String, ForeignKey("hypotheses.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False) # STRENGTHENING, WEAKENING, CONTRADICTING, DISTINGUISHING
    description = Column(Text, nullable=False)
    source = Column(String, nullable=False)
    time_window = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    hypothesis = relationship("Hypothesis", back_populates="counterfactuals")


class NextBestEvidence(Base):
    __tablename__ = "next_best_evidence"

    id = Column(String, primary_key=True, default=generate_uuid)
    investigation_id = Column(String, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    source = Column(String, nullable=False)
    location = Column(String, nullable=False)
    time_window = Column(String, nullable=False)
    priority = Column(String, default="MEDIUM") # HIGH, MEDIUM, LOW
    reason = Column(Text, nullable=False)
    related_hypotheses = Column(JSON, default=list)
    heuristic_info_value = Column(Float, default=0.75) # 0.0 - 1.0
    status = Column(String, default="PENDING") # PENDING, REQUESTED, COLLECTED, UNAVAILABLE
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="next_best_evidence_items")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    investigation_id = Column(String, ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    content_json = Column(JSON, default=dict)
    legal_disclaimer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="reports")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True, index=True)
    investigation_id = Column(String, nullable=True)
    type = Column(String, default="info") # info, success, warning, alert
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
