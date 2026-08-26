# app/authorization/guards.py
from fastapi import Depends

from app.authorization.checks import department_is, role_is
from app.exceptions.authorization import AuthorizationError
from app.models import User
from app.models.user import UserDepartment, UserRole
from app.services.auth.dependencies import get_current_user


def require_all(*checks):
    """Build a FastAPI dependency requiring the current user to pass every check.

    Usage: require(role_is(UserRole.ADMIN), department_is(UserDepartment.IT))
    """

    async def dependency(user: User = Depends(get_current_user)) -> User:
        for check in checks:
            check(user)
        return user

    return dependency


def require_one(*checks):
    """Build a FastAPI dependency requiring the current user to pass one check.

    Usage: require(role_is(UserRole.ADMIN), department_is(UserDepartment.IT))
    """

    async def dependency(user: User = Depends(get_current_user)) -> User:
        errors = []
        for check in checks:
            try:
                check(user)
                return user  # first success wins
            except AuthorizationError as e:
                errors.append(e)
        raise errors[-1]

    return dependency


require_authenticated = (
    get_current_user  # named alias — reads consistently alongside the others
)

require_admin = require_all(role_is(UserRole.ADMIN))
require_it = require_all(role_is(UserRole.ADMIN), department_is(UserDepartment.IT))
require_hr = require_all(role_is(UserRole.ADMIN), department_is(UserDepartment.HR))
