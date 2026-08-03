import uuid
from datetime import datetime, timezone

import pytest

from app.models import User
from app.models.user import UserDepartment, UserRole

_TS = datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc)

# -------------------------------------------------------------------
# EMPLOYEES
# -------------------------------------------------------------------


@pytest.fixture()
def employee_1() -> User:
    return User(
        id=uuid.uuid4(),
        name="Employee One",
        email="employee_1@mail.com",
        cognito_sub=uuid.uuid4(),
        role=UserRole.EMPLOYEE,
        department=None,
        phone_number="10000000001",
        leave_days=15,
        created_at=_TS,
        updated_at=_TS,
    )


@pytest.fixture()
def employee_2() -> User:
    return User(
        id=uuid.uuid4(),
        name="Employee Two",
        email="employee_2@mail.com",
        cognito_sub=uuid.uuid4(),
        role=UserRole.EMPLOYEE,
        department=None,
        phone_number="10000000002",
        leave_days=10,
        created_at=_TS,
        updated_at=_TS,
    )


@pytest.fixture()
def employee_3() -> User:
    return User(
        id=uuid.uuid4(),
        name="Employee Three",
        email="employee_3@mail.com",
        cognito_sub=uuid.uuid4(),
        role=UserRole.EMPLOYEE,
        department=None,
        phone_number="10000000003",
        leave_days=20,
        created_at=_TS,
        updated_at=_TS,
    )


@pytest.fixture()
def employee_4() -> User:
    return User(
        id=uuid.uuid4(),
        name="Employee Four",
        email="employee_4@mail.com",
        cognito_sub=uuid.uuid4(),
        role=UserRole.EMPLOYEE,
        department=None,
        phone_number="10000000004",
        leave_days=5,
        created_at=_TS,
        updated_at=_TS,
    )


@pytest.fixture()
def employee_5() -> User:
    return User(
        id=uuid.uuid4(),
        name="Employee Five",
        email="employee_5@mail.com",
        cognito_sub=uuid.uuid4(),
        role=UserRole.EMPLOYEE,
        department=None,
        phone_number="10000000005",
        leave_days=2,
        created_at=_TS,
        updated_at=_TS,
    )


# -------------------------------------------------------------------
# IT ADMINS
# -------------------------------------------------------------------


@pytest.fixture()
def it_admin_user_1() -> User:
    return User(
        id=uuid.uuid4(),
        name="IT Admin One",
        email="it_admin_1@mail.com",
        cognito_sub=uuid.uuid4(),
        role=UserRole.ADMIN,
        department=UserDepartment.IT,
        phone_number="20000000001",
        leave_days=25,
        created_at=_TS,
        updated_at=_TS,
    )


@pytest.fixture()
def it_admin_user_2() -> User:
    return User(
        id=uuid.uuid4(),
        name="IT Admin Two",
        email="it_admin_2@mail.com",
        cognito_sub=uuid.uuid4(),
        role=UserRole.ADMIN,
        department=UserDepartment.IT,
        phone_number="20000000002",
        leave_days=18,
        created_at=_TS,
        updated_at=_TS,
    )


# -------------------------------------------------------------------
# HR ADMINS
# -------------------------------------------------------------------


@pytest.fixture()
def hr_admin_user_1() -> User:
    return User(
        id=uuid.uuid4(),
        name="HR Admin One",
        email="hr_admin_1@mail.com",
        cognito_sub=uuid.uuid4(),
        role=UserRole.ADMIN,
        department=UserDepartment.HR,
        phone_number="30000000001",
        leave_days=15,
        created_at=_TS,
        updated_at=_TS,
    )


@pytest.fixture()
def hr_admin_user_2() -> User:
    return User(
        id=uuid.uuid4(),
        name="HR Admin Two",
        email="hr_admin_2@mail.com",
        cognito_sub=uuid.uuid4(),
        role=UserRole.ADMIN,
        department=UserDepartment.HR,
        phone_number="30000000002",
        leave_days=20,
        created_at=_TS,
        updated_at=_TS,
    )
