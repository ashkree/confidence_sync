class AppError(Exception):
    """Root of every domain exception. Never raised directly."""


class NotFoundError(AppError):
    """A requested resource does not exist. → 404"""


class ForbiddenError(AppError):
    """Authenticated, but not allowed to do this. → 403"""


class UnauthorizedError(AppError):
    """Missing or invalid credentials. → 401"""


class ConflictError(AppError):
    """Request is valid but conflicts with current state. → 409"""


class ExternalServiceError(AppError):
    """A downstream dependency (Cognito, Bedrock, S3) failed. → 503"""
