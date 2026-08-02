import uuid
from datetime import date, datetime, timezone

import pytest

from app.models import HrRequest, ItTicket, TicketComment, User
from app.models.hr_request import DocumentType, RequestType
from app.models.it_ticket import ITRequestType
from app.models.ticket import TicketPriority, TicketStatus, TicketType
from app.models.user import UserDepartment, UserRole

# -------------------------------------------------------------------
# USER FIXTURES
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
        created_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
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
        created_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
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
        created_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
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
        created_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
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
        created_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
    )


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
        created_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
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
        created_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
    )


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
        created_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
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
        created_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 10, 0, tzinfo=timezone.utc),
    )


# -------------------------------------------------------------------
# TICKET FIXTURES
# -------------------------------------------------------------------


@pytest.fixture()
def hr_ticket_open(employee_1) -> HrRequest:
    return HrRequest(
        id=uuid.uuid4(),
        poster_id=employee_1.id,
        assignee_id=None,
        type=TicketType.HR_REQUEST,
        status=TicketStatus.OPEN,
        priority=TicketPriority.MEDIUM,
        subject="Leave Request",
        description="I need some time off for vacation.",
        request_type=RequestType.LEAVE_REQUEST,
        document_type=None,
        from_date=date(2026, 9, 1),
        to_date=date(2026, 9, 10),
        created_at=datetime(2026, 8, 2, 11, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 11, 0, tzinfo=timezone.utc),
    )


@pytest.fixture()
def hr_ticket_resolved(employee_2, hr_admin_user_1) -> HrRequest:
    return HrRequest(
        id=uuid.uuid4(),
        poster_id=employee_2.id,
        assignee_id=hr_admin_user_1.id,
        type=TicketType.HR_REQUEST,
        status=TicketStatus.RESOLVED,
        priority=TicketPriority.HIGH,
        subject="Salary Certificate",
        description="I need a salary certificate for a bank loan.",
        request_type=RequestType.DOCUMENT_REQUEST,
        document_type=DocumentType.SALARY_CERTIFICATE,
        from_date=None,
        to_date=None,
        created_at=datetime(2026, 8, 2, 11, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 14, 0, tzinfo=timezone.utc),
    )


@pytest.fixture()
def it_ticket_pending(employee_3, it_admin_user_1) -> ItTicket:
    return ItTicket(
        id=uuid.uuid4(),
        poster_id=employee_3.id,
        assignee_id=it_admin_user_1.id,
        type=TicketType.IT_TICKET,
        status=TicketStatus.PENDING,
        priority=TicketPriority.HIGH,
        subject="Broken Monitor",
        description="My external monitor is flickering and won't turn on.",
        request_type=ITRequestType.HARDWARE_ISSUE,
        device_type="Monitor",
        fault_code="ERR123",
        software_name=None,
        created_at=datetime(2026, 8, 2, 12, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 2, 12, 30, tzinfo=timezone.utc),
    )


@pytest.fixture()
def it_ticket_closed(employee_4, it_admin_user_2) -> ItTicket:
    return ItTicket(
        id=uuid.uuid4(),
        poster_id=employee_4.id,
        assignee_id=it_admin_user_2.id,
        type=TicketType.IT_TICKET,
        status=TicketStatus.CLOSED,
        priority=TicketPriority.LOW,
        subject="IDE setup issue",
        description="VSCode isn't recognizing my python interpreter.",
        request_type=ITRequestType.SOFTWARE_ISSUE,
        device_type=None,
        fault_code=None,
        software_name="VSCode",
        created_at=datetime(2026, 8, 1, 9, 0, tzinfo=timezone.utc),
        updated_at=datetime(2026, 8, 1, 15, 0, tzinfo=timezone.utc),
    )


# -------------------------------------------------------------------
# COMMENT FIXTURES
# -------------------------------------------------------------------


@pytest.fixture()
def comment_admin_on_it_ticket(it_ticket_pending, it_admin_user_1) -> TicketComment:
    return TicketComment(
        id=uuid.uuid4(),
        ticket_id=it_ticket_pending.id,
        author_id=it_admin_user_1.id,
        body="I've ordered a replacement monitor. It should arrive tomorrow.",
        created_at=datetime(2026, 8, 2, 12, 15, tzinfo=timezone.utc),
    )


@pytest.fixture()
def comment_employee_reply(it_ticket_pending, employee_3) -> TicketComment:
    return TicketComment(
        id=uuid.uuid4(),
        ticket_id=it_ticket_pending.id,
        author_id=employee_3.id,
        body="Great, thank you! Let me know when it arrives.",
        created_at=datetime(2026, 8, 2, 12, 30, tzinfo=timezone.utc),
    )
