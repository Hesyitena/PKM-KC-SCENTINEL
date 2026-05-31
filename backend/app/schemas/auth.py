"""
SCENTINEL - Authentication Pydantic Schemas
Request/response schemas for login and token operations.
"""
from pydantic import BaseModel, Field
from app.models.user import UserRole


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, example="admin")
    password: str = Field(..., min_length=6, example="admin123")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    role: UserRole


class TokenPayload(BaseModel):
    sub: str  # username
    user_id: int
    role: str
