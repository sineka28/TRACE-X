# TRACE-X Deployment Guide

TRACE-X is packaged for zero-friction deployment. Because the FastAPI backend directly mounts and serves the optimized React production bundle (`frontend/dist`), **you can deploy the entire full-stack application as a single unified service on one port.**

---

## Option 1: Docker (Recommended for Any Cloud / VPS)

### One-Command Docker Compose:
```bash
docker compose up --build -d
```
The application will immediately be live at:
```
http://localhost:8000
```

### Standalone Docker Build:
```bash
docker build -t trace-x .
docker run -d -p 8000:8000 --name trace-x-prod trace-x
```

---

## Option 2: Render.com (Free Cloud Web Service)

1. Push this repository to GitHub or GitLab.
2. Sign in to [render.com](https://render.com) and click **"New +" → "Web Service"**.
3. Connect your TRACE-X repository.
4. Select **Docker** as the Runtime (or select the provided `render.yaml` Blueprint).
5. In **Environment Variables**, add:
   - `APP_ENV`: `production`
   - `GEMINI_API_KEY`: *(Your Google AI Studio key)*
   - `SUPABASE_URL`: *(Your Supabase project URL, optional)*
   - `SUPABASE_ANON_KEY`: *(Your Supabase Anon key, optional)*
6. Click **Deploy**. Render will build the multi-stage Docker container and give you a public URL (e.g., `https://trace-x.onrender.com`).

---

## Option 3: Railway.app (One-Click)

1. Sign in to [railway.app](https://railway.app).
2. Click **"New Project" → "Deploy from GitHub repo"**.
3. Select your repository.
4. Railway automatically detects the `Dockerfile` and `Procfile`.
5. Under **Variables**, add:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
6. Click **Deploy**. Under **Settings** → **Networking**, click **"Generate Domain"** to get a public URL.

---

## Option 4: Unified Local / Self-Hosted Server (Direct Python)

If you already have Python and Node installed on your server or VPS:

1. **Build the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```
2. **Start the Unified Engine**:
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
3. Visit `http://your-server-ip:8000/`. Both the React frontend SPA and all `/api/*` endpoints will run on port 8000.

---

## Option 5: Fly.io

1. Install the `flyctl` CLI.
2. Run in the root directory:
   ```bash
   fly launch
   fly deploy
   ```
3. Set secrets:
   ```bash
   fly secrets set GEMINI_API_KEY=your_key_here
   ```
