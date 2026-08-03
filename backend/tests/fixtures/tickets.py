import uuid
from datetime import date, datetime, timezone

import pytest

from app.models import HrRequest, ItTicket
from app.models.hr_request import DocumentType, RequestType
from app.models.it_ticket import ITRequestType
from app.models.ticket import TicketPriority, TicketStatus, TicketType

# -------------------------------------------------------------------
# HR TICKETS
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


# -------------------------------------------------------------------
# IT TICKETS
# -------------------------------------------------------------------


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
