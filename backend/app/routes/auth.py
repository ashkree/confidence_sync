from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.repository.users import read_user_by_cognito_sub
from app.schemas.auth import LoginRequest, LoginResponse
from app.schemas.users import UserBase, UserProfile
from app.services.auth import get_current_user, login_user, verify_id_token
from app.services.users import to_user_base, to_user_profile

auth_router = APIRouter(prefix="/auth")


@auth_router.post("/login", response_model=LoginResponse)
async def post_login(login_request: LoginRequest, db: AsyncSession = Depends(get_db)):

    response = await login_user(login_request.email, login_request.password)

    try:
        claims = verify_id_token(response["IdToken"])
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    cognito_sub = claims.get("sub")
    if not cognito_sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await read_user_by_cognito_sub(db, cognito_sub)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return LoginResponse(token=response["AcessToken"], user=to_user_base(user))


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
async def get_current_user_profile_route(
    current_user: User = Depends(get_current_user),
):
    """Retrieve the full profile of the currently authenticated user.

    Returns:
        UserProfile: Detailed user profile including timestamps and leave days.

    Raises:
        HTTPException 401: If the user token is missing, invalid, or expired.
    """
    return to_user_profile(current_user)
