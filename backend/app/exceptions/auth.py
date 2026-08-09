# app/services/auth_exceptions.py


class AuthError(Exception):
    """Base class for auth-service errors."""


class InvalidCredentialsError(AuthError):
    """Username/password combination was rejected by Cognito.
    Deliberately used for both 'user not found' and 'wrong password'
    so the API response can't be used to enumerate valid emails."""


class AccountNotConfirmedError(AuthError):
    """User exists but hasn't confirmed their account yet."""


class AuthServiceUnavailableError(AuthError):
    """Unexpected Cognito/AWS error, not a credentials problem."""
