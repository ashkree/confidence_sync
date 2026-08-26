# app/routes/auth.py
from fastapi import APIRouter, Depends, status

from app.authorization.guards import require_authenticated
from app.models import User
from app.repository.user import UserRepo, get_user_repo
from app.schemas.auth import LoginRequest, LoginResponse, RefreshRequest
from app.schemas.users import UserBase, UserProfile
from app.services.auth.cognito import authenticate_and_fetch_user, refresh_user_token
from app.services.users import to_user_base, to_user_profile

auth_router = APIRouter(prefix="/auth")


@auth_router.post(
    "/login",
    response_model=LoginResponse,
    summary="Log in",
)
async def post_login(
    payload: LoginRequest,
    user_repo: UserRepo = Depends(get_user_repo),
):
    """Exchange email and password for an access token.

    Returns:
        LoginResponse: Access token, refresh token, and the user.

    Raises:
        InvalidCredentialsError 401: Email or password was rejected.
        AccountNotConfirmedError 403: Account exists but isn't confirmed.
        CognitoUnavailableError 503: The identity provider is unreachable.
    """
    result = await authenticate_and_fetch_user(
        user_repo, payload.email, payload.password
    )

    return LoginResponse(
        token=result.access_token,
        refresh_token=result.refresh_token,
        user=to_user_base(result.user),
    )


@auth_router.post(
    "/refresh",
    response_model=LoginResponse,
    summary="Refresh an access token",
)
async def post_refresh(
    payload: RefreshRequest,
    user_repo: UserRepo = Depends(get_user_repo),
):
    """Exchange a refresh token for a new access token.

    Returns:
        LoginResponse: A new access token, the refresh token, and the user.

    Raises:
        InvalidCredentialsError 401: Refresh token was rejected or has expired.
        CognitoUnavailableError 503: The identity provider is unreachable.
    """
    result = await refresh_user_token(user_repo, payload.email, payload.refresh_token)

    return LoginResponse(
        token=result.access_token,
        refresh_token=result.refresh_token or payload.refresh_token,
        user=to_user_base(result.user),
    )


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
