import uuid

from app.exceptions.base import ForbiddenError, NotFoundError
from app.models.user import UserDepartment


class DocumentError(Exception):
    """Marker mixin for document-domain errors."""


class DocumentNotFoundError(DocumentError, NotFoundError):
    def __init__(self, target_id: uuid.UUID):
        self.target_id = target_id
        super().__init__(f"Document {target_id} not found")


class DepartmentNotConfiguredError(DocumentError, ForbiddenError):
    """User's department has no associated document bucket."""

    def __init__(self, department: UserDepartment | None):
        self.department = department
        super().__init__(f"No document bucket configured for department: {department}")


class DocumentDeleteDeniedError(DocumentError, ForbiddenError):
    """User is not allowed to delete this document."""

    def __init__(self, id: uuid.UUID):
        self.id = id
        super().__init__(f"You can not delete the document with id {id}")
