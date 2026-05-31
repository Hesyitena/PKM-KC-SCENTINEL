"""
SCENTINEL - User Pydantic Schemas
"""
from datetime import datetime
from pydantic import BaseModel
from app.models.user import UserRole


class UserBase(BaseModel):
    username: str
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
