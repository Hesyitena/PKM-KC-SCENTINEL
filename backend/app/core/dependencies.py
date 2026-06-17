"""
SCENTINEL - FastAPI Dependencies
Dependency injection for authentication, DB sessions, and API key validation.
"""
from typing import Annotated
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_access_token
from app.database.database import get_db

# --- JWT Bearer ---
bearer_scheme = HTTPBearer(auto_error=False)

# --- API Key for ESP32 ---
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_current_user_payload(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Security(bearer_scheme)],
) -> dict:
    """Extract and validate JWT payload from Authorization header."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


async def verify_esp32_api_key(
    api_key: Annotated[str | None, Security(api_key_header)],
) -> str:
    """Validate the static ESP32 API key from X-API-Key header."""
    if not api_key or api_key != settings.ESP32_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing API key",
        )
    return api_key


# Type aliases for dependency injection
CurrentUser = Annotated[dict, Depends(get_current_user_payload)]
DBSession = Annotated[AsyncSession, Depends(get_db)]
ESP32Auth = Annotated[str, Depends(verify_esp32_api_key)]
