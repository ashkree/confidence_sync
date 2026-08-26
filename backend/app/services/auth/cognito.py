# app/services/auth/cognito.py
from dataclasses import dataclass

from app.models import User
from app.repository.cognito import get_cognito_client
from app.repository.user import UserRepo
from app.services.auth.jwt import verify_id_token
from app.services.users import read_user_by_claims


@dataclass(frozen=True)
class AuthResult:
    """What a successful login or refresh yields.

    A typed result instead of the old bare dict, so routes stop indexing
    string keys and the response shape is checked at the boundary.
    """

    access_token: str
    refresh_token: str | None
    user: User


async def _to_auth_result(user_repo: UserRepo, response: dict) -> AuthResult:
    claims = verify_id_token(response["IdToken"])
    user = await read_user_by_claims(user_repo, claims)

    return AuthResult(
        access_token=response["AccessToken"],
        refresh_token=response.get("RefreshToken"),
        user=user,
    )


async def authenticate_and_fetch_user(
    user_repo: UserRepo, email: str, password: str
) -> AuthResult:
    """Exchange credentials for tokens and resolve the local user.

    Raises:
        InvalidCredentialsError 401: rejected by Cognito.
        AccountNotConfirmedError 403: account exists but isn't confirmed.
        CognitoUnavailableError 503: Cognito itself failed.
        TokenVerificationError 401: the returned ID token didn't verify.
        UnknownSubjectError 401: no local user for the token's subject.
    """
    response = await get_cognito_client().login_user(email, password)
    return await _to_auth_result(user_repo, response)


async def refresh_user_token(
    user_repo: UserRepo, email: str, refresh_token: str
) -> AuthResult:
    """Exchange a refresh token for a new access token.

    `email` is the Cognito username, needed to compute SECRET_HASH. It comes
    from the request body rather than being parsed out of the refresh token:
    real Cognito refresh tokens are opaque, not JWTs, so the old
    base64-decode-the-payload approach only ever worked against cognito-local.

    Raises:
        InvalidCredentialsError 401: refresh token rejected or expired.
        CognitoUnavailableError 503: Cognito itself failed.
        TokenVerificationError 401: the returned ID token didn't verify.
        UnknownSubjectError 401: no local user for the token's subject.
    """
    response = await get_cognito_client().refresh_token(email, refresh_token)
    return await _to_auth_result(user_repo, response)
