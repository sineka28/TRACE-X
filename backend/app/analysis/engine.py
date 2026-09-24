import uuid
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import (
    Investigation,
    EvidenceSource,
    EvidenceFile,
    Event,
    UnknownGap,
    Hypothesis,
    ExpectedEvidence,
    CounterfactualFactor,
    NextBestEvidence,
    Report,
    Notification
)
from app.ai.gemini_service import ai_service
from app.schemas.schemas import EvidenceGraphResponse, GraphNode, GraphEdge
from app.config import settings

class AnalysisPipelineEngine:
    def __init__(self, db: Session):
        self.db = db

    def run_investigation_analysis(self, investigation_id: str) -> Dict[str, Any]:
        """
        Executes the 12-step TRACE-X analysis workflow for an investigation.
        """
        investigation = self.db.query(Investigation).filter(Investigation.id == investigation_id).first()
        if not investigation:
            raise ValueError(f"Investigation {investigation_id} not found")

        # 1. Ingesting Evidence
        sources = self.db.query(EvidenceSource).filter(EvidenceSource.investigation_id == investigation_id).all()
        evidence_files = self.db.query(EvidenceFile).filter(EvidenceFile.investigation_id == investigation_id).all()

        sources_payload = [
            {
                "id": s.id,
                "name": s.name,
                "category": s.source_category,
                "location": s.location,
                "time_window": s.coverage_time_window,
                "description": s.description
            }
            for s in sources
        ]

        evidence_payload = [
            {
                "id": f.id,
                "name": f.name,
                "type": f.file_type,
                "location": f.location,
                "timestamp": f.timestamp,
                "extracted_text": f.extracted_text
            }
            for f in evidence_files
        ]

        # 2-11. Call AI Analysis service (Gemini or Deterministic Reasoner)
        analysis_data = ai_service.run_full_investigation_analysis(
            investigation_title=investigation.title,
            domain=investigation.domain,
            sources=sources_payload,
            evidence_files=evidence_payload
        )

        # Clear previous generated artifacts for this investigation
        self.db.query(Event).filter(Event.investigation_id == investigation_id).delete()
        self.db.query(UnknownGap).filter(UnknownGap.investigation_id == investigation_id).delete()
        self.db.query(NextBestEvidence).filter(NextBestEvidence.investigation_id == investigation_id).delete()
        
        # Hypotheses cascade deletes expected_evidence and counterfactuals
        self.db.query(Hypothesis).filter(Hypothesis.investigation_id == investigation_id).delete()
        self.db.commit()

        # Step 3 & 4: Save Normalized Events into Unified Timeline
        event_model_map = {}
        for ev in analysis_data.events:
            # Match source if available
            matched_source = None
            if sources:
                for s in sources:
                    if s.name.lower() in ev.description.lower() or (ev.location and s.location and s.location.lower() in ev.location.lower()):
                        matched_source = s
                        break
                if not matched_source:
                    matched_source = sources[0]

            db_event = Event(
                id=str(uuid.uuid4()),
                investigation_id=investigation_id,
                source_id=matched_source.id if matched_source else None,
                timestamp=ev.timestamp,
                end_timestamp=ev.end_timestamp,
                event_type=ev.event_type,
                description=ev.description,
                location=ev.location,
                entities=ev.entities,
                status=ev.status,
                confidence=ev.confidence,
                event_metadata={"source_label": matched_source.name if matched_source else "Sensory Input"}
            )
            self.db.add(db_event)
            event_model_map[ev.timestamp] = db_event

        # Step 5: Save Unknown Gaps
        for gap in analysis_data.unknown_gaps:
            db_gap = UnknownGap(
                id=str(uuid.uuid4()),
                investigation_id=investigation_id,
                start_time=gap.start_time,
                end_time=gap.end_time,
                duration=gap.duration,
                preceding_event=gap.preceding_event,
                following_event=gap.following_event,
                sources_available=gap.sources_available,
                sources_missing=gap.sources_missing,
                significance=gap.significance
            )
            self.db.add(db_gap)

        self.db.commit()

        # Step 6: Save Hypotheses & Step 7/8/10 Expected Evidence + Counterfactuals
        hypo_title_to_id = {}
        for hyp in analysis_data.hypotheses:
            db_hyp = Hypothesis(
                id=str(uuid.uuid4()),
                investigation_id=investigation_id,
                title=hyp.title,
                description=hyp.description,
                status=hyp.status,
                heuristic_score=hyp.heuristic_score,
                assumptions=hyp.assumptions,
                supporting_evidence=hyp.supporting_evidence,
                contradicting_evidence=hyp.contradicting_evidence,
                missing_evidence=hyp.missing_evidence
            )
            self.db.add(db_hyp)
            self.db.flush()
            hypo_title_to_id[hyp.title] = db_hyp.id

            # Save Expected Evidence for this hypothesis
            for exp in analysis_data.expected_evidence:
                if exp.hypothesis_title.strip() == hyp.title.strip() or hyp.title.split(":")[0] in exp.hypothesis_title:
                    db_exp = ExpectedEvidence(
                        id=str(uuid.uuid4()),
                        investigation_id=investigation_id,
                        hypothesis_id=db_hyp.id,
                        description=exp.description,
                        source_type=exp.source_type,
                        time_window=exp.time_window,
                        reason=exp.reason,
                        actual_status=exp.actual_status,
                        actual_finding=exp.actual_finding
                    )
                    self.db.add(db_exp)

            # Save Counterfactuals ("What Would Change My Mind")
            for cf in analysis_data.counterfactuals:
                if cf.hypothesis_title.strip() == hyp.title.strip() or hyp.title.split(":")[0] in cf.hypothesis_title:
                    db_cf = CounterfactualFactor(
                        id=str(uuid.uuid4()),
                        hypothesis_id=db_hyp.id,
                        category=cf.category,
                        description=cf.description,
                        source=cf.source,
                        time_window=cf.time_window,
                        reason=cf.reason
                    )
                    self.db.add(db_cf)

        # Step 11: Save Next-Best Evidence
        for nbe in analysis_data.next_best_evidence:
            db_nbe = NextBestEvidence(
                id=str(uuid.uuid4()),
                investigation_id=investigation_id,
                source=nbe.source,
                location=nbe.location,
                time_window=nbe.time_window,
                priority=nbe.priority,
                reason=nbe.reason,
                related_hypotheses=nbe.related_hypotheses,
                heuristic_info_value=nbe.heuristic_info_value,
                status="PENDING"
            )
            self.db.add(db_nbe)

        # Create or update Master Investigation Report
        report = self.db.query(Report).filter(Report.investigation_id == investigation_id).first()
        report_content = {
            "title": f"Investigation Synthesis: {investigation.title}",
            "domain": investigation.domain,
            "executive_summary": analysis_data.summary,
            "event_count": len(analysis_data.events),
            "unknown_gaps_count": len(analysis_data.unknown_gaps),
            "hypotheses_count": len(analysis_data.hypotheses),
            "next_best_count": len(analysis_data.next_best_evidence),
            "ai_disclosure": "This report was generated with AI-assisted heuristic reasoning via TRACE-X. All scores represent relative heuristic weights.",
            "legal_disclaimer": settings.LEGAL_DISCLAIMER
        }

        if report:
            report.title = f"Report: {investigation.title}"
            report.summary = analysis_data.summary
            report.content_json = report_content
            report.legal_disclaimer = settings.LEGAL_DISCLAIMER
        else:
            report = Report(
                id=str(uuid.uuid4()),
                investigation_id=investigation_id,
                title=f"Report: {investigation.title}",
                summary=analysis_data.summary,
                content_json=report_content,
                legal_disclaimer=settings.LEGAL_DISCLAIMER
            )
            self.db.add(report)

        # Update investigation status
        investigation.status = "COMPLETED"

        # Create notification
        notif = Notification(
            id=str(uuid.uuid4()),
            user_id=investigation.user_id,
            investigation_id=investigation_id,
            type="success",
            title="Analysis Completed",
            message=f"Investigation '{investigation.title}' analysis completed. {len(analysis_data.hypotheses)} hypotheses and {len(analysis_data.unknown_gaps)} critical gaps identified."
        )
        self.db.add(notif)
        self.db.commit()

        return {
            "status": "success",
            "investigation_id": investigation_id,
            "events_count": len(analysis_data.events),
            "gaps_count": len(analysis_data.unknown_gaps),
            "hypotheses_count": len(analysis_data.hypotheses),
            "next_best_count": len(analysis_data.next_best_evidence),
            "summary": analysis_data.summary
        }

    def build_evidence_graph(self, investigation_id: str) -> EvidenceGraphResponse:
        """
        Step 12: Builds the interactive React Flow node-edge graph structure:
        Nodes: Evidence, Event, Unknown Gap, Hypothesis, Expected, Next-Best
        Edges: supports, contradicts, derived_from, expected_if, missing, could_distinguish
        """
        sources = self.db.query(EvidenceSource).filter(EvidenceSource.investigation_id == investigation_id).all()
        events = self.db.query(Event).filter(Event.investigation_id == investigation_id).order_by(Event.timestamp).all()
        gaps = self.db.query(UnknownGap).filter(UnknownGap.investigation_id == investigation_id).all()
        hypotheses = self.db.query(Hypothesis).filter(Hypothesis.investigation_id == investigation_id).all()
        expected = self.db.query(ExpectedEvidence).filter(ExpectedEvidence.investigation_id == investigation_id).all()
        next_best = self.db.query(NextBestEvidence).filter(NextBestEvidence.investigation_id == investigation_id).all()

        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []

        # Column layout positions:
        # Col 0: Sources (X: 50)
        # Col 1: Observed Events & Gaps (X: 380)
        # Col 2: Hypotheses (X: 740)
        # Col 3: Expected Evidence (X: 1100)
        # Col 4: Next-Best Evidence (X: 1450)

        # 1. Sources Nodes
        y = 50
        for s in sources:
            node_id = f"src-{s.id}"
            nodes.append(GraphNode(
                id=node_id,
                type="evidenceNode",
                position={"x": 50.0, "y": float(y)},
                data={
                    "label": s.name,
                    "category": s.source_category,
                    "location": s.location,
                    "coverage": s.coverage_time_window,
                    "badge": "SOURCE"
                }
            ))
            y += 130

        # 2. Events & Gaps Nodes
        y = 40
        for ev in events:
            node_id = f"event-{ev.id}"
            nodes.append(GraphNode(
                id=node_id,
                type="eventNode",
                position={"x": 380.0, "y": float(y)},
                data={
                    "label": f"{ev.timestamp} - {ev.event_type}",
                    "description": ev.description,
                    "status": ev.status,
                    "confidence": ev.confidence,
                    "location": ev.location,
                    "badge": ev.status
                }
            ))
            # Link from source if available
            if ev.source_id:
                edges.append(GraphEdge(
                    id=f"e-src-{ev.source_id}-ev-{ev.id}",
                    source=f"src-{ev.source_id}",
                    target=node_id,
                    label="derived_from",
                    style={"stroke": "#64748B", "strokeDasharray": "3,3"}
                ))
            y += 120

        # Gaps
        for gap in gaps:
            gap_node_id = f"gap-{gap.id}"
            nodes.append(GraphNode(
                id=gap_node_id,
                type="gapNode",
                position={"x": 380.0, "y": float(y)},
                data={
                    "label": f"GAP: {gap.start_time} - {gap.end_time} ({gap.duration})",
                    "description": gap.significance or "Unobserved time gap",
                    "badge": "UNKNOWN GAP",
                    "duration": gap.duration
                }
            ))
            y += 140

        # 3. Hypotheses Nodes
        y = 60
        for hyp in hypotheses:
            hyp_node_id = f"hyp-{hyp.id}"
            nodes.append(GraphNode(
                id=hyp_node_id,
                type="hypothesisNode",
                position={"x": 760.0, "y": float(y)},
                data={
                    "label": hyp.title,
                    "description": hyp.description[:120] + "...",
                    "status": hyp.status,
                    "score": hyp.heuristic_score,
                    "badge": f"HEURISTIC: {hyp.heuristic_score:.1f}%"
                }
            ))

            # Edge to unknown gap
            if gaps:
                edges.append(GraphEdge(
                    id=f"e-gap-{gaps[0].id}-{hyp.id}",
                    source=f"gap-{gaps[0].id}",
                    target=hyp_node_id,
                    label="addresses_gap",
                    type="default",
                    animated=True,
                    style={"stroke": "#D97706"}
                ))

            # Edges between events and hypothesis (supporting or contradicting)
            for ev in events:
                if "door" in ev.description.lower() or "gate" in ev.description.lower():
                    if "Cut-Through" in hyp.title:
                        edges.append(GraphEdge(
                            id=f"e-ev-{ev.id}-hyp-{hyp.id}",
                            source=f"event-{ev.id}",
                            target=hyp_node_id,
                            label="contradicts",
                            style={"stroke": "#EF4444", "strokeWidth": 2}
                        ))
                if "van" in ev.description.lower() or "vehicle" in ev.description.lower():
                    if "Retrieval" in hyp.title:
                        edges.append(GraphEdge(
                            id=f"e-ev-{ev.id}-hyp-{hyp.id}",
                            source=f"event-{ev.id}",
                            target=hyp_node_id,
                            label="supports",
                            style={"stroke": "#10B981", "strokeWidth": 2}
                        ))

            y += 170

        # 4. Expected Evidence Nodes
        y = 50
        for exp in expected:
            exp_node_id = f"exp-{exp.id}"
            nodes.append(GraphNode(
                id=exp_node_id,
                type="expectedNode",
                position={"x": 1140.0, "y": float(y)},
                data={
                    "label": exp.description[:60] + "...",
                    "source": exp.source_type,
                    "time_window": exp.time_window,
                    "status": exp.actual_status,
                    "badge": f"ACTUAL: {exp.actual_status}"
                }
            ))

            edges.append(GraphEdge(
                id=f"e-hyp-{exp.hypothesis_id}-exp-{exp.id}",
                source=f"hyp-{exp.hypothesis_id}",
                target=exp_node_id,
                label="expected_if",
                style={"stroke": "#6366F1"}
            ))
            y += 130

        # 5. Next-Best Evidence Nodes
        y = 80
        for nbe in next_best:
            nbe_node_id = f"nbe-{nbe.id}"
            nodes.append(GraphNode(
                id=nbe_node_id,
                type="nextBestNode",
                position={"x": 1500.0, "y": float(y)},
                data={
                    "label": nbe.source,
                    "location": nbe.location,
                    "priority": nbe.priority,
                    "info_value": f"{nbe.heuristic_info_value * 100:.0f}%",
                    "reason": nbe.reason[:90] + "...",
                    "badge": f"PRIORITY: {nbe.priority}"
                }
            ))

            # Connect to hypotheses it can distinguish
            for hyp in hypotheses:
                for rel in nbe.related_hypotheses:
                    if rel.split(":")[0] in hyp.title:
                        edges.append(GraphEdge(
                            id=f"e-hyp-{hyp.id}-nbe-{nbe.id}",
                            source=f"hyp-{hyp.id}",
                            target=nbe_node_id,
                            label="could_distinguish",
                            animated=True,
                            style={"stroke": "#059669", "strokeWidth": 2}
                        ))
            y += 150

        return EvidenceGraphResponse(
            investigation_id=investigation_id,
            nodes=nodes,
            edges=edges
        )
