# app/services/auth/dependencies.py
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from app.models import User
from app.repository.user import UserRepo, get_user_repo
from app.services.auth.jwt import verify_access_token
from app.services.users import read_user_by_claims

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_repo: UserRepo = Depends(get_user_repo),
) -> User:
    """Verify the Cognito access token, then resolve the local user.

    Raises:
        TokenVerificationError 401: bad signature, expired, wrong issuer, etc.
        UnknownSubjectError 401: token is valid but no local user matches.
    """
    claims = verify_access_token(token)
    return await read_user_by_claims(user_repo, claims)
