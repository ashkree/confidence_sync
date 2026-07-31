from datetime import timedelta

from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.jwt import create_access_token
from app.auth.passwords import verify_password
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas.users import UserBase, UserProfile, UserToken
from app.services.auth import find_user_by_email
from app.services.users import to_user_base, to_user_profile

auth_router = APIRouter(prefix="/auth")


@auth_router.post("/token", response_model=UserToken)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    Login route to get token.

    Raises 401 if credentials are invalid
    """
    user = await find_user_by_email(db, form_data.username)

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires,
    )

    return UserToken(access_token=access_token, token_type="bearer")


@auth_router.get("/me", response_model=UserBase)
async def get_current_user_route(current_user: User = Depends(get_current_user)):
    """
    Get the current user.

    Raises 401 if credentials are invalid
    """
    return to_user_base(current_user)


@auth_router.get("/profile", response_model=UserProfile)
async def get_current_user_profile_route(current_user: User = Depends(get_current_user)):
    """
    Get the current user's full profile.

    Raises 401 if credentials are invalid
    """
    return to_user_profile(current_user)
