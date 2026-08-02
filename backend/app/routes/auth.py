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
from app.services.auth import read_user_by_email
from app.services.users import to_user_base, to_user_profile

auth_router = APIRouter(prefix="/auth")


@auth_router.post(
    "/token",
    response_model=UserToken,
    summary="Authenticate and obtain an access token",
    responses={
        401: {"description": "Invalid email or password"},
    },
)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Authenticate a user with email and password credentials.

    Accepts OAuth2-compatible form data and returns a bearer token
    on success.

    Returns:
        UserToken: An object containing the access token and token type.

    Raises:
        HTTPException 401: If the email does not exist or the password
            is incorrect.
    """
    user = await read_user_by_email(db, form_data.username)

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


@auth_router.get(
    "/me",
    response_model=UserBase,
    summary="Get current user details",
    responses={
        401: {"description": "Invalid or expired token"},
    },
)
async def get_current_user_route(current_user: User = Depends(get_current_user)):
    """Retrieve the details of the currently authenticated user.

    Returns:
        UserBase: The basic details of the user.

    Raises:
        HTTPException 401: If the user token is missing, invalid, or expired.
    """
    return to_user_base(current_user)


@auth_router.get(
    "/profile",
    response_model=UserProfile,
    summary="Get current user profile",
    responses={
        401: {"description": "Invalid or expired token"},
    },
)
async def get_current_user_profile_route(current_user: User = Depends(get_current_user)):
    """Retrieve the full profile of the currently authenticated user.

    Returns:
        UserProfile: Detailed user profile including timestamps and leave days.

    Raises:
        HTTPException 401: If the user token is missing, invalid, or expired.
    """
    return to_user_profile(current_user)
