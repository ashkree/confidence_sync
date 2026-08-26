import uuid

from app.models import Ticket, User
from app.models.ticket import TicketType
from app.models.user import UserDepartment, UserRole


def can_access(user: User, ticket: Ticket) -> bool:
    if is_owner(ticket.poster_id, user.id):
        return True

    return user.role == UserRole.ADMIN and is_in_scope(user.department, ticket.type)


def is_owner(ticket_poster_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    return ticket_poster_id == user_id


def is_in_scope(
    user_department: UserDepartment | None, ticket_type: TicketType
) -> bool:

    if user_department is None:
        return False

    if ticket_type == TicketType.IT_TICKET and user_department != UserDepartment.IT:
        return False

    if ticket_type == TicketType.HR_REQUEST and user_department != UserDepartment.HR:
        return False

    return True
