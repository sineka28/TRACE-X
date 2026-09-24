# TRACE-X

> **AI-Powered Hidden Event Reconstruction & Evidence-Seeking Engine**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![React Flow](https://img.shields.io/badge/React_Flow-12.0-FF0072?logo=react&logoColor=white)](https://reactflow.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-Integrated-4285F4?logo=google&logoColor=white)](https://ai.google.dev)

---

## 1. Problem Statement

Real-world incidents rarely produce one continuous, unbroken recording. Evidence is fragmented across:
- Fixed PTZ & CCTV cameras
- Vehicle GPS and CAN-bus telematics
- Access control badge readers
- Vibration and microphonic perimeter sensors
- Witness statements and uploaded video clips

Investigators face critical uncertainty when subjects move through camera blind spots. Conventional tools either leave disjointed files or hallucinate ungrounded explanations.

---

## 2. The TRACE-X Solution

**TRACE-X** unifies multi-modal fragments into a single chronological timeline and adheres to strict epistemic honesty:
1. **Never presents inference as established fact.**
2. **Explicitly flags Unknown Gaps** where camera or sensor coverage drops (e.g., `10:02:18 → 10:02:27`).
3. **Formulates Multiple Competing Hypotheses** calibrated with **Heuristic Reasoning Scores** (0–100).
4. **Builds an Expected vs Actual Forensic Matrix** to test falsification criteria.
5. **Performs Counterfactual Analysis**: *"What Would Change My Mind?"* (Strengthening, Weakening, Contradicting, Distinguishing).
6. **Next-Best Evidence Engine**: Identifies which uncollected or unexplored source has the highest **Heuristic Information Value** to resolve uncertainty.
7. **Interactive Evidence Graph**: Visualizes nodes and semantic links using React Flow.
8. **Formal Investigation Synthesis Reports**: Generates printable PDF and JSON forensic reports with clear legal and AI disclosures.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, JavaScript / JSX (**No TypeScript**), Tailwind CSS, React Router v6, React Flow (`@xyflow/react`), Recharts, Lucide React.
- **Backend**: Python 3.14, FastAPI, Pydantic v2, SQLAlchemy (supporting SQLite local dev and Supabase PostgreSQL).
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Supabase Storage, and local SQLite/Session fallback.
- **AI Core**: Google Gemini API via Python backend with Pydantic structured output validation and a deterministic heuristic fallback engine.

---

## 4. Project Structure

```
TRACE-X/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   └── gemini_service.py     # Gemini client + deterministic heuristic engine
│   │   ├── analysis/
│   │   │   └── engine.py             # 12-step pipeline orchestrator & graph generator
│   │   ├── models/
│   │   │   └── models.py             # SQLAlchemy models
│   │   ├── routers/
│   │   │   ├── auth.py               # Profile & authentication
│   │   │   ├── investigations.py     # Case CRUD
│   │   │   ├── evidence.py           # Evidence upload & ingestion
│   │   │   ├── analysis.py           # Analysis, timeline, hypotheses, graph
│   │   │   ├── reports.py            # Formal report generation
│   │   │   ├── demo.py               # Campus Parking Incident seeder
│   │   │   └── health.py             # Health check endpoint
│   │   ├── schemas/
│   │   │   └── schemas.py            # Pydantic v2 schemas
│   │   ├── services/
│   │   │   └── demo_data.py          # Synthetic Campus Parking Incident dataset
│   │   ├── config.py                 # Pydantic Settings
│   │   ├── database.py               # Database engine & session
│   │   └── main.py                   # FastAPI application entrypoint
│   ├── tests/
│   │   └── test_api.py               # Pytest backend test suite
│   ├── database_schema.sql           # Supabase PostgreSQL DDL with RLS
│   └── requirements.txt              # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Button, Badge, Card, Modal, Drawer, Tabs, etc.
│   │   │   ├── investigation/        # UnifiedTimeline, HypothesisCard, ExpectedVsActual, etc.
│   │   │   └── layout/               # Sidebar, Navbar, AppLayout, CommandPalette
│   │   ├── hooks/                    # useAuth, useToast
│   │   ├── pages/                    # Landing, Auth, Dashboard, InvestigationDetail, etc.
│   │   ├── services/                 # api.js, supabase.js
│   │   ├── App.jsx                   # React Router master switchboard
│   │   ├── main.jsx                  # Entrypoint
│   │   └── index.css                 # Tailwind typography & styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docs/
│   ├── architecture.md               # Mermaid system architecture & pipeline
│   ├── api.md                        # REST API documentation
│   └── demo.md                       # 2–3 minute hackathon demonstration guide
│
├── .env.example                      # Configuration template
└── README.md                         # Master documentation
```

---

## 5. Quick Start (Running Locally)

### Prerequisites
- Node.js (v20+) & npm
- Python (3.10 – 3.14) & pip

---

### Step A: Start Backend (FastAPI)

1. Open a terminal in the project root:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run backend tests to verify environment:
   ```bash
   python -m pytest tests/test_api.py -v
   ```
4. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
5. Interactive OpenAPI Swagger documentation is immediately available at:
   ```
   http://127.0.0.1:8000/docs
   ```

---

### Step B: Start Frontend (React + Vite)

1. Open a second terminal:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at:
   ```
   http://localhost:5173
   ```

---

## 6. One-Click Hackathon Evaluation

TRACE-X is optimized for immediate hackathon evaluation without mandatory third-party credentials:
1. Navigate to `http://localhost:5173/login`.
2. Click **"Sign In as Dr. Alex Rivera (Demo)"**.
3. You will immediately be taken to `/dashboard` with the pre-seeded **Campus Parking Incident**.
4. Click **"Explore Live Demo"** or open the investigation to run the complete 12-step reconstruction pipeline.

---

## 7. Connecting Cloud Supabase & Gemini (Optional)

To connect production cloud services:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate your keys:
   ```ini
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[REF].supabase.co
   SUPABASE_ANON_KEY=[ANON_KEY]
   SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
   GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
   ```
3. Execute `backend/database_schema.sql` in your Supabase SQL Editor to enable Row Level Security and tables.
4. When `GEMINI_API_KEY` is present, TRACE-X automatically uses Gemini 1.5 Flash for unstructured analysis; if absent, the built-in deterministic heuristic core runs seamlessly.

---

## 8. Epistemological Disclaimers & Limitations

- **Legal Admissibility**: TRACE-X is an analytical assistance system and heuristic reasoning tool. It does not provide legal admissibility, certified forensic authenticity, government accreditation, or guaranteed correctness.
- **Probabilities**: Scores are explicitly denoted as **Heuristic Reasoning Scores** (0–100) or **Heuristic Information Values** (0.0–1.0) and must not be interpreted as statistically calibrated probabilities.
- **Demo Data Notice**: The built-in demonstration dataset is explicitly labeled: `SYNTHETIC DEMO DATA`.
