# tickets.py

from app.exceptions.base import ForbiddenError, NotFoundError


class TicketError(Exception):
    """Marker mixin — tag for anything ticket-domain, not a response type itself."""


class TicketNotFoundError(TicketError, NotFoundError):
    def __init__(self, ticket_id):
        self.ticket_id = ticket_id
        super().__init__(f"Ticket {ticket_id} not found")


class TicketAccessDeniedError(TicketError, ForbiddenError):
    def __init__(self, ticket_id):
        self.ticket_id = ticket_id
        super().__init__(f"Not authorized to access this ticket {ticket_id}")
