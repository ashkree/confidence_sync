# app/exceptions/users.py
import uuid

from app.exceptions.base import NotFoundError


class UserError(Exception):
    """Marker mixin for user-domain errors."""


class UserNotFoundError(UserError, NotFoundError):
    """No user row matches the given identifier. -> 404

    Raised by UserRepo. Callers on an authentication path should catch this
    and re-raise as UnknownSubjectError (401) — see services/users.py — so a
    404 is never used to probe which users exist.
    """

    def __init__(self, identifier: uuid.UUID | str):
        self.identifier = identifier
        super().__init__(f"User {identifier} not found")
