"""
SCENTINEL - Application Configuration
Reads from environment variables using Pydantic Settings.
"""
import json
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://scentinel:scentinel_secret@localhost:5432/scentinel_db"

    # JWT
    SECRET_KEY: str = "your-super-secret-jwt-key-change-this"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # ESP32 API Key (static)
    ESP32_API_KEY: str = "esp32-static-api-key"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost",
        "http://frontend:3000",
    ]

    # App
    APP_ENV: str = "development"
    DEBUG: bool = True

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
