import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.models import Investigation, Event, UnknownGap, Hypothesis

@pytest.fixture(scope="module")
def client():
    # Setup tables
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "TRACE-X" in data["app_name"]

def test_demo_seed_and_status(client):
    seed_res = client.post("/api/demo/seed")
    assert seed_res.status_code == 200
    seed_data = seed_res.json()
    assert seed_data["status"] == "success"
    assert seed_data["investigation_id"] == "demo-campus-parking-001"

    status_res = client.get("/api/demo/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["exists"] is True

def test_investigation_creation_and_listing(client):
    payload = {
        "title": "Facility Perimeter Breach Test",
        "description": "Evaluating sensor gaps along East fence",
        "domain": "Infrastructure"
    }
    create_res = client.post("/api/investigations", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["title"] == payload["title"]
    assert created["domain"] == payload["domain"]
    inv_id = created["id"]

    list_res = client.get("/api/investigations")
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(i["id"] == inv_id for i in items)

def test_evidence_ingestion_metadata(client):
    # Retrieve demo investigation
    inv_id = "demo-campus-parking-001"
    
    # Upload evidence file metadata
    evidence_payload = {
        "name": "TEST_SENSOR_STREAM_B.csv",
        "file_type": "csv",
        "timestamp": "10:02:18",
        "location": "Sector B Perimeter",
        "source_category": "Sensor",
        "source_name": "Perimeter Vibration Sensor MS-04",
        "extracted_text": "Vibration intensity 0.88 spike at 10:02:18"
    }
    res = client.post(f"/api/investigations/{inv_id}/evidence", data=evidence_payload)
    assert res.status_code == 201
    ev_data = res.json()
    assert ev_data["name"] == "TEST_SENSOR_STREAM_B.csv"
    assert ev_data["status"] == "READY"

def test_timeline_and_gap_detection(client):
    inv_id = "demo-campus-parking-001"
    res = client.get(f"/api/investigations/{inv_id}/timeline")
    assert res.status_code == 200
    data = res.json()
    assert "events" in data
    assert "unknown_gaps" in data
    assert len(data["events"]) >= 5
    assert len(data["unknown_gaps"]) >= 1
    # Check that unknown gap covers 10:02:18 to 10:02:27
    gaps = data["unknown_gaps"]
    critical_gap = next((g for g in gaps if "10:02:18" in g["start_time"]), None)
    assert critical_gap is not None
    assert "10:02:27" in critical_gap["end_time"]
    assert "9 seconds" in critical_gap["duration"]

def test_hypothesis_and_expected_evidence(client):
    inv_id = "demo-campus-parking-001"
    res = client.get(f"/api/investigations/{inv_id}/hypotheses")
    assert res.status_code == 200
    hypotheses = res.json()
    assert len(hypotheses) >= 3
    # Check heuristic scores
    for h in hypotheses:
        assert 0 <= h["heuristic_score"] <= 100
        assert "expected_items" in h
        assert "counterfactuals" in h

def test_evidence_graph_generation(client):
    inv_id = "demo-campus-parking-001"
    res = client.get(f"/api/investigations/{inv_id}/graph")
    assert res.status_code == 200
    graph = res.json()
    assert "nodes" in graph
    assert "edges" in graph
    node_types = set(n["type"] for n in graph["nodes"])
    assert "eventNode" in node_types
    assert "hypothesisNode" in node_types
    assert "gapNode" in node_types

def test_investigation_report_generation(client):
    inv_id = "demo-campus-parking-001"
    res = client.post(f"/api/investigations/{inv_id}/report")
    assert res.status_code == 201
    report = res.json()
    assert "content_json" in report
    assert "legal_disclaimer" in report
    assert "TRACE-X is an analytical assistance system" in report["legal_disclaimer"]
