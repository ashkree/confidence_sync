# app/routers/tickets.py
import uuid

from fastapi import APIRouter

from app.schemas.tickets import (
    Ticket,
    TicketComment,
    TicketCommentCreate,
    TicketStatusPatch,
)

ticket_router = APIRouter(prefix="/tickets")


# HELPERS
def own_tickets_query():
    """
    Queries the database for the current user's tickets.
    """
    # TODO(tomorrow): implement with SQLAlchemy, needs current_user + db session
    raise NotImplementedError


def department_tickets_query():
    """
    A query scoped to the current user's department and access level.
    """
    # TODO(tomorrow): implement with SQLAlchemy, needs current_user + db session
    raise NotImplementedError


@ticket_router.post("/", response_model=Ticket)
def create_ticket():
    """
    Create a new HR request or IT ticket.
    """
    # TODO(tomorrow): body param (HrRequestCreate | ItTicketCreate union),
    # current_user, db session. Also triggers async AI summarization -> information.
    raise NotImplementedError


@ticket_router.get("/", response_model=list[Ticket])
def get_tickets():
    """
    List tickets, scoped: employees see their own, admins see their department.
    """
    # TODO(tomorrow): current_user, db session, branch on role
    raise NotImplementedError


@ticket_router.get("/me", response_model=list[Ticket])
def get_own_tickets():
    """
    Get all tickets submitted by the current user.
    """
    # TODO(tomorrow): current_user, db session
    raise NotImplementedError


@ticket_router.get("/{id}", response_model=Ticket)
def get_ticket(id: uuid.UUID):
    """
    Get the details for a specific ticket.
    """
    # TODO(tomorrow): current_user, db session, scope check
    raise NotImplementedError


@ticket_router.patch("/{id}/status", response_model=Ticket)
def patch_ticket_status(id: uuid.UUID, payload: TicketStatusPatch):
    """
    Update the status field. Admin only.
    """
    # TODO(tomorrow): current_user (admin), db session, department scope check
    raise NotImplementedError


@ticket_router.post("/{id}/comments", response_model=TicketComment)
def post_ticket_comment(id: uuid.UUID, payload: TicketCommentCreate):
    """
    Add a comment to a ticket.
    """
    # TODO(tomorrow): current_user, db session, scope check.
    # Also triggers async AI summarization -> ticket.information
    raise NotImplementedError


@ticket_router.get("/{id}/comments", response_model=list[TicketComment])
def get_ticket_comments(id: uuid.UUID):
    """
    Get all comments related to a ticket.
    """
    # TODO(tomorrow): current_user, db session, scope check
    raise NotImplementedError
