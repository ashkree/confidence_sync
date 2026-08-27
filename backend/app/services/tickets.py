import uuid

from app.models import Ticket, User
from app.models.ticket import TicketPriority, TicketStatus, TicketType
from app.models.ticket_comment import TicketComment
from app.models.user import UserDepartment
from app.repository.document import DocumentRepo
from app.repository.ticket import TicketRepo
from app.schemas.tickets import TicketCommentCreate, TicketCreate
from app.services.ai import generate_ticket_information, generate_ticket_summary


async def read_tickets_by_department(
    ticket_repo: TicketRepo, current_user: User
) -> list[Ticket]:
    """
    A query scoped to the current user's department and access level.
    Returns a plain list of concrete HrRequest / ItTicket instances so that
    all subclass columns are eagerly available for Pydantic serialization.
    """

    if current_user.department == UserDepartment.IT:
        return await ticket_repo.read_by_type(TicketType.IT_TICKET)
    if current_user.department == UserDepartment.HR:
        return await ticket_repo.read_by_type(TicketType.HR_REQUEST)
    return []


async def create_ticket(
    ticket_repo: TicketRepo,
    document_repo: DocumentRepo,
    current_user: User,
    ticket_data: TicketCreate,
):
    """
    Create a new ticket based on what what the actual type of TicketCreate is
    """

    # create the ticket model
    ticket = ticket_data.to_orm(poster_id=current_user.id)

    # generate summary
    ticket.ai_summary = await generate_ticket_summary(ticket)

    # generate additional information
    ticket.information = await generate_ticket_information(document_repo, ticket)

    return await ticket_repo.create(ticket)


async def update_ticket_status(
    ticket_repo: TicketRepo,
    ticket: Ticket,
    new_status: TicketStatus,
) -> Ticket:
    ticket.status = new_status
    return await ticket_repo.save(ticket, refresh=["updated_at"])


async def update_ticket_priority(
    ticket_repo: TicketRepo,
    ticket: Ticket,
    new_priority: TicketPriority,
) -> Ticket:

    ticket.priority = new_priority

    return await ticket_repo.save(ticket, refresh=["updated_at"])


async def update_ticket_assignee(
    ticket_repo: TicketRepo,
    ticket: Ticket,
    new_assignee_id: uuid.UUID | None,
) -> Ticket:

    ticket.assignee_id = new_assignee_id

    return await ticket_repo.save(ticket, refresh=["assignee", "updated_at"])


async def create_ticket_comment(
    ticket_repo: TicketRepo,
    comment_data: TicketCommentCreate,
    ticket: Ticket,
    author_id: uuid.UUID,
) -> TicketComment:
    ticket_id = ticket.id
    ticket = await ticket_repo.read_by_id(ticket_id)

    comment = comment_data.to_orm(ticket_id, author_id)
    added_comment = await ticket_repo.add_comment(comment)

    comments = await ticket_repo.read_comments(ticket_id)
    ticket.ai_summary = await generate_ticket_summary(ticket, comments)
    await ticket_repo.save(ticket)

    return await ticket_repo.refresh_comment(added_comment)


async def summarize_ticket(
    ticket_repo: TicketRepo,
    ticket: Ticket,
) -> Ticket:
    ticket_id = ticket.id
    ticket = await ticket_repo.read_by_id(ticket_id)
    comments = await ticket_repo.read_comments(ticket_id)
    ticket.ai_summary = await generate_ticket_summary(ticket, comments)
    return await ticket_repo.save(ticket, refresh=["poster", "assignee", "updated_at"])
