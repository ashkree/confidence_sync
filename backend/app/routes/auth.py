from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.models import User
from app.schemas.users import UserBase, UserProfile
from app.services.users import to_user_base, to_user_profile

auth_router = APIRouter(prefix="/auth")


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
