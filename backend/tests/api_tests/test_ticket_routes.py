import uuid

import pytest
from sqlalchemy import func, select

from app.models import Ticket
from app.models.hr_request import RequestType
from app.models.it_ticket import ITRequestType
from app.models.ticket import TicketType
from app.schemas.tickets import HrRequestCreate, ItTicketCreate


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestCreateTicketRoutes:
    """Tests for POST /tickets/ — ticket creation."""

    async def test_create_ticket_route_returns_201_with_ticket(
        self, as_user, employee_1
    ):
        """Creating a valid IT ticket returns 201 with the full ticket payload."""

        client = as_user(employee_1)

        payload = ItTicketCreate(
            subject="Desktop",
            description="Desktop not turning on after restart",
            request_type=ITRequestType.HARDWARE_ISSUE.value,
            device_type="hardware_issue",
        )

        response = client.post("/tickets/", json=payload.model_dump())
        data = response.json()

        assert response.status_code == 201
        assert data["id"] is not None
        assert data["poster_id"] == str(employee_1.id)
        assert data["assignee_id"] is None
        assert data["type"] == "IT_TICKET"
        assert data["status"] == "OPEN"
        assert data["priority"] == "MEDIUM"
        assert data["subject"] == payload.subject
        assert data["description"] == payload.description
        assert data["request_type"] == payload.request_type
        assert data["device_type"] == payload.device_type

    async def test_create_hr_request_route_returns_201_with_ticket(
        self, as_user, employee_1
    ):
        """Creating a valid HR request returns 201 with the correct type and fields."""

        client = as_user(employee_1)

        payload = HrRequestCreate(
            subject="Leave Request",
            description="I need some time off for a family event.",
            request_type=RequestType.LEAVE_REQUEST.value,
        )

        response = client.post("/tickets/", json=payload.model_dump())
        data = response.json()

        assert response.status_code == 201
        assert data["id"] is not None
        assert data["poster_id"] == str(employee_1.id)
        assert data["assignee_id"] is None
        assert data["type"] == "HR_REQUEST"
        assert data["status"] == "OPEN"
        assert data["priority"] == "MEDIUM"
        assert data["subject"] == payload.subject
        assert data["description"] == payload.description
        assert data["request_type"] == payload.request_type


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestQueryTicketRoutes:
    """Tests for GET /tickets/ and GET /tickets/me — ticket listing."""

    async def test_get_tickets_returns_403_for_employee(self, as_user, employee_1):
        """Non-admin employees cannot list departmental tickets."""

        client = as_user(employee_1)

        response = client.get("/tickets/")
        assert response.status_code == 403

    async def test_get_tickets_returns_it_tickets_for_it_admin(
        self, as_user, it_admin_user_1, db_session
    ):
        """An IT admin receives only IT tickets, scoped to their department."""

        client = as_user(it_admin_user_1)

        response = client.get("/tickets/")
        data = response.json()
        ticket_type = TicketType.IT_TICKET.value

        assert response.status_code == 200
        assert len(data) == await db_session.scalar(
            select(func.count(Ticket.id)).where(Ticket.type == ticket_type)
        )
        assert all(ticket["type"] == ticket_type for ticket in data)

    async def test_get_tickets_returns_hr_tickets_for_hr_admin(
        self, as_user, hr_admin_user_1, db_session
    ):
        """An HR admin receives only HR tickets, scoped to their department."""

        client = as_user(hr_admin_user_1)

        response = client.get("/tickets/")
        data = response.json()
        ticket_type = TicketType.HR_REQUEST.value

        assert response.status_code == 200
        assert len(data) == await db_session.scalar(
            select(func.count(Ticket.id)).where(Ticket.type == ticket_type)
        )
        assert all(ticket["type"] == ticket_type for ticket in data)

    async def test_get_own_tickets_returns_current_users_tickets(
        self, as_user, employee_1
    ):
        """GET /tickets/me returns only tickets posted by the authenticated user."""

        client = as_user(employee_1)
        response = client.get("/tickets/me")
        data = response.json()

        assert response.status_code == 200
        assert all(ticket["poster_id"] == str(employee_1.id) for ticket in data)

    async def test_get_own_tickets_returns_empty_list_when_user_has_no_tickets(
        self, as_user, employee_5
    ):
        """GET /tickets/me returns an empty list when the user has no submitted tickets."""

        client = as_user(employee_5)
        response = client.get("/tickets/me")
        data = response.json()

        assert response.status_code == 200
        assert data == []


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestGetTicketDetailRoutes:
    """Tests for GET /tickets/{id} — single ticket retrieval."""

    async def test_get_ticket_returns_404_if_ticket_does_not_exist(
        self, as_user, employee_1
    ):
        """Returns 404 when the requested ticket ID does not exist."""

        client = as_user(employee_1)
        id = uuid.uuid4()

        response = client.get(f"/tickets/{id}")

        assert response.status_code == 404

    async def test_get_ticket_returns_403_if_user_is_not_admin_or_owner(
        self, as_user, employee_2, hr_ticket_open
    ):
        """Returns 403 when a non-owner employee requests another user's ticket."""

        client = as_user(employee_2)
        id = hr_ticket_open.id

        response = client.get(f"/tickets/{id}")

        assert response.status_code == 403

    async def test_get_ticket_returns_403_if_user_is_not_scoped_admin(
        self, as_user, it_admin_user_1, hr_ticket_open
    ):
        """Returns 403 when an admin from a different department requests the ticket."""

        client = as_user(it_admin_user_1)
        id = hr_ticket_open.id

        response = client.get(f"/tickets/{id}")

        assert response.status_code == 403

    async def test_get_ticket_returns_ticket_if_user_is_owner(
        self, as_user, employee_1, hr_ticket_open
    ):
        """Returns 200 with ticket data when the requesting user is the poster."""

        client = as_user(employee_1)
        id = hr_ticket_open.id

        response = client.get(f"/tickets/{id}")
        data = response.json()

        assert response.status_code == 200
        assert data["id"] == str(hr_ticket_open.id)
        assert data["poster_id"] == str(employee_1.id)
        assert data["subject"] == hr_ticket_open.subject

    async def test_get_ticket_returns_ticket_if_user_is_scoped_admin(
        self, as_user, hr_admin_user_1, hr_ticket_open
    ):
        """Returns 200 with ticket data when the requesting user is a scoped admin."""

        client = as_user(hr_admin_user_1)
        id = hr_ticket_open.id

        response = client.get(f"/tickets/{id}")
        data = response.json()

        assert response.status_code == 200
        assert data["id"] == str(hr_ticket_open.id)
        assert data["subject"] == hr_ticket_open.subject


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestPatchTicketStatusRoutes:
    """Tests for PATCH /tickets/{id}/status — ticket status updates."""

    async def test_patch_status_returns_404_if_ticket_does_not_exist(
        self, as_user, it_admin_user_1
    ):
        """Returns 404 when the ticket ID does not exist."""

        client = as_user(it_admin_user_1)
        response = client.patch(
            f"/tickets/{uuid.uuid4()}/status", json={"status": "PENDING"}
        )

        assert response.status_code == 404

    async def test_patch_status_returns_403_for_employee(
        self, as_user, employee_3, it_ticket_pending
    ):
        """Returns 403 when a non-admin employee attempts to change ticket status."""

        client = as_user(employee_3)
        response = client.patch(
            f"/tickets/{it_ticket_pending.id}/status", json={"status": "CLOSED"}
        )

        assert response.status_code == 403

    async def test_patch_status_returns_403_for_out_of_scope_admin(
        self, as_user, hr_admin_user_1, it_ticket_pending
    ):
        """Returns 403 when an admin tries to update a ticket outside their department."""

        client = as_user(hr_admin_user_1)
        response = client.patch(
            f"/tickets/{it_ticket_pending.id}/status", json={"status": "CLOSED"}
        )

        assert response.status_code == 403

    async def test_patch_status_updates_ticket_and_returns_200(
        self, as_user, it_admin_user_1, it_ticket_pending
    ):
        """Returns 200 with the updated ticket when a scoped admin changes the status."""

        client = as_user(it_admin_user_1)
        response = client.patch(
            f"/tickets/{it_ticket_pending.id}/status", json={"status": "RESOLVED"}
        )
        data = response.json()

        assert response.status_code == 200
        assert data["id"] == str(it_ticket_pending.id)
        assert data["status"] == "RESOLVED"


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestPatchTicketPriorityRoutes:
    """Tests for PATCH /tickets/{id}/priority — ticket priority updates."""

    async def test_patch_priority_returns_404_if_ticket_does_not_exist(
        self, as_user, it_admin_user_1
    ):
        """Returns 404 when the ticket ID does not exist."""

        client = as_user(it_admin_user_1)
        response = client.patch(
            f"/tickets/{uuid.uuid4()}/priority", json={"priority": "HIGH"}
        )

        assert response.status_code == 404

    async def test_patch_priority_returns_403_for_employee(
        self, as_user, employee_3, it_ticket_pending
    ):
        """Returns 403 when a non-admin employee attempts to change ticket priority."""

        client = as_user(employee_3)
        response = client.patch(
            f"/tickets/{it_ticket_pending.id}/priority", json={"priority": "LOW"}
        )

        assert response.status_code == 403

    async def test_patch_priority_returns_403_for_out_of_scope_admin(
        self, as_user, hr_admin_user_1, it_ticket_pending
    ):
        """Returns 403 when an admin tries to update a ticket outside their department."""

        client = as_user(hr_admin_user_1)
        response = client.patch(
            f"/tickets/{it_ticket_pending.id}/priority", json={"priority": "LOW"}
        )

        assert response.status_code == 403

    async def test_patch_priority_updates_ticket_and_returns_200(
        self, as_user, it_admin_user_1, it_ticket_pending
    ):
        """Returns 200 with the updated ticket when a scoped admin changes the priority."""

        client = as_user(it_admin_user_1)
        response = client.patch(
            f"/tickets/{it_ticket_pending.id}/priority", json={"priority": "LOW"}
        )
        data = response.json()

        assert response.status_code == 200
        assert data["id"] == str(it_ticket_pending.id)
        assert data["priority"] == "LOW"


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestTicketCommentsRoutes:
    """Tests for POST /tickets/{id}/comments and GET /tickets/{id}/comments."""

    # --- POST /tickets/{id}/comments ---

    async def test_post_comment_returns_404_if_ticket_does_not_exist(
        self, as_user, employee_1
    ):
        """Returns 404 when posting a comment to a non-existent ticket."""

        client = as_user(employee_1)
        response = client.post(
            f"/tickets/{uuid.uuid4()}/comments", json={"body": "Hello?"}
        )

        assert response.status_code == 404

    async def test_post_comment_returns_403_for_non_owner_employee(
        self, as_user, employee_2, hr_ticket_open
    ):
        """Returns 403 when a non-owner employee tries to comment on another user's ticket."""

        client = as_user(employee_2)
        response = client.post(
            f"/tickets/{hr_ticket_open.id}/comments",
            json={"body": "Can I help?"},
        )

        assert response.status_code == 403

    async def test_post_comment_returns_201_for_ticket_owner(
        self, as_user, employee_1, hr_ticket_open
    ):
        """Returns 201 with the new comment when the ticket owner adds a comment."""

        client = as_user(employee_1)
        body = "Any update on this?"
        response = client.post(
            f"/tickets/{hr_ticket_open.id}/comments", json={"body": body}
        )
        data = response.json()

        assert response.status_code == 201
        assert data["id"] is not None
        assert data["ticket_id"] == str(hr_ticket_open.id)
        assert data["author_id"] == str(employee_1.id)
        assert data["body"] == body

    async def test_post_comment_returns_201_for_scoped_admin(
        self, as_user, hr_admin_user_1, hr_ticket_open
    ):
        """Returns 201 with the new comment when a scoped admin adds a comment."""

        client = as_user(hr_admin_user_1)
        body = "We are reviewing your request."
        response = client.post(
            f"/tickets/{hr_ticket_open.id}/comments", json={"body": body}
        )
        data = response.json()

        assert response.status_code == 201
        assert data["author_id"] == str(hr_admin_user_1.id)
        assert data["body"] == body

    # --- GET /tickets/{id}/comments ---

    async def test_get_comments_returns_404_if_ticket_does_not_exist(
        self, as_user, employee_1
    ):
        """Returns 404 when fetching comments for a non-existent ticket."""

        client = as_user(employee_1)
        response = client.get(f"/tickets/{uuid.uuid4()}/comments")

        assert response.status_code == 404

    async def test_get_comments_returns_403_for_non_owner_employee(
        self, as_user, employee_2, hr_ticket_open
    ):
        """Returns 403 when a non-owner employee tries to read another user's ticket comments."""

        client = as_user(employee_2)
        response = client.get(f"/tickets/{hr_ticket_open.id}/comments")

        assert response.status_code == 403

    async def test_get_comments_returns_comments_for_ticket_owner(
        self, as_user, employee_3, it_ticket_pending
    ):
        """Returns 200 with ordered comments when the ticket owner requests them."""

        client = as_user(employee_3)
        response = client.get(f"/tickets/{it_ticket_pending.id}/comments")
        data = response.json()

        assert response.status_code == 200
        assert len(data) == 2
        assert all(c["ticket_id"] == str(it_ticket_pending.id) for c in data)

    async def test_get_comments_returns_comments_for_scoped_admin(
        self, as_user, it_admin_user_1, it_ticket_pending
    ):
        """Returns 200 with ordered comments when a scoped admin requests them."""

        client = as_user(it_admin_user_1)
        response = client.get(f"/tickets/{it_ticket_pending.id}/comments")
        data = response.json()

        assert response.status_code == 200
        assert len(data) == 2
        assert data[0]["author_id"] == str(it_admin_user_1.id)
