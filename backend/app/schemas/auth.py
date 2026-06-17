"""
SCENTINEL - Authentication Pydantic Schemas
Request/response schemas for login and token operations.
"""
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, examples=["admin"])
    password: str = Field(..., min_length=6, examples=["admin123"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str


class TokenPayload(BaseModel):
    sub: str  # username
    user_id: int
