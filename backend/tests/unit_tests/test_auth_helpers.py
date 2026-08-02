"""
This file tests authorization helpers that determines which users can access an endpoint
"""

from app.services.tickets import can_access, is_admin, is_in_scope, is_owner


class TestIsAdmin:
    """
    Tests the is_admin() helper function
    """

    def test_returns_true_for_it_admin(self, it_admin_user_1):
        assert is_admin(it_admin_user_1.role) is True

    def test_returns_true_for_hr_admin(self, hr_admin_user_1):
        assert is_admin(hr_admin_user_1.role) is True

    def test_returns_false_for_employee(self, employee_1):
        # FIX: Explicitly assert False
        assert is_admin(employee_1.role) is False


class TestIsInScope:
    """
    Tests the is_in_scope() helper function
    """

    def test_returns_true_for_it_ticket_and_it_admin(
        self, it_ticket_pending, it_admin_user_1
    ):
        assert is_in_scope(it_admin_user_1.department, it_ticket_pending.type) is True

    def test_returns_false_for_it_ticket_and_hr_admin(
        self, it_ticket_pending, hr_admin_user_1
    ):
        assert is_in_scope(hr_admin_user_1.department, it_ticket_pending.type) is False

    def test_returns_true_for_hr_request_and_hr_admin(
        self, hr_ticket_open, hr_admin_user_1
    ):
        assert is_in_scope(hr_admin_user_1.department, hr_ticket_open.type) is True

    def test_returns_false_for_hr_request_and_it_admin(
        self, hr_ticket_open, it_admin_user_1
    ):
        assert is_in_scope(it_admin_user_1.department, hr_ticket_open.type) is False

    def test_returns_false_if_user_department_is_none(self, employee_1, hr_ticket_open):
        assert is_in_scope(employee_1.department, hr_ticket_open.type) is False


class TestIsOwner:
    """
    Tests the is_owner() helper function
    """

    def test_returns_true_when_user_is_poster(self, hr_ticket_open, employee_1):
        # hr_ticket_open was posted by employee_1
        assert is_owner(hr_ticket_open.poster_id, employee_1.id) is True

    def test_returns_false_when_user_is_not_poster(self, hr_ticket_open, employee_2):
        # employee_2 is not the poster
        assert is_owner(hr_ticket_open.poster_id, employee_2.id) is False


class TestCanAccess:
    """
    Tests the can_access() helper function
    """

    def test_returns_true_for_ticket_owner(self, hr_ticket_open, employee_1):
        # Poster should always have access
        assert can_access(employee_1, hr_ticket_open) is True

    def test_returns_true_for_in_scope_admin(self, it_ticket_pending, it_admin_user_1):
        # IT ticket should be accessible by IT admin
        assert can_access(it_admin_user_1, it_ticket_pending) is True

    def test_returns_true_for_admin_who_is_also_owner(self, hr_admin_user_1):
        # Simulating an admin creating a ticket (acting as poster)
        import uuid
        from datetime import datetime, timezone

        from app.models.hr_request import HrRequest, RequestType
        from app.models.ticket import TicketPriority, TicketStatus, TicketType

        admin_ticket = HrRequest(
            id=uuid.uuid4(),
            poster_id=hr_admin_user_1.id,
            type=TicketType.HR_REQUEST,
            status=TicketStatus.OPEN,
            priority=TicketPriority.LOW,
            subject="Admin self request",
            request_type=RequestType.LEAVE_REQUEST,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        assert can_access(hr_admin_user_1, admin_ticket) is True

    def test_returns_false_for_out_of_scope_admin(self, hr_ticket_open, it_admin_user_1):
        # IT admin should NOT have access to an HR ticket (if they didn't post it)
        assert can_access(it_admin_user_1, hr_ticket_open) is False

    def test_returns_false_for_non_owner_employee(self, it_ticket_pending, employee_1):
        # employee_1 didn't post it_ticket_pending (employee_3 did)
        assert can_access(employee_1, it_ticket_pending) is False
