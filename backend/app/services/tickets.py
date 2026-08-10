import uuid
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, with_polymorphic

from app.models import HrRequest, ItTicket, Ticket, User
from app.models.ticket import TicketPriority, TicketStatus, TicketType
from app.models.ticket_comment import TicketComment
from app.models.user import UserDepartment, UserRole
from app.schemas.tickets import TicketCommentCreate, TicketCreate

# Ticket query that eagerly joins in HrRequest and ItTicket columns,
# so subclass-specific attributes are available without an extra
# lazy-load query, regardless of which subtype each row actually is.
TicketWithSubtypes = with_polymorphic(Ticket, [HrRequest, ItTicket])


def can_access(user: User, ticket: Ticket) -> bool:

    if is_admin(user.role) and is_in_scope(user.department, ticket.type):
        return True

    if is_owner(ticket.poster_id, user.id):
        return True

    return False


def is_owner(ticket_poster_id: uuid.UUID, user_id: uuid.UUID):
    return ticket_poster_id == user_id


def is_admin(user_role: UserRole) -> bool:
    return user_role == UserRole.ADMIN


def is_in_scope(
    user_department: UserDepartment | None, ticket_type: TicketType
) -> bool:

    if user_department == None:
        return False

    if ticket_type == TicketType.IT_TICKET and user_department != UserDepartment.IT:
        return False

    if ticket_type == TicketType.HR_REQUEST and user_department != UserDepartment.HR:
        return False

    return True


def _ticket_query():
    """
    Uses a with_polymorphic call for Ticket to get subtype data and uses
    selectInLoad to eagerly load relationships.
    """

    return select(TicketWithSubtypes).options(
        selectinload(TicketWithSubtypes.poster),
        selectinload(TicketWithSubtypes.assignee),
    )


async def read_tickets_by_poster(
    db: AsyncSession, current_user: User
) -> list[Ticket] | None:
    """
    Queries the database for the current user's tickets.
    Returns a plain list of concrete HrRequest / ItTicket instances so that
    all subclass columns are eagerly available for Pydantic serialization.
    """

    result = await db.scalars(
        _ticket_query().where(TicketWithSubtypes.poster_id == current_user.id)
    )

    return list(result.all())


async def read_tickets_by_department(
    db: AsyncSession, current_user: User
) -> list[Ticket]:
    """
    A query scoped to the current user's department and access level.
    Returns a plain list of concrete HrRequest / ItTicket instances so that
    all subclass columns are eagerly available for Pydantic serialization.
    """
    if current_user.department == UserDepartment.IT:
        result = await db.scalars(
            _ticket_query().where(TicketWithSubtypes.type == TicketType.IT_TICKET)
        )
        return list(result.all())
    if current_user.department == UserDepartment.HR:
        result = await db.scalars(
            _ticket_query().where(TicketWithSubtypes.type == TicketType.HR_REQUEST)
        )
        return list(result.all())
    raise PermissionError(f"No ticket access for department: {current_user.department}")


async def create_ticket(
    db: AsyncSession, current_user: User, ticket_data: TicketCreate
):
    """
    Create a new ticket based on what what the actual type of TicketCreate is
    """
    ticket = ticket_data.to_orm(poster_id=current_user.id)
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket


async def read_ticket_by_id(db: AsyncSession, target_id: uuid.UUID) -> Ticket | None:

    result = await db.scalar(_ticket_query().where(Ticket.id == target_id))
    return result


async def update_ticket_status(
    db: AsyncSession,
    ticket: Ticket,
    new_status: TicketStatus,
) -> Ticket:

    ticket.status = new_status

    await db.commit()
    await db.refresh(ticket, attribute_names=["updated_at"])
    return ticket


async def update_ticket_priority(
    db: AsyncSession,
    ticket: Ticket,
    new_priority: TicketPriority,
) -> Ticket:

    ticket.priority = new_priority

    await db.commit()
    await db.refresh(ticket, attribute_names=["updated_at"])
    return ticket


async def create_ticket_comment(
    db: AsyncSession,
    comment_data: TicketCommentCreate,
    author_id: uuid.UUID,
) -> TicketComment:

    comment = comment_data.to_orm(author_id)

    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment


async def read_ticket_comments(
    db: AsyncSession, ticket_id: uuid.UUID
) -> Sequence[TicketComment]:
    result = await db.scalars(
        select(TicketComment)
        .options(selectinload(TicketComment.author))
        .where(TicketComment.ticket_id == ticket_id)
        .order_by(TicketComment.created_at)
    )
    return result.all()
