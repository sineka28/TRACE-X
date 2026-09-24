from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

# -------------------------------------------------------------
# Base Models & Profiles
# -------------------------------------------------------------

class ProfileBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    organization: Optional[str] = "TRACE-X Labs"
    role: Optional[str] = "Lead Investigator"
    avatar_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    id: str

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None
    role: Optional[str] = None
    avatar_url: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -------------------------------------------------------------
# Evidence Sources & Files
# -------------------------------------------------------------

class EvidenceSourceBase(BaseModel):
    name: str
    source_category: str # CCTV, GPS, Access Control, Sensor, Statement, Document, Image, Video, Log, Other
    description: Optional[str] = None
    location: Optional[str] = None
    coverage_time_window: Optional[str] = None
    source_metadata: Optional[Dict[str, Any]] = None

class EvidenceSourceCreate(EvidenceSourceBase):
    investigation_id: str

class EvidenceSourceResponse(EvidenceSourceBase):
    id: str
    investigation_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EvidenceFileBase(BaseModel):
    name: str
    file_type: str # image, video, csv, json, txt, pdf, log
    timestamp: Optional[str] = None
    location: Optional[str] = None
    source_id: Optional[str] = None

class EvidenceFileCreate(EvidenceFileBase):
    investigation_id: str
    file_size: Optional[int] = 0
    file_path_or_url: Optional[str] = None
    status: Optional[str] = "READY"
    extracted_text: Optional[str] = None
    file_metadata: Optional[Dict[str, Any]] = None

class EvidenceFileResponse(EvidenceFileBase):
    id: str
    investigation_id: str
    file_size: int
    file_path_or_url: Optional[str] = None
    status: str
    extracted_text: Optional[str] = None
    file_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -------------------------------------------------------------
# Events & Timeline
# -------------------------------------------------------------

class EventBase(BaseModel):
    timestamp: str
    end_timestamp: Optional[str] = None
    event_type: str
    description: str
    location: Optional[str] = None
    entities: List[str] = []
    status: str = "OBSERVED" # OBSERVED, INFERRED, UNKNOWN, CONFLICTING
    confidence: float = 1.0
    event_metadata: Optional[Dict[str, Any]] = None

class EventCreate(EventBase):
    investigation_id: str
    source_id: Optional[str] = None

class EventResponse(EventBase):
    id: str
    investigation_id: str
    source_id: Optional[str] = None
    source_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -------------------------------------------------------------
# Unknown Gaps
# -------------------------------------------------------------

class UnknownGapBase(BaseModel):
    start_time: str
    end_time: str
    duration: str
    preceding_event: Optional[str] = None
    following_event: Optional[str] = None
    sources_available: List[str] = []
    sources_missing: List[str] = []
    significance: Optional[str] = None

class UnknownGapResponse(UnknownGapBase):
    id: str
    investigation_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -------------------------------------------------------------
# Expected Evidence & Counterfactuals
# -------------------------------------------------------------

class ExpectedEvidenceResponse(BaseModel):
    id: str
    investigation_id: str
    hypothesis_id: str
    description: str
    source_type: str
    time_window: str
    reason: str
    actual_status: str # FOUND, PARTIAL, MISSING, CONTRADICTED, UNKNOWN
    actual_finding: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CounterfactualFactorResponse(BaseModel):
    id: str
    hypothesis_id: str
    category: str # STRENGTHENING, WEAKENING, CONTRADICTING, DISTINGUISHING
    description: str
    source: str
    time_window: str
    reason: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -------------------------------------------------------------
# Hypotheses
# -------------------------------------------------------------

class HypothesisBase(BaseModel):
    title: str
    description: str
    status: str = "UNCERTAIN" # SUPPORTED, PARTIALLY_SUPPORTED, UNCERTAIN, CONTRADICTED, INSUFFICIENT_EVIDENCE
    heuristic_score: float = 50.0 # Heuristic reasoning score
    assumptions: List[str] = []
    supporting_evidence: List[str] = []
    contradicting_evidence: List[str] = []
    missing_evidence: List[str] = []

class HypothesisResponse(HypothesisBase):
    id: str
    investigation_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class HypothesisDetailResponse(HypothesisResponse):
    expected_items: List[ExpectedEvidenceResponse] = []
    counterfactuals: List[CounterfactualFactorResponse] = []

# -------------------------------------------------------------
# Next-Best Evidence
# -------------------------------------------------------------

