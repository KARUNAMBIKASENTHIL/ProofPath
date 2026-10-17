import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "ProofPath"
    TAGLINE: str = "Your skills. Your proof. Your next step."
    APP_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Environment & Host
    ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Storage paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    UPLOAD_DIR: Path = DATA_DIR / "uploads"
    LOCAL_DB_PATH: Path = DATA_DIR / "careerlens_db.json"
    KNOWLEDGE_BASE_DIR: Path = BASE_DIR.parent / "CareerLens_RAG_Knowledge_Base"
    
    # MongoDB
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "careerlens")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "careerlens-super-secure-production-secret-key-2025")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AI / LLM Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    # GitHub / MCP
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    MCP_GITHUB_ENDPOINT: str = os.getenv("MCP_GITHUB_ENDPOINT", "")
    
    # Demo Mode
    DEMO_MODE: bool = True

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
