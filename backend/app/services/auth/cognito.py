import base64
import json

import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.repository.cognito import get_cognito_client
from app.services.auth.jwt import verify_id_token
from app.services.users import read_user_by_cognito_sub


async def authenticate_and_fetch_user(db: AsyncSession, email: str, password: str):

    response = await get_cognito_client().login_user(email, password)

    try:
        claims = verify_id_token(response["IdToken"])

    except ValueError as e:
        raise jwt.InvalidTokenError(f"Invalid or expired token: {e}")

    cognito_sub = claims.get("sub")

    if not cognito_sub:
        raise jwt.InvalidTokenError("Token missing subject")

    user = await read_user_by_cognito_sub(db, cognito_sub)

    return {
        "access_token": response.get("AccessToken"),
        "refresh_token": response.get("RefreshToken"),
        "user": user,
    }


async def refresh_user_token(refresh_token: str, db: AsyncSession):

    payload_b64 = refresh_token.split(".")[1]
    padded = payload_b64 + "=" * (-len(payload_b64) % 4)
    payload = json.loads(base64.urlsafe_b64decode(padded))
    username = payload["cognito:username"]
    response = await get_cognito_client().refresh_token(username, refresh_token)

    try:
        claims = verify_id_token(response["IdToken"])
    except ValueError as e:
        raise jwt.InvalidTokenError(f"Invalid or expired token: {e}")

    cognito_sub = claims.get("sub")

    if not cognito_sub:
        raise jwt.InvalidTokenError("Token missing subject")

    user = await read_user_by_cognito_sub(db, cognito_sub)

    return {
        "access_token": response.get("AccessToken"),
        "refresh_token": response.get("RefreshToken"),
        "user": user,
    }
