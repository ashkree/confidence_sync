# app/routers/tickets.py
import uuid

from fastapi import APIRouter, Depends, status

from app.authorization.guards import require_admin, require_authenticated
from app.authorization.tickets import can_access, is_in_scope
from app.exceptions.tickets import TicketAccessDeniedError
from app.models import User
from app.repository.document import DocumentRepo, get_document_repo
from app.repository.ticket import TicketRepo, get_ticket_repo
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
from app.services.tickets import (
    create_ticket,
    create_ticket_comment,
    read_tickets_by_department,
    summarize_ticket,
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
    ticket_repo: TicketRepo = Depends(get_ticket_repo),
    document_repo: DocumentRepo = Depends(get_document_repo),
    current_user: User = Depends(require_authenticated),
):
    """Create a new HR request or IT ticket.

    Returns:
        TicketDetailResponse: The newly created ticket.
    """

    return await create_ticket(ticket_repo, document_repo, current_user, payload)


@ticket_router.get(
    "",
    response_model=list[TicketListReponse],
    summary="List departmental tickets",
)
async def get_tickets(
    repo: TicketRepo = Depends(get_ticket_repo),
    current_user: User = Depends(require_admin),
):
    """List tickets for the current user's department.

    Only admins can access this endpoint. They see tickets relevant
    to their respective department (HR or IT).

    Returns:
        list[TicketListReponse]: A list of tickets in the department.
    """

    return await read_tickets_by_department(repo, current_user)


@ticket_router.get(
    "/me",
    response_model=list[TicketListReponse],
    summary="List my tickets",
)
async def get_own_tickets(
    ticket_repo: TicketRepo = Depends(get_ticket_repo),
    current_user: User = Depends(require_authenticated),
):
    """Get all tickets submitted by the current user.

    Returns:
        list[TicketListReponse]: A list of tickets submitted by the user.
    """

    return await ticket_repo.read_by_poster(current_user.id)


@ticket_router.get(
    "/{id}",
    response_model=TicketDetailResponse,
    summary="Get ticket details",
)
async def get_ticket(
    id: uuid.UUID,
    ticket_repo: TicketRepo = Depends(get_ticket_repo),
    current_user: User = Depends(require_authenticated),
):
    """Get the details for a specific ticket.

    Returns:
        TicketDetailResponse: Detailed information for the requested ticket.

    Raises:
        TicketAccessDeniedError 403: If the user is not authorized to view the ticket.
    """

    ticket = await ticket_repo.read_by_id(id)

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
    ticket_repo: TicketRepo = Depends(get_ticket_repo),
    current_user: User = Depends(require_admin),
):
    """Update the status field of a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket details.
    """
    ticket = await ticket_repo.read_by_id(id)

    if not is_in_scope(current_user.department, ticket.type):
        raise TicketAccessDeniedError(id)

    return await update_ticket_status(ticket_repo, ticket, payload.status)


@ticket_router.patch(
    "/{id}/priority",
    response_model=TicketDetailResponse,
    summary="Update ticket priority",
)
async def patch_ticket_priority(
    id: uuid.UUID,
    payload: TicketPriorityPatch,
    ticket_repo: TicketRepo = Depends(get_ticket_repo),
    current_user: User = Depends(require_admin),
):
    """Update the priority field of a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket details.
    """
    ticket = await ticket_repo.read_by_id(id)

    if not is_in_scope(current_user.department, ticket.type):
        raise TicketAccessDeniedError(id)

    return await update_ticket_priority(ticket_repo, ticket, payload.priority)


@ticket_router.patch(
    "/{id}/assignee",
    response_model=TicketDetailResponse,
    summary="Assign a ticket",
)
async def patch_ticket_assignee(
    id: uuid.UUID,
    payload: TicketAssigneePatch,
    ticket_repo: TicketRepo = Depends(get_ticket_repo),
    current_user: User = Depends(require_admin),
):
    """Assign or unassign a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket details.

    """
    ticket = await ticket_repo.read_by_id(id)

    if not is_in_scope(current_user.department, ticket.type):
        raise TicketAccessDeniedError(id)

    return await update_ticket_assignee(ticket_repo, ticket, payload.assignee_id)


@ticket_router.post(
    "/{id}/comments",
    response_model=TicketCommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a ticket comment",
)
async def post_ticket_comment(
    id: uuid.UUID,
    payload: TicketCommentCreate,
    ticket_repo: TicketRepo = Depends(get_ticket_repo),
    current_user: User = Depends(require_authenticated),
):
    """Add a new comment to a ticket.

    Returns:
        TicketCommentResponse: The newly created comment.

    """
    ticket = await ticket_repo.read_by_id(id)

    if not can_access(current_user, ticket):
        raise TicketAccessDeniedError(id)

    return await create_ticket_comment(ticket_repo, payload, ticket, current_user.id)


@ticket_router.get(
    "/{id}/comments",
    response_model=list[TicketCommentResponse],
    summary="Get ticket comments",
)
async def get_ticket_comments(
    id: uuid.UUID,
    ticket_repo: TicketRepo = Depends(get_ticket_repo),
    current_user: User = Depends(require_authenticated),
):
    """Get all comments for a ticket.

    Returns:
        list[TicketCommentResponse]: A list of comments for the ticket.
    """
    ticket = await ticket_repo.read_by_id(id)

    if not can_access(current_user, ticket):
        raise TicketAccessDeniedError(id)

    return await ticket_repo.read_comments(id)


@ticket_router.patch(
    "/{id}/summarize",
    response_model=TicketDetailResponse,
    summary="Generate AI summary",
)
async def summarize_ticket_route(
    id: uuid.UUID,
    ticket_repo: TicketRepo = Depends(get_ticket_repo),
    current_user: User = Depends(require_admin),
):
    """Generate an AI summary for a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket with ai_summary populated.
    """

    ticket = await ticket_repo.read_by_id(id)

    if not is_in_scope(current_user.department, ticket.type):
        raise TicketAccessDeniedError(id)

    return await summarize_ticket(ticket_repo, ticket)
