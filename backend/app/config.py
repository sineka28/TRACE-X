import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    APP_NAME: str = "TRACE-X"
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # API Server
    API_PORT: int = 8000
    API_HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    
    # Database (Defaults to local SQLite if PostgreSQL is not configured)
    DATABASE_URL: str = "sqlite:///./trace_x.db"
    
    # Supabase (Optional for local dev, mandatory for full production cloud auth & storage)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_STORAGE_BUCKET: str = "evidence-files"
    
    # Gemini AI API (Server-side ONLY)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # Security disclaimer required by system prompt
    LEGAL_DISCLAIMER: str = (
        "TRACE-X is an analytical assistance system and heuristic reasoning engine. "
        "It does not provide legal admissibility, forensic certification, or guaranteed correctness."
    )

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
