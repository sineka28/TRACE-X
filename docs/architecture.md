# TRACE-X Architecture & System Design

## 1. Overview

**TRACE-X** is an AI-powered hidden event reconstruction and evidence-seeking platform designed to analyze fragmented multi-modal evidence (CCTV footage, GPS telemetry, access control badge logs, and microphonic/vibration sensors).

The system enforces strict epistemological rigor:
- **Never fabricates facts**: Unmonitored intervals are explicitly recognized as **Unknown Gaps**.
- **Categorizes evidentiary status**: `OBSERVED`, `INFERRED`, `UNKNOWN`, `MISSING`, `CONTRADICTED`, `SUPPORTED`, `PARTIALLY_SUPPORTED`.
- **Heuristic Labeling**: Probabilistic reasoning is explicitly presented as a **Heuristic Reasoning Score** (0–100) or **Heuristic Information Value** (0.0–1.0) rather than claiming calibrated mathematical certainty or legal certification.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Frontend ["Frontend (React 18 + Vite + Tailwind CSS)"]
        UI_Landing["Landing Page / Auth"]
        UI_Dash["Dashboard & Case Directory"]
        UI_Timeline["Unified Interactive Timeline"]
        UI_Hypo["Hypotheses & Falsification Matrix"]
        UI_Graph["Evidence Graph (React Flow)"]
        UI_Report["Investigation Synthesis / PDF"]
    end

    subgraph Backend ["Backend (FastAPI + Python 3.14)"]
        API_Gateway["FastAPI REST Endpoints & CORS"]
        Ingestion["Multi-Modal Ingestion Engine"]
        Normalizer["Deterministic Event Normalizer"]
        GapDetector["Unknown Gap Detection Engine"]
        AI_Service["Gemini AI Service / Structured JSON"]
        HeuristicCore["Deterministic Heuristic Fallback Engine"]
        GraphBuilder["React Flow Graph Topology Engine"]
    end

    subgraph Storage ["Database & Storage Layer"]
        DB_SQL["SQLAlchemy (PostgreSQL / SQLite Local)"]
        Supabase_Auth["Supabase Auth / JWT Validation"]
        Supabase_Storage["Supabase Storage (Evidence Buckets)"]
    end

    UI_Landing --> API_Gateway
    UI_Dash --> API_Gateway
    UI_Timeline --> API_Gateway
    UI_Hypo --> API_Gateway
    UI_Graph --> API_Gateway
    UI_Report --> API_Gateway

    API_Gateway --> Ingestion
    Ingestion --> Normalizer
    Normalizer --> GapDetector
    GapDetector --> AI_Service
    AI_Service -.->|Fallback if offline| HeuristicCore
    AI_Service --> GraphBuilder

    API_Gateway --> DB_SQL
    API_Gateway --> Supabase_Auth
    API_Gateway --> Supabase_Storage
```

---

## 3. The 12-Step Reconstruction Pipeline

```mermaid
flowchart TD
    S1[1. Ingesting Fragmented Evidence] --> S2[2. Extracting Structured & Unstructured Events]
    S2 --> S3[3. Normalizing Timestamps & Entities]
    S3 --> S4[4. Building Unified Chronological Timeline]
    S4 --> S5[5. Detecting Unknown Gaps & Coverage Breaks]
    S5 --> S6[6. Formulating Multiple Competing Hypotheses]
    S6 --> S7[7. Formulating Expected Evidentiary Conditions]
    S7 --> S8[8. Comparing Expected vs Actual Recovered Findings]
    S8 --> S9[9. Identifying Conflicts & Contradictions]
    S9 --> S10[10. Running Counterfactual Analysis: 'What Would Change My Mind?']
    S10 --> S11[11. Calculating Next-Best Evidence & Information Value]
    S11 --> S12[12. Generating Multi-Modal Evidence Graph & Synthesis Report]
```

---

## 4. Multi-Modal Evidence Normalization

| Raw Source Type | Extracted Event Format | Status | Confidence |
| :--- | :--- | :--- | :--- |
| **CCTV PTZ Camera** | Frame timestamp, bounding box, object trajectory, apparel cues | `OBSERVED` | 0.90 – 0.99 |
| **Fleet CAN-Bus** | Timestamped door-pin switch, accelerometer impulse | `OBSERVED` | 0.95 – 1.00 |
| **RFID Badge Reader** | Card UID, Facility Code, Grant/Deny Status | `OBSERVED` | 1.00 |
| **PIR / Motion Fence** | Localized vibration signal, duration | `OBSERVED` | 0.85 – 0.95 |
| **Unmonitored Window** | Disappearance time to Reappearance time | `UNKNOWN GAP` | Explicit Zero-Inference |

---

## 5. Security & Sensitive Key Protection

- **Server-Side AI Secrets**: The `GEMINI_API_KEY` is loaded strictly via environment variables in the Python FastAPI backend. No Gemini keys or database administrative keys are ever bundled or exposed in client JavaScript.
- **Supabase Authentication**: Client tokens are validated against Supabase Auth, while sensitive row modifications are governed by Row Level Security (RLS) policies in PostgreSQL.
- **Legal Advisory**: Generated reports automatically embed the required legal disclaimer specifying that TRACE-X is an analytical assistance system and not an accredited forensic or legal certification authority.
