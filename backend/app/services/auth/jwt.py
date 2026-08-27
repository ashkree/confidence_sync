from functools import lru_cache

import jwt

from app.config import settings
from app.exceptions.auth import TokenVerificationError


@lru_cache()
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


def _verify_token(
    token: str,
    *,
    expected_token_use: str,
    required_claims: list[str],
    audience: str | None = None,
) -> dict:
    """Shared verification core for access and ID tokens.

    Raises:
        TokenVerificationError: on any signature, issuer, audience, expiry,
        or claim-shape failure.
    """
    try:
        jwks_client = jwt.PyJWKClient(get_jwks_url())
        signing_key = jwks_client.get_signing_key_from_jwt(token)
    except jwt.exceptions.PyJWKClientError as e:
        raise TokenVerificationError(f"Unable to fetch signing key: {e}") from e

    decode_kwargs = dict(
        algorithms=["RS256"],
        issuer=get_issuer(),
        options={"require": required_claims},
    )
    if audience is not None:
        decode_kwargs["audience"] = audience

    try:
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=get_issuer(),
            audience=audience,
            options={"require": required_claims},
        )

    except jwt.ExpiredSignatureError as e:
        raise TokenVerificationError("Token has expired") from e

    except jwt.InvalidIssuerError as e:
        raise TokenVerificationError(
            "Token issuer does not match this user pool"
        ) from e

    except jwt.InvalidAudienceError as e:
        raise TokenVerificationError("Token was not issued for this app client") from e

    except jwt.InvalidSignatureError as e:
        raise TokenVerificationError("Token signature is invalid") from e

    except jwt.DecodeError as e:
        raise TokenVerificationError("Token is malformed") from e

    except jwt.InvalidTokenError as e:
        raise TokenVerificationError(f"Token is invalid: {e}") from e

    if claims.get("token_use") != expected_token_use:
        raise TokenVerificationError(
            f"Expected {expected_token_use} token, got token_use={claims.get('token_use')!r}"
        )

    return claims


def verify_access_token(token: str) -> dict:
    """Verify a Cognito access token's signature, issuer, expiry, and claims."""
    claims = _verify_token(
        token,
        expected_token_use="access",
        required_claims=["exp", "iss", "sub", "token_use", "client_id"],
    )
    if claims.get("client_id") != settings.cognito_app_client_id:
        raise TokenVerificationError("Access token was not issued for this app client")
    return claims


def verify_id_token(token: str) -> dict:
    """Verify a Cognito ID token's signature, issuer, audience, expiry, and claims."""
    return _verify_token(
        token,
        expected_token_use="id",
        required_claims=["exp", "iss", "sub", "aud", "token_use"],
        audience=settings.cognito_app_client_id,
    )
