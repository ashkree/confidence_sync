from fastapi import APIRouter, Depends, HTTPException, status
from jwt import InvalidTokenError
from sqlalchemy.ext.asyncio import AsyncSession

from app.authorization.guards import require_authenticated
from app.database import get_db
from app.exceptions.auth import (
    AccountNotConfirmedError,
    InvalidCredentialsError,
)
from app.exceptions.data import RecordNotFoundError
from app.exceptions.external import CognitoUnavailableError
from app.models import User
from app.schemas.auth import LoginRequest, LoginResponse, RefreshRequest
from app.schemas.users import UserBase, UserProfile
from app.services.auth.cognito import authenticate_and_fetch_user, refresh_user_token
from app.services.users import to_user_base, to_user_profile

auth_router = APIRouter(prefix="/auth")


@auth_router.post("/login", response_model=LoginResponse)
async def post_login(login_request: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        data = await authenticate_and_fetch_user(
            db, login_request.email, login_request.password
        )
    except InvalidCredentialsError:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    except AccountNotConfirmedError:
        raise HTTPException(status_code=403, detail="Account not confirmed")
    except CognitoUnavailableError:
        raise HTTPException(
            status_code=503, detail="Authentication service unavailable"
        )
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except RecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return LoginResponse(
        token=data["access_token"],
        refresh_token=data.get("refresh_token"),
        user=to_user_base(data["user"]),
    )


@auth_router.post("/refresh", response_model=LoginResponse)
async def post_refresh(
    refresh_request: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        data = await refresh_user_token(refresh_request.refresh_token, db)
    except InvalidCredentialsError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    except CognitoUnavailableError:
        raise HTTPException(
            status_code=503, detail="Authentication service unavailable"
        )
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except RecordNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return LoginResponse(
        token=data["access_token"],
        refresh_token=data.get("refresh_token") or refresh_request.refresh_token,
        user=to_user_base(data["user"]),
    )


@auth_router.get(
    "/me",
    response_model=UserBase,
    summary="Get current user details",
    responses={
        401: {"description": "Invalid or expired token"},
    },
)
async def get_current_user_route(current_user: User = Depends(require_authenticated)):
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
async def get_current_user_profile_route(
    current_user: User = Depends(require_authenticated),
):
    """Retrieve the full profile of the currently authenticated user.

    Returns:
        UserProfile: Detailed user profile including timestamps and leave days.

    Raises:
        HTTPException 401: If the user token is missing, invalid, or expired.
    """
    return to_user_profile(current_user)
