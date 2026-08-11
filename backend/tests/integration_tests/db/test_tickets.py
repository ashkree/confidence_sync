import uuid

import pytest

from app.models.ticket import TicketPriority, TicketStatus, TicketType
from app.schemas.tickets import HrRequestCreate, ItTicketCreate, TicketCommentCreate
from app.services.tickets import (
    create_ticket,
    create_ticket_comment,
    read_ticket_by_id,
    read_ticket_comments,
    read_tickets_by_department,
    read_tickets_by_poster,
    update_ticket_priority,
    update_ticket_status,
)


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestReadTickets:
    """Tests for read_tickets_by_poster, read_tickets_by_department,
    and read_ticket_by_id service functions."""

    async def test_read_tickets_by_poster_returns_current_users_tickets(
        self, db_session, employee_1
    ):
        """Verify that reading tickets by poster returns the tickets created by the current user."""

        result = await read_tickets_by_poster(db_session, employee_1)
        tickets = result

        assert len(tickets) == 1

    async def test_read_tickets_by_department_returns_it_tickets_for_it_admin(
        self, db_session, it_admin_user_1
    ):
        """Verify that an IT admin reading tickets by department gets all IT tickets."""

        result = await read_tickets_by_department(db_session, it_admin_user_1)
        tickets = result

        assert len(tickets) == 2
        assert all(ticket.type == TicketType.IT_TICKET for ticket in tickets)

    async def test_read_tickets_by_department_returns_hr_requests_for_hr_admin(
        self, db_session, hr_admin_user_1
    ):
        """Verify that an HR admin reading tickets by department gets all HR requests."""

        result = await read_tickets_by_department(db_session, hr_admin_user_1)
        tickets = result

        assert len(tickets) == 2
        assert all(ticket.type == TicketType.HR_REQUEST for ticket in tickets)

    async def test_read_ticket_by_id_returns_ticket_if_exists(
        self, db_session, employee_1
    ):
        """Verify that a ticket can be retrieved by its ID if it exists."""

        tickets = await read_tickets_by_poster(db_session, employee_1)

        ticket = tickets[0]

        result = await read_ticket_by_id(db_session, ticket.id)

        assert result is not None
        assert ticket.id == result.id
        assert ticket.subject == result.subject

    async def test_read_ticket_by_id_returns_none_if_not_exists(self, db_session):
        """Verify that attempting to read a ticket with a non-existent ID returns None."""

        result = await read_ticket_by_id(db_session, uuid.uuid4())

        assert result is None

    async def test_read_tickets_by_poster_returns_empty_for_user_with_no_tickets(
        self, db_session, employee_5
    ):
        """Verify that an employee who has never posted a ticket gets an empty result set."""

        result = await read_tickets_by_poster(db_session, employee_5)
        tickets = result

        assert len(tickets) == 0

    async def test_read_tickets_by_department_raises_permission_error_for_employee(
        self, db_session, employee_1
    ):
        """An employee with no department should trigger a PermissionError,
        because only IT and HR departments are valid scopes."""

        with pytest.raises(PermissionError):
            await read_tickets_by_department(db_session, employee_1)


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestCreateTickets:
    """Tests for create_ticket — verifies returned objects and DB persistence."""

    async def test_create_ticket_returns_ticket(self, db_session, employee_1):
        """Verify that creating an IT ticket returns a properly populated ticket object."""

        subject = "Desktop not turning on"
        description = "My desktops would not turn on after restarting"

        new_ticket_data = ItTicketCreate(
            type="IT_TICKET",
            request_type="HARDWARE_ISSUE",
            device_type="desktop",
            subject=subject,
            description=description,
        )

        result = await create_ticket(db_session, employee_1, new_ticket_data)

        assert result.id is not None
        assert result.poster_id == employee_1.id
        assert result.assignee_id is None
        assert result.created_at is not None
        assert result.updated_at is not None
        assert result.status is TicketStatus.OPEN
        assert result.priority is TicketPriority.MEDIUM
        assert result.type is TicketType.IT_TICKET
        assert result.subject == subject
        assert result.description == description

    async def test_create_ticket_is_persisted(self, db_session, employee_1):
        """Verify that a created ticket is persisted to the database and can be retrieved."""

        subject = "Desktop not turning on"
        description = "My desktops would not turn on after restarting"

        new_ticket_data = ItTicketCreate(
            type="IT_TICKET",
            request_type="HARDWARE_ISSUE",
            device_type="desktop",
            subject=subject,
            description=description,
        )

        ticket = await create_ticket(db_session, employee_1, new_ticket_data)

        result = await read_ticket_by_id(db_session, ticket.id)

        assert result is not None
        assert result.subject == subject
        assert result.description == description

    async def test_create_hr_request_returns_ticket(self, db_session, employee_2):
        """Verify that an HR leave-request ticket is created correctly
        with the expected defaults and field values."""

        subject = "Annual leave"
        description = "Taking annual leave for a family event."

        new_ticket_data = HrRequestCreate(
            type="HR_REQUEST",
            request_type="LEAVE_REQUEST",
            subject=subject,
            description=description,
        )

        result = await create_ticket(db_session, employee_2, new_ticket_data)

        assert result.id is not None
        assert result.poster_id == employee_2.id
        assert result.assignee_id is None
        assert result.status is TicketStatus.OPEN
        assert result.priority is TicketPriority.MEDIUM
        assert result.type is TicketType.HR_REQUEST
        assert result.subject == subject
        assert result.description == description


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestUpdateTickets:
    """Tests for update_ticket_status and update_ticket_priority — verifies
    both the returned value and DB persistence."""

    async def test_update_ticket_status_updates_ticket(
        self, db_session, hr_ticket_resolved
    ):
        """Verify that updating a ticket's status modifies the returned ticket object."""
        target_status = "CLOSED"

        result = await update_ticket_status(
            db_session, hr_ticket_resolved, target_status
        )

        assert result.status == target_status

    async def test_update_ticket_status_persists(self, db_session, hr_ticket_resolved):
        """Verify that updating a ticket's status persists the change to the database."""
        target_status = "CLOSED"

        ticket = await update_ticket_status(
            db_session, hr_ticket_resolved, target_status
        )

        result = await read_ticket_by_id(db_session, ticket.id)

        assert result is not None
        assert result.status == target_status

    async def test_update_ticket_priority_updates_ticket(
        self, db_session, hr_ticket_resolved
    ):
        """Verify that updating a ticket's priority modifies the returned ticket object."""
        target_priority = "HIGH"

        result = await update_ticket_priority(
            db_session, hr_ticket_resolved, target_priority
        )

        assert result.priority == target_priority

    async def test_update_ticket_priority_persists(
        self, db_session, hr_ticket_resolved
    ):
        """Verify that updating a ticket's priority persists the change to the database."""
        target_priority = "HIGH"

        ticket = await update_ticket_priority(
            db_session, hr_ticket_resolved, target_priority
        )

        result = await read_ticket_by_id(db_session, ticket.id)

        assert result is not None
        assert result.priority == target_priority


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestTicketComments:
    """Tests for create_ticket_comment and read_ticket_comments."""

    async def test_create_ticket_comment_returns_comment(
        self, db_session, it_ticket_pending, employee_3
    ):
        """Verify the returned comment object has the expected
        body, ticket_id, and author_id."""

        comment_data = TicketCommentCreate(
            ticket_id=it_ticket_pending.id, body="This is a test comment"
        )

        result = await create_ticket_comment(db_session, comment_data, employee_3.id)

        assert result.id is not None
        assert result.body == "This is a test comment"
        assert result.ticket_id == it_ticket_pending.id
        assert result.author_id == employee_3.id
        assert result.created_at is not None

    async def test_create_ticket_comment_is_persisted(
        self, db_session, it_ticket_pending, employee_3
    ):
        """Verify that a newly created comment can be read back
        from the database."""

        comment_data = TicketCommentCreate(
            ticket_id=it_ticket_pending.id, body="Persisted comment"
        )

        comment = await create_ticket_comment(db_session, comment_data, employee_3.id)

        results = await read_ticket_comments(db_session, it_ticket_pending.id)

        assert any(c.id == comment.id for c in results)

    async def test_read_ticket_comments_returns_all_comments_in_order(
        self, db_session, it_ticket_pending
    ):
        """The seed data includes two comments on it_ticket_pending.
        Verify they are returned in chronological order."""

        results = await read_ticket_comments(db_session, it_ticket_pending.id)

        assert len(results) == 2
        assert results[0].created_at <= results[1].created_at

    async def test_read_ticket_comments_returns_empty_for_ticket_with_no_comments(
        self, db_session, hr_ticket_open
    ):
        """A ticket that has no comments should return an empty list."""

        results = await read_ticket_comments(db_session, hr_ticket_open.id)

        assert len(results) == 0
