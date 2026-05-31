"""
SCENTINEL - Auth Router
POST /auth/login  →  Returns JWT token
GET  /auth/me     →  Returns current user info
"""
from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserResponse, ChangePasswordRequest
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=TokenResponse, summary="Dashboard Login")
async def login(payload: LoginRequest, db: DBSession):
    """Authenticate dashboard user and return JWT access token."""
    service = AuthService(db)
    return await service.login(payload)


@router.get("/me", response_model=UserResponse, summary="Get Current User")
async def get_me(current_user: CurrentUser, db: DBSession):
    """Get the currently authenticated user's profile."""
    service = AuthService(db)
    return await service.get_user_by_id(current_user["user_id"])


@router.post("/change-password", summary="Change Password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: CurrentUser,
    db: DBSession,
):
    """Change password for the currently authenticated user."""
    service = AuthService(db)
    return await service.change_password(current_user["user_id"], payload)
