# app/exceptions/auth.py
from app.exceptions.base import UnauthorizedError


class AuthError(Exception):
    """Marker mixin for authentication-domain errors — distinct from
    AuthorizationError in exceptions/authorization.py, which covers
    'who you are' passing but 'what you're allowed to do' failing."""


class InvalidCredentialsError(AuthError, UnauthorizedError):
    """Username/password combination was rejected by Cognito.
    Deliberately used for both 'user not found' and 'wrong password'
    so the API response can't be used to enumerate valid emails."""


class AccountNotConfirmedError(AuthError, UnauthorizedError):
    """User exists but hasn't confirmed their account yet."""


class TokenVerificationError(AuthError, UnauthorizedError):
    """A JWT failed signature, issuer, audience, expiry, or claim-shape
    verification. Replaces the old bare ValueError from jwt.py."""


class UserNotFoundError(AuthError, UnauthorizedError):
    """Token verified successfully but no local user matches its subject."""
