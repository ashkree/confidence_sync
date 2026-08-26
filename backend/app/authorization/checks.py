# app/authorization/checks.py

from app.exceptions.authorization import (
    DepartmentRequiredError,
    RoleRequiredError,
)
from app.models import User
from app.models.user import UserDepartment, UserRole


def role_is(role: UserRole):
    def check(user: User) -> None:
        if user.role != role:
            raise RoleRequiredError(role)

    return check


def department_is(department: UserDepartment):
    def check(user: User) -> None:
        if user.department != department:
            raise DepartmentRequiredError(department)

    return check
