import base64
import json
from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.exceptions.data import RecordNotFoundError
from app.models import User
from app.repository.cognito import CognitoRepo
from app.repository.users import read_user_by_cognito_sub

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
repo = CognitoRepo()


async def authenticate_and_fetch_user(email: str, password: str, db: AsyncSession):
    response = await repo.login_user(email, password)
    try:
        claims = verify_id_token(response["IdToken"])
    except ValueError as e:
        raise jwt.InvalidTokenError(f"Invalid or expired token: {e}")
    cognito_sub = claims.get("sub")
    if not cognito_sub:
        raise jwt.InvalidTokenError("Token missing subject")
    user = await read_user_by_cognito_sub(db, cognito_sub)
    if user is None:
        raise RecordNotFoundError("User not found in database")
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
    response = await repo.refresh_token(username, refresh_token)
    try:
        claims = verify_id_token(response["IdToken"])
    except ValueError as e:
        raise jwt.InvalidTokenError(f"Invalid or expired token: {e}")
    cognito_sub = claims.get("sub")
    if not cognito_sub:
        raise jwt.InvalidTokenError("Token missing subject")
    user = await read_user_by_cognito_sub(db, cognito_sub)
    if user is None:
        raise RecordNotFoundError("User not found in database")
    return {
        "access_token": response.get("AccessToken"),
        "refresh_token": response.get("RefreshToken"),
        "user": user,
    }


@lru_cache
def get_cognito_jwks_base_url() -> str:
    """Used only for fetching signing keys — must be reachable from inside the container."""
    if settings.use_cognito_local and settings.app_env == "development":
        return f"{settings.cognito_endpoint_url}/{settings.cognito_user_pool_id}"
    return f"https://cognito-idp.{settings.aws_region}.amazonaws.com/{settings.cognito_user_pool_id}"


@lru_cache
def get_issuer() -> str:
    """Used only for validating the iss claim — must match what cognito-local actually issues."""
    if settings.use_cognito_local and settings.app_env == "development":
        return f"http://0.0.0.0:9229/{settings.cognito_user_pool_id}"
    return f"https://cognito-idp.{settings.aws_region}.amazonaws.com/{settings.cognito_user_pool_id}"


def get_jwks_url() -> str:
    return get_cognito_jwks_base_url() + "/.well-known/jwks.json"


def verify_access_token(token: str) -> dict:
    """
    Verify a Cognito access token's signature, issuer, expiry, and claims.
    Raises ValueError on any verification failure.
    """
    try:
        jwks_client = jwt.PyJWKClient(get_jwks_url())
        signing_key = jwks_client.get_signing_key_from_jwt(token)
    except jwt.exceptions.PyJWKClientError as e:
        raise ValueError(f"Unable to fetch signing key: {e}") from e

    try:
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=get_issuer(),
            options={"require": ["exp", "iss", "sub", "token_use", "client_id"]},
        )
    except jwt.ExpiredSignatureError as e:
        raise ValueError("Access token has expired") from e
    except jwt.InvalidIssuerError as e:
        raise ValueError("Access token issuer does not match this user pool") from e
    except jwt.InvalidSignatureError as e:
        raise ValueError("Access token signature is invalid") from e
    except jwt.DecodeError as e:
        raise ValueError("Access token is malformed") from e
    except jwt.InvalidTokenError as e:
        raise ValueError(f"Access token is invalid: {e}") from e

    if claims.get("token_use") != "access":
        raise ValueError(
            f"Expected access token, got token_use={claims.get('token_use')!r}"
        )
    if claims.get("client_id") != settings.cognito_app_client_id:
        raise ValueError("Access token was not issued for this app client")

    return claims


def verify_id_token(token: str) -> dict:
    """
    Verify a Cognito ID token's signature, issuer, audience, expiry, and claims.
    Raises ValueError on any verification failure.
    """

    try:
        jwks_client = jwt.PyJWKClient(get_jwks_url())
        signing_key = jwks_client.get_signing_key_from_jwt(token)
    except jwt.exceptions.PyJWKClientError as e:
        raise ValueError(f"Unable to fetch signing key: {e}") from e

    try:
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=get_issuer(),
            audience=settings.cognito_app_client_id,
            options={"require": ["exp", "iss", "sub", "aud", "token_use"]},
        )
    except jwt.ExpiredSignatureError as e:
        raise ValueError("ID token has expired") from e
    except jwt.InvalidIssuerError as e:
        raise ValueError("ID token issuer does not match this user pool") from e
    except jwt.InvalidAudienceError as e:
        raise ValueError("ID token was not issued for this app client") from e
    except jwt.InvalidSignatureError as e:
        raise ValueError("ID token signature is invalid") from e
    except jwt.DecodeError as e:
        raise ValueError("ID token is malformed") from e
    except jwt.InvalidTokenError as e:
        raise ValueError(f"ID token is invalid: {e}") from e

    if claims.get("token_use") != "id":
        raise ValueError(
            f"Expected ID token, got token_use={claims.get('token_use')!r}"
        )

    return claims


def get_payload(token: str) -> dict:
    """
    Decode a JWT payload WITHOUT verifying signature, issuer, or expiry.
    Only use for debugging/inspection — never trust this for auth decisions.
    """
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Not a valid JWT (expected 3 dot-separated parts)")
    payload = parts[1]
    padded = payload + "=" * (-len(payload) % 4)  # Pad for Base64 decoding
    decoded = base64.urlsafe_b64decode(padded)
    return json.loads(decoded)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and verify the Cognito JWT, then resolve the local user."""
    try:
        claims = verify_access_token(token)
    except ValueError as e:
        print("Invalid or expired token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    cognito_sub = claims.get("sub")
    if not cognito_sub:
        print("Token missing sub")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await read_user_by_cognito_sub(db, cognito_sub)
    if user is None:
        print("User not found ")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
