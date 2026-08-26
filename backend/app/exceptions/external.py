# app/exceptions/external.py
from app.exceptions.base import ExternalServiceError, NotFoundError


class ExternalServiceErrorMixin(Exception):
    """Marker mixin for downstream-service failures (Bedrock, S3, Cognito).
    Not raised directly — pairs with ExternalServiceError."""


class CognitoUnavailableError(ExternalServiceErrorMixin, ExternalServiceError):
    def __init__(self, detail: str = "Cognito request failed"):
        super().__init__(detail)


class BedrockUnavailableError(ExternalServiceErrorMixin, ExternalServiceError):
    def __init__(self, detail: str = "Bedrock request failed"):
        super().__init__(detail)


class S3UnavailableError(ExternalServiceErrorMixin, ExternalServiceError):
    def __init__(self, detail: str = "S3 request failed"):
        super().__init__(detail)


class S3ObjectNotFoundError(ExternalServiceErrorMixin, NotFoundError):
    """The bucket/key is valid but the object doesn't exist (S3 NoSuchKey).
    Distinct from S3UnavailableError — this isn't the service failing,
    it's a normal 'not found' the caller should translate to its own
    domain exception (e.g. DocumentNotFoundError)."""

    def __init__(self, detail: str = "S3 object not found"):
        super().__init__(detail)
