from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Ticket, User
from app.models.ticket import TicketType
from app.models.user import UserDepartment


def own_tickets_query(db: Session, current_user: User):
    """
    Queries the database for the current user's tickets.
    """

    return db.scalars(select(Ticket).where(Ticket.id == current_user.id))


def department_tickets_query(db: Session, current_user: User):
    """
    A query scoped to the current user's department and access level.
    """

    if current_user.department == UserDepartment.IT:
        return db.scalars(select(Ticket).where(Ticket.type == TicketType.IT_TICKET))

    if current_user.role == UserDepartment.HR:
        return db.scalars(select(Ticket).where(Ticket.type == TicketType.HR_REQUEST))
