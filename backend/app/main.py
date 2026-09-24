from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db, SessionLocal
from app.services.demo_data import seed_synthetic_demo_data
from app.models.models import Investigation

# Routers
from app.routers import (
    health,
    demo,
    auth,
    investigations,
    evidence,
    analysis,
    reports,
    notifications
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Database Schema
    init_db()
    # Check if demo investigation exists, if not seed it automatically
    db = SessionLocal()
    try:
        demo_exists = db.query(Investigation).filter(Investigation.is_synthetic_demo == True).first()
        if not demo_exists:
            seed_synthetic_demo_data(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="TRACE-X API",
    description="AI-Powered Hidden Event Reconstruction & Evidence-Seeking Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(health.router)
app.include_router(demo.router)
app.include_router(auth.router)
app.include_router(investigations.router)
app.include_router(evidence.router)
app.include_router(analysis.router)
app.include_router(reports.router)
app.include_router(notifications.router)

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Check for production frontend bundle
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
assets_dir = os.path.join(frontend_dist, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{full_path:path}")
async def serve_spa_or_root(full_path: str):
    # Exclude API endpoints, docs, redoc, health
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path == "health":
        return {"detail": "Not Found"}
    
    # Check if a static file in dist matches (e.g. vite.svg, favicon)
    if os.path.exists(frontend_dist):
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)

    return {
        "app": "TRACE-X",
        "description": "AI-Powered Hidden Event Reconstruction & Evidence-Seeking Engine",
        "documentation": "/docs",
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)

