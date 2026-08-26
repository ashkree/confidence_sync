# app/exception_handlers.py
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.exceptions.base import (
    ConflictError,
    ExternalServiceError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
)

logger = logging.getLogger(__name__)


def _error_code(exc: Exception) -> str:
    """TicketNotFoundError -> 'ticket_not_found'"""
    name = type(exc).__name__.removesuffix("Error")
    return "".join(f"_{c.lower()}" if c.isupper() else c for c in name).lstrip("_")


def _envelope(exc: Exception, detail: str | None = None) -> dict:
    return {"error": _error_code(exc), "detail": detail or str(exc)}


def register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(NotFoundError)
    async def handle_not_found(request: Request, exc: NotFoundError):
        return JSONResponse(status_code=404, content=_envelope(exc))

    @app.exception_handler(ForbiddenError)
    async def handle_forbidden(request: Request, exc: ForbiddenError):
        return JSONResponse(status_code=403, content=_envelope(exc))

    @app.exception_handler(UnauthorizedError)
    async def handle_unauthorized(request: Request, exc: UnauthorizedError):
        return JSONResponse(
            status_code=401,
            content=_envelope(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.exception_handler(ConflictError)
    async def handle_conflict(request: Request, exc: ConflictError):
        return JSONResponse(status_code=409, content=_envelope(exc))

    @app.exception_handler(ExternalServiceError)
    async def handle_external(request: Request, exc: ExternalServiceError):
        logger.exception(
            "External service failure", exc_info=exc
        )  # real detail, server-side only
        return JSONResponse(
            status_code=503,
            content=_envelope(
                exc, detail="A dependent service is currently unavailable"
            ),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected(request: Request, exc: Exception):
        logger.exception("Unhandled exception", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={
                "error": "internal_error",
                "detail": "An unexpected error occurred",
            },
        )
