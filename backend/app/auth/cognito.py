import uuid
from functools import lru_cache

import jwt
from jwt import PyJWKClient

from app.config import settings


@lru_cache
def _get_jwk_client() -> PyJWKClient:
    """Create and cache the JWKS client for the Cognito user pool."""
    jwks_url = (
        f"https://cognito-idp.{settings.cognito_region}.amazonaws.com"
        f"/{settings.cognito_user_pool_id}/.well-known/jwks.json"
    )
    return PyJWKClient(jwks_url)


def _get_issuer() -> str:
    """Build the expected token issuer URL for the Cognito user pool."""
    return (
        f"https://cognito-idp.{settings.cognito_region}.amazonaws.com"
        f"/{settings.cognito_user_pool_id}"
    )


def verify_cognito_token(token: str) -> uuid.UUID | None:
    """Verify a Cognito-issued JWT and extract the user's sub claim.

    Validates the token signature against Cognito's JWKS, checks expiration
    and issuer, then returns the ``sub`` claim as a UUID.

    Args:
        token: The raw JWT string from the Authorization header.

    Returns:
        The Cognito user's sub as a UUID, or None if verification fails.
    """
    try:
        signing_key = _get_jwk_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=_get_issuer(),
            options={"require": ["exp", "sub"]},
        )
        sub = payload.get("sub")
        if not sub:
            return None
        return uuid.UUID(sub)
    except (jwt.InvalidTokenError, ValueError):
        return None
