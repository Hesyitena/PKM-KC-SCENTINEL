"""
SCENTINEL - Auth Service
Business logic for authentication and user management.
"""
from datetime import timedelta
from fastapi import HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import verify_password, hash_password, create_access_token
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserResponse, ChangePasswordRequest


class AuthService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def login(self, payload: LoginRequest) -> TokenResponse:
        """Authenticate user and return JWT token."""
        user = await self.repo.get_by_username(payload.username)
        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        access_token = create_access_token(
            data={"sub": user.username, "user_id": user.id},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            username=user.username,
        )

    async def get_user_by_id(self, user_id: int) -> UserResponse:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse.model_validate(user)

    async def create_user(self, payload: UserCreate) -> UserResponse:
        existing = await self.repo.get_by_username(payload.username)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken",
            )
        user = User(
            username=payload.username,
            password_hash=hash_password(payload.password),
        )
        created = await self.repo.create(user)
        return UserResponse.model_validate(created)

    async def change_password(
        self, user_id: int, payload: ChangePasswordRequest
    ) -> dict:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not verify_password(payload.current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Current password incorrect")
        user.password_hash = hash_password(payload.new_password)
        await self.repo.update(user)
        return {"message": "Password updated successfully"}
