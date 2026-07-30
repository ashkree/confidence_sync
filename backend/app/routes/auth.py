from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.schemas.users import UserBase, UserLogin, UserProfile

auth_router = APIRouter(prefix="/auth")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)) -> UserBase:
    """
    Resolves the current user from the bearer token.

    TODO: replace with real token verification + DB lookup once queries are wired up.
    For now this just rejects empty/missing tokens so the dependency chain
    and 401 behavior are in place.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Placeholder — will become something like:
    # user = decode_token_and_fetch_user(token, db)
    # if user is None: raise HTTPException(401, ...)
    raise NotImplementedError("User lookup not yet implemented")


@auth_router.post("/login", response_model=UserBase)
def login(login: UserLogin):
    """
    Authenticate a user and return session token.
    Raises 401 if credentials are invalid.
    """
    # TODO: look up user by login.email, verify password against password_hash,
    # issue a real token. For now, raise instead of silently returning None,
    # since response_model=UserBase can't validate a None body anyway.
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
    )


@auth_router.get("/me", response_model=UserBase)
def get_current_user_route(current_user: UserBase):
    """
    Rehydrates user on refresh.
    Raises 401 if credentials are invalid.
    """
    return current_user


@auth_router.get("/profile", response_model=UserProfile)
def get_current_user_profile(current_user: UserBase):
    """
    Returns the full user profile for the authenticated user.
    Raises 401 if credentials are invalid.
    """
    # TODO: fetch full profile fields (leave_days, department, etc.) from DB
    # using current_user.id once query layer exists.
    raise NotImplementedError("Profile fetch not yet implemented")
