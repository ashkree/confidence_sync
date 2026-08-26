# app/exceptions/auth.py
from app.exceptions.base import ForbiddenError, UnauthorizedError


class AuthError(Exception):
    """Marker mixin for authentication-domain errors — distinct from
    AuthorizationError in exceptions/authorization.py, which covers
    'who you are' passing but 'what you're allowed to do' failing."""


class InvalidCredentialsError(AuthError, UnauthorizedError):
    """Username/password combination was rejected by Cognito.
    Deliberately used for both 'user not found' and 'wrong password'
    so the API response can't be used to enumerate valid emails."""


class AccountNotConfirmedError(AuthError, ForbiddenError):
    """Credentials were accepted but the account is not confirmed yet. -> 403

    ForbiddenError, not UnauthorizedError, so this keeps returning 403 the way
    the old hand-written HTTPException in routes/auth.py did. Retrying with
    different credentials won't help — the client needs the confirmation flow.
    """


class TokenVerificationError(AuthError, UnauthorizedError):
    """A JWT failed signature, issuer, audience, expiry, or claim-shape
    verification. Replaces the old bare ValueError from jwt.py."""


class UnknownSubjectError(AuthError, UnauthorizedError):
    """Token verified successfully but no local user matches its subject.

    Deliberately 401 rather than 404: the credential is unusable from the
    caller's point of view, and a 404 here would confirm which Cognito
    subjects have been provisioned locally. Distinct from
    exceptions/users.py::UserNotFoundError, which is the plain 404 raised
    by UserRepo on non-auth lookups.
    """
