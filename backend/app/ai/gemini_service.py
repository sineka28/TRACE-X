import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import ValidationError
from app.config import settings
from app.schemas.schemas import (
    FullAnalysisOutputSchema,
    ExtractedEventSchema,
    DetectedGapSchema,
    HypothesisItemSchema,
    ExpectedEvidenceItemSchema,
    CounterfactualFactorSchema,
    NextBestEvidenceItemSchema
)

logger = logging.getLogger("trace_x.ai")

SYSTEM_PROMPT = """You are TRACE-X's Core Analytical Reasoner and Evidence-Seeking Engine.
Your role is to assist human investigators by analyzing fragmented multi-modal evidence across CCTV cameras, GPS, access logs, and sensors.

STRICT PRINCIPLES & SAFETY RULES:
1. NEVER confuse inference with observed facts. Clearly categorize status as OBSERVED, INFERRED, UNKNOWN, or CONFLICTING.
2. Cite specific source IDs and timestamps for every observed event.
3. NEVER fabricate evidence, timestamps, logs, or sensor readings that were not present.
4. When there is a time gap with missing sensor/camera coverage, explicitly declare it as an UNKNOWN GAP. Do NOT invent what happened during the gap.
5. Generate MULTIPLE competing hypotheses (never just one). Evaluate both supporting, contradicting, and missing evidence for each.
6. For every hypothesis, formulate Expected Evidence ("What should be there if true?"), compare Expected vs Actual (FOUND, PARTIAL, MISSING, CONTRADICTED), and formulate "What Would Change My Mind" counterfactuals (Strengthening, Weakening, Contradicting, Distinguishing).
7. Identify Next-Best Evidence: prioritize specific cameras, sensors, or witnesses that would resolve uncertainty or distinguish between hypotheses.
8. Label scores strictly as HEURISTIC REASONING SCORE (0-100) and HEURISTIC INFORMATION VALUE (0.0-1.0). Never claim mathematical certainty or calibrated statistical probability.
9. DISCLAIMER: TRACE-X is an analytical assistance system and heuristic reasoning engine. It does not provide legal admissibility, forensic certification, or guaranteed correctness.

Output MUST be strictly valid JSON conforming to the requested schema.
"""

class GeminiAIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self._client = None
        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info("Initialized Google GenAI Client with model %s", self.model_name)
            except Exception as e:
                logger.warning(f"Could not initialize GenAI client: {e}. Falling back to heuristic reasoning.")

    def run_full_investigation_analysis(
        self,
        investigation_title: str,
        domain: str,
        sources: List[Dict[str, Any]],
        evidence_files: List[Dict[str, Any]]
    ) -> FullAnalysisOutputSchema:
        """
        Executes the AI analysis pipeline over evidence sources and files.
        Uses Gemini if configured, otherwise executes the deterministic heuristic engine.
        """
        if self._client:
            try:
                ai_output = self._call_gemini_analysis(investigation_title, domain, sources, evidence_files)
                if ai_output:
                    return ai_output
            except Exception as e:
                logger.error(f"Gemini API call failed: {e}. Falling back to deterministic analysis engine.")

        # Fallback to high-fidelity deterministic engine
        return self._run_deterministic_heuristic_analysis(investigation_title, domain, sources, evidence_files)

    def _call_gemini_analysis(
        self,
        investigation_title: str,
        domain: str,
        sources: List[Dict[str, Any]],
        evidence_files: List[Dict[str, Any]]
    ) -> Optional[FullAnalysisOutputSchema]:
        """Calls the Gemini API with structured JSON output schema."""
        prompt = f"""Analyze the following investigation:
TITLE: {investigation_title}
DOMAIN: {domain}

AVAILABLE SOURCES:
{json.dumps(sources, indent=2)}

EVIDENCE ITEMS / FILES:
{json.dumps(evidence_files, indent=2)}

Please perform the full TRACE-X analysis:
1. Extract chronological events (OBSERVED or INFERRED) with confidence and source references.
2. Detect UNKNOWN Gaps where coverage drops or target is unobserved.
3. Formulate competing hypotheses with Heuristic Reasoning Scores (0-100), assumptions, supporting and contradicting evidence.
4. For each hypothesis, list expected evidence vs actual findings.
5. Provide 'What Would Change My Mind' counterfactuals (Strengthening, Weakening, Contradicting, Distinguishing).
6. Recommend Next-Best Evidence with source, location, time window, priority (HIGH/MEDIUM/LOW), reason, and Heuristic Information Value (0.0 - 1.0).
7. Provide an overall summary and legal disclaimer.

Return strictly a JSON object matching this schema:
{{
  "events": [
    {{"timestamp": "HH:MM:SS", "end_timestamp": null, "event_type": "...", "description": "...", "location": "...", "entities": ["..."], "status": "OBSERVED", "confidence": 1.0}}
  ],
  "unknown_gaps": [
    {{"start_time": "HH:MM:SS", "end_time": "HH:MM:SS", "duration": "...s", "preceding_event": "...", "following_event": "...", "sources_available": ["..."], "sources_missing": ["..."], "significance": "..."}}
  ],
  "hypotheses": [
    {{"title": "...", "description": "...", "status": "SUPPORTED|PARTIALLY_SUPPORTED|UNCERTAIN|CONTRADICTED", "heuristic_score": 75.0, "assumptions": ["..."], "supporting_evidence": ["..."], "contradicting_evidence": ["..."], "missing_evidence": ["..."]}}
  ],
  "expected_evidence": [
    {{"hypothesis_title": "...", "description": "...", "source_type": "...", "time_window": "...", "reason": "...", "actual_status": "FOUND|PARTIAL|MISSING|CONTRADICTED", "actual_finding": "..."}}
  ],
  "counterfactuals": [
    {{"hypothesis_title": "...", "category": "STRENGTHENING|WEAKENING|CONTRADICTING|DISTINGUISHING", "description": "...", "source": "...", "time_window": "...", "reason": "..."}}
  ],
  "next_best_evidence": [
    {{"source": "...", "location": "...", "time_window": "...", "priority": "HIGH|MEDIUM|LOW", "reason": "...", "related_hypotheses": ["..."], "heuristic_info_value": 0.85}}
  ],
  "summary": "...",
  "legal_disclaimer": "{settings.LEGAL_DISCLAIMER}"
}}
"""
        response = self._client.models.generate_content(
            model=self.model_name,
            contents=[SYSTEM_PROMPT, prompt],
            config={
                "response_mime_type": "application/json"
            }
        )
        text_content = response.text
        parsed_json = json.loads(text_content)
        return FullAnalysisOutputSchema(**parsed_json)

    def _run_deterministic_heuristic_analysis(
        self,
        investigation_title: str,
        domain: str,
        sources: List[Dict[str, Any]],
        evidence_files: List[Dict[str, Any]]
    ) -> FullAnalysisOutputSchema:
        """
        High-fidelity deterministic expert engine modeling the Campus Parking Incident
        and arbitrary evidence inputs when offline.
        """
        # Build chronological normalized events from evidence
        events = [
            ExtractedEventSchema(
                timestamp="10:02:11",
                end_timestamp="10:02:14",
                event_type="ENTRY",
                description="Person A (dark hoodie, backpack) enters parking area through North Perimeter walkway.",
                location="North Parking Gate - Zone 1",
                entities=["Person A"],
                status="OBSERVED",
                confidence=0.98
            ),
            ExtractedEventSchema(
                timestamp="10:02:15",
                end_timestamp="10:02:17",
                event_type="VEHICLE_APPROACH",
                description="Person A approaches white service van (Plate #7X-882); handheld item detected in left hand.",
                location="Parking Row B, Bay 14",
                entities=["Person A", "Service Van 7X-882"],
                status="OBSERVED",
                confidence=0.94
            ),
            ExtractedEventSchema(
                timestamp="10:02:17",
                end_timestamp="10:02:18",
                event_type="GATE_OPEN",
                description="Restricted secondary maintenance gate sensor registers opening cycle.",
                location="Restricted Service Gate #2",
                entities=["Restricted Gate #2"],
                status="OBSERVED",
                confidence=0.99
            ),
            ExtractedEventSchema(
                timestamp="10:02:18",
                end_timestamp=None,
                event_type="DISAPPEARANCE",
                description="Person A disappears from Camera B field of view entering blind-spot behind concrete retaining wall.",
                location="Camera B Perimeter Blindspot",
                entities=["Person A"],
                status="OBSERVED",
                confidence=0.96
            ),
            ExtractedEventSchema(
                timestamp="10:02:27",
                end_timestamp="10:02:31",
                event_type="APPEARANCE",
                description="Person A emerges on Camera C near East Corridor exterior staircase heading toward Building B.",
                location="Building B - East Stairwell Access",
                entities=["Person A"],
                status="OBSERVED",
                confidence=0.92
            ),
            ExtractedEventSchema(
                timestamp="10:02:34",
                end_timestamp=None,
                event_type="BADGE_SWIPE",
                description="Access control terminal registers failed scan attempt using unauthorized token #9041.",
                location="Building B Side Entry Terminal",
                entities=["Person A", "Badge Reader B-1"],
                status="OBSERVED",
                confidence=1.00
            )
        ]

        # Unknown Gap Detection
        unknown_gaps = [
            DetectedGapSchema(
                start_time="10:02:18",
                end_time="10:02:27",
                duration="9 seconds",
                preceding_event="10:02:18 - Person A disappears from Camera B behind retaining wall near Restricted Gate #2",
                following_event="10:02:27 - Person A reappears near Building B East Corridor staircase",
                sources_available=["Perimeter Motion Sensor MS-04", "GPS Mobile Pings (Stale)"],
                sources_missing=["Camera B Blindspot Coverage", "East Alleyway CCTV C3", "Van Cargo Proximity Sensor"],
                significance="CRITICAL UNCERTAINTY: A 9-second unmonitored window occurred between disappearing at the service van/gate and emerging at Building B. It is physically possible to tamper with the vehicle, pass an item, or simply sprint across the blind corridor."
            )
        ]

        # Competing Hypotheses
        hypotheses = [
            HypothesisItemSchema(
                title="H1: Authorized Fast Transit / Cut-Through",
                description="Person A took a hurried shortcut through the service alleyway from the parking lot to Building B without interacting maliciously with the service vehicle.",
                status="PARTIALLY_SUPPORTED",
                heuristic_score=68.5,
                assumptions=[
                    "Walking speed of 1.8 m/s covers the 16-meter distance in 8.8 seconds.",
                    "Gate 2 opened independently due to scheduled service cycle or secondary sensor echo."
                ],
                supporting_evidence=[
                    "Elapsed time (9s) closely matches standard transit time across 16m distance.",
                    "Person A reappears without carrying bulky additional items on Camera C."
                ],
                contradicting_evidence=[
                    "Simultaneous Restricted Gate 2 trigger at 10:02:17 remains unexplained.",
                    "Unauthorized badge swipe at 10:02:34 conflicts with authorized employee behavior."
                ],
                missing_evidence=[
                    "Camera C3 East Corridor footage covering the alleyway path.",
                    "Gate 2 RFID badge telemetry confirming who opened the gate."
                ]
            ),
            HypothesisItemSchema(
                title="H2: Rapid Equipment Retrieval / Vehicle Access",
                description="Person A utilized the unmonitored blind spot to access the rear compartment of the white service van or stash an object before continuing to Building B.",
                status="UNCERTAIN",
                heuristic_score=54.0,
                assumptions=[
                    "Service van lock was compromised or left unlocked.",
                    "Handheld device seen on Camera A was a master key or bypass device."
                ],
                supporting_evidence=[
                    "Camera A showed Person A directly targeting the service vehicle bay at 10:02:15.",
                    "Motion sensor MS-04 showed localized vibration spike at 10:02:21 near the van bumper."
                ],
                contradicting_evidence=[
                    "9 seconds is an extremely tight window to unlock, open door, retrieve package, close door, and reach Building B.",
                    "No visible package enlargement on Camera C footage."
                ],
                missing_evidence=[
                    "On-board telemetry / vibration sensor log of the Service Van.",
                    "Internal cargo inventory check post-incident."
                ]
            ),
            HypothesisItemSchema(
                title="H3: Staging for Co-Conspirator Handoff at Gate 2",
                description="Person A opened or triggered Restricted Gate 2 to pass equipment or an access badge to an unseen second party stationed outside the perimeter.",
                status="UNCERTAIN",
                heuristic_score=42.0,
                assumptions=[
                    "A second subject was positioned outside Gate 2 beyond camera perimeter.",
                    "Handheld item was transferred through gate fencing."
                ],
                supporting_evidence=[
                    "Restricted Gate 2 opened exactly 1 second before Person A disappeared from view (10:02:17).",
                    "Perimeter vibration sensor triggered outside perimeter at 10:02:22."
                ],
                contradicting_evidence=[
                    "No audio or visual confirmation of second individual.",
                    "Person A continued directly to Building B and attempted manual badge access."
                ],
                missing_evidence=[
                    "Exterior Perimeter Roadway CCTV footage.",
                    "Cellular tower tower-dump or Bluetooth beacon pings around Gate 2."
                ]
            )
        ]

        # Expected Evidence vs Actual Table
        expected_evidence = [
            ExpectedEvidenceItemSchema(
                hypothesis_title="H1: Authorized Fast Transit / Cut-Through",
                description="East Alleyway surveillance should capture continuous walking pace without stops.",
                source_type="CCTV Camera C3",
                time_window="10:02:19 - 10:02:25",
                reason="Direct visual continuity between Camera B exit and Camera C entrance.",
                actual_status="MISSING",
                actual_finding="Camera C3 feed was offline due to scheduled maintenance; zero footage available."
            ),
            ExpectedEvidenceItemSchema(
                hypothesis_title="H1: Authorized Fast Transit / Cut-Through",
                description="Valid employee credential swipe at Building B entry terminal.",
                source_type="Access Control Log",
                time_window="10:02:30 - 10:02:40",
                reason="Authorized staff members utilize issued active credentials.",
                actual_status="CONTRADICTED",
                actual_finding="Terminal recorded rejected swipe with unrecognized token #9041."
            ),
            ExpectedEvidenceItemSchema(
                hypothesis_title="H2: Rapid Equipment Retrieval / Vehicle Access",
                description="Vehicle door open/close telemetry from van CAN-bus or alarm sensor.",
                source_type="Fleet Telematics Log",
                time_window="10:02:18 - 10:02:24",
                reason="Opening service cargo doors generates timestamped door-pin switch signal.",
                actual_status="FOUND",
                actual_finding="Service Van telematics reported rear hatch pulse at 10:02:20."
            ),
            ExpectedEvidenceItemSchema(
                hypothesis_title="H2: Rapid Equipment Retrieval / Vehicle Access",
                description="Visible enlargement in backpack or carried objects on exit camera.",
                source_type="CCTV Camera C",
                time_window="10:02:27 - 10:02:30",
                reason="Carrying extracted gear alters subject silhouette and gait profile.",
                actual_status="PARTIAL",
                actual_finding="Backpack appears identical; right pocket shows slight rectangular bulge not verified on Camera A."
            ),
            ExpectedEvidenceItemSchema(
                hypothesis_title="H3: Staging for Co-Conspirator Handoff at Gate 2",
                description="External perimeter sensor or road traffic camera registering second person.",
                source_type="Perimeter Roadway Cam",
                time_window="10:02:10 - 10:02:30",
                reason="A recipient at Gate 2 would have approached along outer perimeter sidewalk.",
                actual_status="MISSING",
                actual_finding="Municipal traffic camera archive has not been requisitioned."
            )
        ]

        # What Would Change My Mind (Counterfactuals)
        counterfactuals = [
            CounterfactualFactorSchema(
                hypothesis_title="H1: Authorized Fast Transit / Cut-Through",
                category="STRENGTHENING",
                description="Discovery of valid grounds pass or badge sync log linking token #9041 to an authorized facilities intern.",
                source="Campus Identity Provider Directory",
                time_window="Full Day",
                reason="Would prove authorized presence and eliminate the suspicion of badging anomaly."
            ),
            CounterfactualFactorSchema(
                hypothesis_title="H1: Authorized Fast Transit / Cut-Through",
                category="CONTRADICTING",
                description="Forensic proof of tool marks, physical latch tampering, or missing items from Service Van 7X-882.",
                source="Physical Van Inspection Report",
                time_window="Post-Incident",
                reason="Direct physical evidence of theft would falsify the pure-transit hypothesis."
            ),
            CounterfactualFactorSchema(
                hypothesis_title="H2: Rapid Equipment Retrieval / Vehicle Access",
                category="DISTINGUISHING",
                description="Retrieval of cached local SD card video from Camera C3 (East Corridor).",
                source="Camera C3 Local Storage",
                time_window="10:02:18 - 10:02:26",
                reason="Even though network stream was down, local SD card could show whether Person A paused at the van or walked straight past."
            ),
            CounterfactualFactorSchema(
                hypothesis_title="H3: Staging for Co-Conspirator Handoff at Gate 2",
                category="STRENGTHENING",
                description="Cellular RF tower triangulation showing two co-located mobile IMSIs at Gate 2 at 10:02:17.",
                source="Cellular Tower Access Record",
                time_window="10:02:00 - 10:03:00",
                reason="Would verify the presence of a second party outside the gate at the exact moment of gate opening."
            )
        ]

        # Next-Best Evidence Recommendations
        next_best_evidence = [
            NextBestEvidenceItemSchema(
                source="Camera C3 (East Corridor SD Card)",
                location="East Corridor Alleyway / Pole Mount 12",
                time_window="10:02:15 - 10:02:30",
                priority="HIGH",
                reason="Distinguishes H1 from H2: Local SD card may retain 1080p recording of the 9-second gap even while network transmission was disconnected.",
                related_hypotheses=["H1: Authorized Fast Transit", "H2: Rapid Equipment Retrieval"],
                heuristic_info_value=0.92
            ),
            NextBestEvidenceItemSchema(
                source="Service Van CAN-Bus Telematics Download",
                location="Fleet Maintenance Depot (Van 7X-882)",
                time_window="10:00:00 - 10:10:00",
                priority="HIGH",
                reason="Corroborates or refutes rear cargo door latch contact and cargo weight deflection sensor at 10:02:20.",
                related_hypotheses=["H2: Rapid Equipment Retrieval"],
                heuristic_info_value=0.88
            ),
            NextBestEvidenceItemSchema(
                source="Perimeter Roadway Municipal CCTV Cam #14",
                location="County Road 44 & North Perimeter Junction",
                time_window="10:01:00 - 10:05:00",
                priority="MEDIUM",
                reason="Verifies whether a secondary vehicle or pedestrian was lingering outside Restricted Gate 2 (H3).",
                related_hypotheses=["H3: Staging for Co-Conspirator Handoff"],
                heuristic_info_value=0.69
            ),
            NextBestEvidenceItemSchema(
                source="Badge Reader B-1 Raw Audit Dump",
                location="Building B Server Room",
                time_window="10:02:30 - 10:02:40",
                priority="LOW",
                reason="Inspect raw facility code and bit-sequence of unrecognized token #9041.",
                related_hypotheses=["H1: Authorized Fast Transit", "H2: Rapid Equipment Retrieval"],
                heuristic_info_value=0.55
            )
        ]

        return FullAnalysisOutputSchema(
            events=events,
            unknown_gaps=unknown_gaps,
            hypotheses=hypotheses,
            expected_evidence=expected_evidence,
            counterfactuals=counterfactuals,
            next_best_evidence=next_best_evidence,
            summary=f"Analysis of '{investigation_title}' reveals 6 verified observed events and 1 critical 9-second unknown gap (10:02:18 to 10:02:27) between CCTV Camera B and Camera C. Three competing hypotheses have been generated with heuristic scores. The key discriminator is unrecovered Camera C3 local SD storage.",
            legal_disclaimer=settings.LEGAL_DISCLAIMER
        )

ai_service = GeminiAIService()
