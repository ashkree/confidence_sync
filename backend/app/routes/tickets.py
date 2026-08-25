# app/routers/tickets.py
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
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
from app.services.auth import get_current_user, require_admin
from app.services.tickets import (
    can_access,
    create_ticket,
    create_ticket_comment,
    is_admin,
    is_in_scope,
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
    current_user: User = Depends(get_current_user),
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
    responses={
        403: {"description": "Not an admin user"},
    },
)
async def get_tickets(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """List tickets for the current user's department.

    Only admins can access this endpoint. They see tickets relevant
    to their respective department (HR or IT).

    Returns:
        list[TicketListReponse]: A list of tickets in the department.

    Raises:
        HTTPException 403: If the user is not an admin.
    """

    if not is_admin(current_user.role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You are not authorized."
        )

    tickets = await read_tickets_by_department(db, current_user)

    return tickets


@ticket_router.get(
    "/me",
    response_model=list[TicketListReponse],
    summary="List my tickets",
)
async def get_own_tickets(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Get all tickets submitted by the current user.

    Returns:
        list[TicketListReponse]: A list of tickets submitted by the user.
    """

    tickets = await read_tickets_by_poster(db, current_user)

    return tickets


@ticket_router.get(
    "/{id}",
    response_model=TicketDetailResponse,
    summary="Get ticket details",
    responses={
        404: {"description": "Ticket not found"},
        403: {"description": "Not authorized to view this ticket"},
    },
)
async def get_ticket(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the details for a specific ticket.

    Returns:
        TicketDetailResponse: Detailed information for the requested ticket.

    Raises:
        HTTPException 404: If the ticket does not exist.
        HTTPException 403: If the user is not authorized to view the ticket.
    """

    ticket = await read_ticket_by_id(db, id)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    if not can_access(current_user, ticket):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this ticket",
        )

    return ticket


@ticket_router.patch(
    "/{id}/status",
    response_model=TicketDetailResponse,
    summary="Update ticket status",
    responses={
        404: {"description": "Ticket not found"},
        403: {"description": "Not authorized to view this ticket"},
    },
)
async def patch_ticket_status(
    id: uuid.UUID,
    payload: TicketStatusPatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the status field of a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket details.

    Raises:
        HTTPException 404: If the ticket does not exist.
        HTTPException 403: If the user is not an admin or out of scope.
    """
    ticket = await read_ticket_by_id(db, id)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    if not (
        is_admin(current_user.role)
        and is_in_scope(current_user.department, ticket.type)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this ticket",
        )

    return await update_ticket_status(db, ticket, payload.status)


@ticket_router.patch(
    "/{id}/priority",
    response_model=TicketDetailResponse,
    summary="Update ticket priority",
    responses={
        404: {"description": "Ticket not found"},
        403: {"description": "Not authorized to view this ticket"},
    },
)
async def patch_ticket_priority(
    id: uuid.UUID,
    payload: TicketPriorityPatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the priority field of a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket details.

    Raises:
        HTTPException 404: If the ticket does not exist.
        HTTPException 403: If the user is not an admin or out of scope.
    """
    ticket = await read_ticket_by_id(db, id)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    if not (
        is_admin(current_user.role)
        and is_in_scope(current_user.department, ticket.type)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this ticket",
        )

    return await update_ticket_priority(db, ticket, payload.priority)


@ticket_router.patch(
    "/{id}/assignee",
    response_model=TicketDetailResponse,
    summary="Assign a ticket",
    responses={
        404: {"description": "Ticket not found"},
        403: {"description": "Not authorized to assign this ticket"},
    },
)
async def patch_ticket_assignee(
    id: uuid.UUID,
    payload: TicketAssigneePatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Assign or unassign a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket details.

    Raises:
        HTTPException 404: If the ticket does not exist.
        HTTPException 403: If the user is not an admin or out of scope.
    """
    ticket = await read_ticket_by_id(db, id)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    if not (
        is_admin(current_user.role)
        and is_in_scope(current_user.department, ticket.type)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to assign this ticket",
        )

    return await update_ticket_assignee(db, ticket, payload.assignee_id)


@ticket_router.post(
    "/{id}/comments",
    response_model=TicketCommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a ticket comment",
    responses={
        404: {"description": "Ticket not found"},
        403: {"description": "Not authorized to view this ticket"},
    },
)
async def post_ticket_comment(
    id: uuid.UUID,
    payload: TicketCommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a new comment to a ticket.

    Returns:
        TicketCommentResponse: The newly created comment.

    Raises:
        HTTPException 404: If the ticket does not exist.
        HTTPException 403: If the user is not authorized to view the ticket.
    """
    ticket = await read_ticket_by_id(db, id)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    if not can_access(current_user, ticket):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this ticket",
        )

    comment = await create_ticket_comment(db, payload, current_user.id)
    await generate_ticket_summary(db, ticket)
    return comment


@ticket_router.get(
    "/{id}/comments",
    response_model=list[TicketCommentResponse],
    summary="Get ticket comments",
    responses={
        404: {"description": "Ticket not found"},
        403: {"description": "Not authorized to view this ticket"},
    },
)
async def get_ticket_comments(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all comments for a ticket.

    Returns:
        list[TicketCommentResponse]: A list of comments for the ticket.

    Raises:
        HTTPException 404: If the ticket does not exist.
        HTTPException 403: If the user is not authorized to view the ticket.
    """
    ticket = await read_ticket_by_id(db, id)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    if not can_access(current_user, ticket):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this ticket",
        )
        # TODO: trigger async AI summarization -> ticket.information
    return await read_ticket_comments(db, id)


@ticket_router.patch(
    "/{id}/summarize",
    response_model=TicketDetailResponse,
    summary="Generate AI summary",
    responses={
        404: {"description": "Ticket not found"},
        403: {"description": "Not authorized to summarize this ticket"},
        409: {"description": "Summary already exists"},
    },
)
async def summarize_ticket_route(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Generate an AI summary for a ticket. Admin only.

    Returns:
        TicketDetailResponse: The updated ticket with ai_summary populated.

    Raises:
        HTTPException 404: If the ticket does not exist.
        HTTPException 403: If the user is not an admin.
        HTTPException 409: If the ticket already has a summary.
    """

    ticket = await read_ticket_by_id(db, id)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found"
        )

    if ticket.ai_summary:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Summary already exists for this ticket",
        )

    updated_ticket = await generate_ticket_summary(db, ticket)
    return updated_ticket