class NextBestEvidenceResponse(BaseModel):
    id: str
    investigation_id: str
    source: str
    location: str
    time_window: str
    priority: str # HIGH, MEDIUM, LOW
    reason: str
    related_hypotheses: List[str] = []
    heuristic_info_value: float # 0.0 - 1.0
    status: str # PENDING, REQUESTED, COLLECTED, UNAVAILABLE
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -------------------------------------------------------------
# Graph Representation (for React Flow)
# -------------------------------------------------------------

class GraphNode(BaseModel):
    id: str
    type: str # evidenceNode, eventNode, gapNode, hypothesisNode, expectedNode, nextBestNode
    position: Dict[str, float]
    data: Dict[str, Any]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None # supports, contradicts, derived_from, expected_if, missing, could_distinguish
    type: Optional[str] = "smoothstep"
    animated: Optional[bool] = False
    style: Optional[Dict[str, Any]] = None

class EvidenceGraphResponse(BaseModel):
    investigation_id: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# -------------------------------------------------------------
# Investigations
# -------------------------------------------------------------

class InvestigationBase(BaseModel):
    title: str
    description: Optional[str] = None
    domain: str = "Campus Safety"

class InvestigationCreate(InvestigationBase):
    pass

class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None
    status: Optional[str] = None

class InvestigationResponse(InvestigationBase):
    id: str
    user_id: Optional[str] = None
    status: str
    is_synthetic_demo: bool
    evidence_count: Optional[int] = 0
    hypotheses_count: Optional[int] = 0
    gaps_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InvestigationDetailResponse(InvestigationResponse):
    sources: List[EvidenceSourceResponse] = []
    evidence_files: List[EvidenceFileResponse] = []
    events: List[EventResponse] = []
    unknown_gaps: List[UnknownGapResponse] = []
    hypotheses: List[HypothesisDetailResponse] = []
    next_best_evidence_items: List[NextBestEvidenceResponse] = []

# -------------------------------------------------------------
# Reports
# -------------------------------------------------------------

class ReportCreate(BaseModel):
    investigation_id: str
    title: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    investigation_id: str
    title: str
    summary: str
    content_json: Dict[str, Any]
    legal_disclaimer: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -------------------------------------------------------------
# Notifications
# -------------------------------------------------------------

class NotificationResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    investigation_id: Optional[str] = None
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -------------------------------------------------------------
# AI Output Schemas (Validated with Pydantic)
# -------------------------------------------------------------

class ExtractedEventSchema(BaseModel):
    timestamp: str
    end_timestamp: Optional[str] = None
    event_type: str
    description: str
    location: Optional[str] = None
    entities: List[str] = []
    status: str = "OBSERVED" # OBSERVED, INFERRED, UNKNOWN, CONFLICTING
    confidence: float = 1.0

class DetectedGapSchema(BaseModel):
    start_time: str
    end_time: str
    duration: str
    preceding_event: str
    following_event: str
    sources_available: List[str]
    sources_missing: List[str]
    significance: str

class HypothesisItemSchema(BaseModel):
    title: str
    description: str
    status: str # SUPPORTED, PARTIALLY_SUPPORTED, UNCERTAIN, CONTRADICTED, INSUFFICIENT_EVIDENCE
    heuristic_score: float # 0 - 100
    assumptions: List[str]
    supporting_evidence: List[str]
    contradicting_evidence: List[str]
    missing_evidence: List[str]

class ExpectedEvidenceItemSchema(BaseModel):
    hypothesis_title: str
    description: str
    source_type: str
    time_window: str
    reason: str
    actual_status: str # FOUND, PARTIAL, MISSING, CONTRADICTED, UNKNOWN
    actual_finding: str

class CounterfactualFactorSchema(BaseModel):
    hypothesis_title: str
    category: str # STRENGTHENING, WEAKENING, CONTRADICTING, DISTINGUISHING
    description: str
    source: str
    time_window: str
    reason: str

class NextBestEvidenceItemSchema(BaseModel):
    source: str
    location: str
    time_window: str
    priority: str # HIGH, MEDIUM, LOW
    reason: str
    related_hypotheses: List[str]
    heuristic_info_value: float # 0.0 - 1.0

class FullAnalysisOutputSchema(BaseModel):
    events: List[ExtractedEventSchema]
    unknown_gaps: List[DetectedGapSchema]
    hypotheses: List[HypothesisItemSchema]
    expected_evidence: List[ExpectedEvidenceItemSchema]
    counterfactuals: List[CounterfactualFactorSchema]
    next_best_evidence: List[NextBestEvidenceItemSchema]
    summary: str
    legal_disclaimer: str
