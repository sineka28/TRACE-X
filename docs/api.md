# TRACE-X REST API Documentation

The TRACE-X backend is built with FastAPI and exposes an interactive OpenAPI Swagger UI at:
```
http://localhost:8000/docs
```

## 1. System Health
- **Endpoint**: `GET /health`
- **Description**: Returns real-time connectivity status of database, Supabase, and Gemini AI.
- **Response**:
```json
{
  "status": "healthy",
  "app_name": "TRACE-X",
  "environment": "development",
  "gemini_configured": true,
  "supabase_configured": true,
  "database": "sqlite"
}
```

---

## 2. Synthetic Demo Engine
- **Endpoint**: `POST /api/demo/seed`
- **Description**: Seeds or refreshes the built-in synthetic **Campus Parking Incident** (6 evidence sources, 9-second unknown gap, 3 competing hypotheses, expected vs actual breakdown, and next-best evidence recommendations).
- **Response**:
```json
{
  "status": "success",
  "message": "Campus Parking Incident synthetic demo seeded successfully",
  "investigation_id": "demo-campus-parking-001",
  "title": "Campus Parking Incident (SYNTHETIC DEMO DATA)",
  "is_synthetic_demo": true
}
```

- **Endpoint**: `GET /api/demo/status`
- **Description**: Returns current availability of the synthetic demo incident.

---

## 3. Investigations
- **Endpoint**: `GET /api/investigations`
  - Returns list of investigations with evidence counts, hypothesis counts, and unknown gap counts.
- **Endpoint**: `POST /api/investigations`
  - Body: `{ "title": "string", "description": "string", "domain": "string" }`
- **Endpoint**: `GET /api/investigations/{id}`
  - Returns detailed investigation including sources, evidence files, normalized events, unknown gaps, hypotheses, and next-best recommendations.
- **Endpoint**: `PUT /api/investigations/{id}`
  - Updates title, description, domain, or status.
- **Endpoint**: `DELETE /api/investigations/{id}`
  - Cascades and deletes all child evidentiary items.

---

## 4. Evidence Ingestion
- **Endpoint**: `GET /api/evidence`
  - Returns global list of all evidence items across investigations.
- **Endpoint**: `POST /api/investigations/{id}/evidence`
  - Multipart form or JSON containing file, timestamp, location, source_category, extracted_text.
- **Endpoint**: `DELETE /api/evidence/{id}`
  - Deletes evidence file.

---

## 5. Analysis & Reasoning Engine
- **Endpoint**: `POST /api/investigations/{id}/analyze`
  - Triggers the complete 12-step TRACE-X analytical pipeline (event normalization, gap detection, hypothesis generation, expected vs actual matrix, counterfactual analysis, next-best evidence calculation, and React Flow topology generation).
- **Endpoint**: `GET /api/investigations/{id}/timeline`
  - Returns chronological observed events and detected unknown gaps.
- **Endpoint**: `GET /api/investigations/{id}/hypotheses`
  - Returns competing hypotheses with Heuristic Reasoning Scores, assumptions, expected items, and counterfactual factors.
- **Endpoint**: `GET /api/investigations/{id}/graph`
  - Returns React Flow node and edge JSON structures for interactive canvas visualization.

---

## 6. Investigation Reports
- **Endpoint**: `GET /api/reports`
  - Lists all generated investigation reports.
- **Endpoint**: `GET /api/reports/{id}`
  - Returns complete structured investigation report JSON.
- **Endpoint**: `POST /api/investigations/{id}/report`
  - Generates or updates formal analytical report.
