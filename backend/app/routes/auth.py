# app/routes/auth.py
from fastapi import APIRouter, Depends, Request, Response, status

from app.authorization.guards import require_authenticated
from app.config import settings
from app.exceptions.external import CognitoMissingRefreshTokenError
from app.models import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.users import UserBase, UserProfile
from app.services.auth.cognito import (
    authenticate,
    refresh_tokens,
)
from app.services.users import to_user_base, to_user_profile

REFRESH_COOKIE_KEY = "refresh_token"
EMAIL_COOKIE_KEY = "refresh_email"
REFRESH_PATH = "/api/v1/auth/refresh"
REFRESH_MAX_AGE = 60 * 60 * 24 * 30


def _set_refresh_cookies(response: Response, email: str, token: str) -> None:
    def set_cookie(key: str, value: str) -> None:
        response.set_cookie(
            key=key,
            value=value,
            httponly=True,  # JS cannot read it
            secure=settings.cookie_secure,
            samesite="lax",  # not sent on cross-site requests
            path=REFRESH_PATH,  # only sent to the refresh endpoint
            max_age=60 * 60 * 24 * 30,
        )

    set_cookie(EMAIL_COOKIE_KEY, email)
    set_cookie(REFRESH_COOKIE_KEY, token)


auth_router = APIRouter(prefix="/auth")


@auth_router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in",
)
async def post_login(
    payload: LoginRequest,
    response: Response,
):

    accessToken, refreshToken = await authenticate(payload.email, payload.password)

    if not refreshToken:
        raise CognitoMissingRefreshTokenError()

    _set_refresh_cookies(response, payload.email, refreshToken)

    return TokenResponse(token=accessToken)


@auth_router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh an access token",
)
async def post_refresh(request: Request):
    refresh_token = request.cookies.get(REFRESH_COOKIE_KEY)
    email = request.cookies.get(EMAIL_COOKIE_KEY)

    if not refresh_token or not email:
        raise CognitoMissingRefreshTokenError()

    access_token, _ = await refresh_tokens(email, refresh_token)

    return TokenResponse(token=access_token)


@auth_router.get(
    "/me",
    response_model=UserBase,
    status_code=status.HTTP_200_OK,
    summary="Get current user details",
)
async def get_me(current_user: User = Depends(require_authenticated)):
    """Retrieve the details of the currently authenticated user.

    Returns:
        UserBase: The basic details of the user.

    Raises:
        TokenVerificationError 401: Token is missing, invalid, or expired.
    """
    return to_user_base(current_user)


@auth_router.get(
    "/profile",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
)
async def get_my_profile(current_user: User = Depends(require_authenticated)):
    """Retrieve the full profile of the currently authenticated user.

    Returns:
        UserProfile: Detailed profile including timestamps and leave days.

    Raises:
        TokenVerificationError 401: Token is missing, invalid, or expired.
    """
    return to_user_profile(current_user)
