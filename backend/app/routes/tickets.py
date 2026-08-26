# app/routers/tickets.py
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.authorization.guards import require_admin, require_authenticated
from app.authorization.tickets import can_access, is_in_scope
from app.database import get_db
from app.exceptions.tickets import TicketAccessDeniedError
from app.models import User
from app.schemas.tickets import (
    TicketAssigneePatch,
    TicketCommentCreate,
    TicketCommentResponse,
    TicketCreate,
    TicketDetailResponse,
    TicketListReponse,
    TicketPriorityPatch,
    TicketStatusPatch,
)
from app.services.ai import generate_ticket_summary
from app.services.tickets import (
    create_ticket,
    create_ticket_comment,
    read_ticket_by_id,
    read_ticket_comments,
    read_tickets_by_department,
    read_tickets_by_poster,
    update_ticket_assignee,
    update_ticket_priority,
    update_ticket_status,
)

ticket_router = APIRouter(prefix="/tickets")


@ticket_router.post(
    "",
    response_model=TicketDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a ticket",
)
async def create_ticket_route(
    payload: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    """Create a new HR request or IT ticket.

    Returns:
        TicketDetailResponse: The newly created ticket.
    """

    ticket = await create_ticket(db, current_user, payload)

    await generate_ticket_summary(db, ticket)
    return ticket


@ticket_router.get(
    "",
    response_model=list[TicketListReponse],
    summary="List departmental tickets",
)
async def get_tickets(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(require_admin)
):
    """List tickets for the current user's department.

    Only admins can access this endpoint. They see tickets relevant
    to their respective department (HR or IT).

    Returns:
        list[TicketListReponse]: A list of tickets in the department.
    """

    return await read_tickets_by_department(db, current_user)


@ticket_router.get(
    "/me",
    response_model=list[TicketListReponse],
    summary="List my tickets",
)
async def get_own_tickets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    """Get all tickets submitted by the current user.

    Returns:
        list[TicketListReponse]: A list of tickets submitted by the user.
    """

    return await read_tickets_by_poster(db, current_user)


@ticket_router.get(
    "/{id}",
    response_model=TicketDetailResponse,
    summary="Get ticket details",
)
async def get_ticket(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    """Get the details for a specific ticket.

    Returns:
        TicketDetailResponse: Detailed information for the requested ticket.

    Raises:
        TicketAccessDeniedError 403: If the user is not authorized to view the ticket.
    """

    ticket = await read_ticket_by_id(db, id)

    if not can_access(current_user, ticket):
        raise TicketAccessDeniedError(id)

    return ticket


@ticket_router.patch(
    "/{id}/status",
    response_model=TicketDetailResponse,
    summary="Update ticket status",
)
async def patch_ticket_status(
    id: uuid.UUID,
    payload: TicketStatusPatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update the status field of a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket details.
    """
    ticket = await read_ticket_by_id(db, id)

    if not is_in_scope(current_user.department, ticket.type):
        raise TicketAccessDeniedError(id)

    return await update_ticket_status(db, ticket, payload.status)


@ticket_router.patch(
    "/{id}/priority",
    response_model=TicketDetailResponse,
    summary="Update ticket priority",
)
async def patch_ticket_priority(
    id: uuid.UUID,
    payload: TicketPriorityPatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update the priority field of a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket details.
    """
    ticket = await read_ticket_by_id(db, id)

    if not is_in_scope(current_user.department, ticket.type):
        raise TicketAccessDeniedError(id)

    return await update_ticket_priority(db, ticket, payload.priority)


@ticket_router.patch(
    "/{id}/assignee",
    response_model=TicketDetailResponse,
    summary="Assign a ticket",
)
async def patch_ticket_assignee(
    id: uuid.UUID,
    payload: TicketAssigneePatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Assign or unassign a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket details.

    """
    ticket = await read_ticket_by_id(db, id)

    if not is_in_scope(current_user.department, ticket.type):
        raise TicketAccessDeniedError(id)

    return await update_ticket_assignee(db, ticket, payload.assignee_id)


@ticket_router.post(
    "/{id}/comments",
    response_model=TicketCommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a ticket comment",
)
async def post_ticket_comment(
    id: uuid.UUID,
    payload: TicketCommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    """Add a new comment to a ticket.

    Returns:
        TicketCommentResponse: The newly created comment.

    """
    ticket = await read_ticket_by_id(db, id)

    if not can_access(current_user, ticket):
        raise TicketAccessDeniedError(id)

    comment = await create_ticket_comment(db, payload, id, current_user.id)
    await generate_ticket_summary(db, ticket)
    return comment


@ticket_router.get(
    "/{id}/comments",
    response_model=list[TicketCommentResponse],
    summary="Get ticket comments",
)
async def get_ticket_comments(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_authenticated),
):
    """Get all comments for a ticket.

    Returns:
        list[TicketCommentResponse]: A list of comments for the ticket.
    """
    ticket = await read_ticket_by_id(db, id)

    if not can_access(current_user, ticket):
        raise TicketAccessDeniedError(id)

    return await read_ticket_comments(db, id)


@ticket_router.patch(
    "/{id}/summarize",
    response_model=TicketDetailResponse,
    summary="Generate AI summary",
)
async def summarize_ticket_route(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Generate an AI summary for a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket with ai_summary populated.
    """

    ticket = await read_ticket_by_id(db, id)

    if not is_in_scope(current_user.department, ticket.type):
        raise TicketAccessDeniedError(id)

    updated_ticket = await generate_ticket_summary(db, ticket)
    return updated_ticket
