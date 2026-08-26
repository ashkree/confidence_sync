# app/exceptions/authorization.py
import uuid

from app.exceptions.base import ForbiddenError
from app.models.user import UserDepartment, UserRole


class AuthorizationError(Exception):
    """Marker mixin — distinct from AuthError in exceptions/auth.py, which
    covers bad credentials/tokens. This is 'you are who you say you are,
    but not allowed to do this.'"""


class RoleRequiredError(AuthorizationError, ForbiddenError):
    def __init__(self, required_role: UserRole):
        self.required_role = required_role
        super().__init__(f"Requires role: {required_role.value}")


class DepartmentRequiredError(AuthorizationError, ForbiddenError):
    def __init__(self, required_department: UserDepartment):
        self.required_department = required_department
        super().__init__(f"Requires department: {required_department.value}")


class NotOwnerError(AuthorizationError, ForbiddenError):
    def __init__(self, id: uuid.UUID):
        self.target_id = id
        super().__init__(f"You are not the owner of the resource with id {id}")
