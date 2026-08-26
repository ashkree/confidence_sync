# app/services/auth/dependencies.py
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.exceptions.auth import TokenVerificationError
from app.models import User
from app.services.auth.jwt import verify_access_token
from app.services.users import read_user_by_cognito_sub

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and verify the Cognito JWT, then resolve the local user.

    Raises:
        TokenVerificationError: bad signature, expired, wrong issuer, etc.
        UserNotFoundError: token is valid but no local user matches.
    """
    claims = verify_access_token(token)  # raises TokenVerificationError directly now

    cognito_sub = claims.get("sub")
    if not cognito_sub:
        raise TokenVerificationError("Token missing subject")

    user = await read_user_by_cognito_sub(db, cognito_sub)

    return user
