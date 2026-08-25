import uuid
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, with_polymorphic

from app.models import DocumentChunk, HrRequest, ItTicket, Ticket, User
from app.models.ticket import TicketPriority, TicketStatus, TicketType
from app.models.ticket_comment import TicketComment
from app.models.user import UserDepartment
from app.repository.bedrock import bedrockRepo
from app.schemas.tickets import TicketCommentCreate, TicketCreate
from app.services.users import is_admin

# Ticket query that eagerly joins in HrRequest and ItTicket columns,
# so subclass-specific attributes are available without an extra
# lazy-load query, regardless of which subtype each row actually is.
TicketWithSubtypes = with_polymorphic(Ticket, [HrRequest, ItTicket])

TICKET_TRIAGE_SYSTEM_PROMPT = """\
You are an assistant that helps IT and HR administrators triage support tickets. You will be given a ticket (subject and description) along with a set of retrieved reference passages from internal documentation (IT manuals or HR policies). Your job is to help the admin understand what's likely going on and what to do next — you are not resolving the ticket yourself, you are briefing the human who will.

You will receive:
- The ticket subject and description
- Retrieved context passages, each with a source document name and page number

Respond in two parts, in plain text, in this exact order:

1. PREAMBLE
A short paragraph (2-4 sentences) summarizing what the ticket is likely about, grounded strictly in the retrieved context. State plainly if the retrieved context only partially covers the issue, or doesn't cover it at all — do not paper over gaps.

2. STEPS
A numbered list of concrete, actionable steps the admin should take or suggest to the ticket poster. Each step should be one or two sentences, specific enough to act on immediately (not vague advice like "investigate the issue further"). Order steps the way an admin would actually work through them — quick checks first, escalation or deeper fixes later.

Rules:
- Base every claim and every step on the retrieved context. Do not invent policies, procedures, or technical details that aren't supported by what was retrieved.
- If a step relies on a specific fact from a source (a setting, a threshold, a policy detail), mention where it comes from in plain language, e.g. "per the VPN setup guide" — do not fabricate a citation format, just refer to it naturally.
- If the retrieved context is insufficient to confidently produce steps, say so directly in the preamble and give only the steps that are actually supported — do not pad the list with generic troubleshooting advice to reach a certain number of steps.
- Do not include a title, headers, markdown formatting, or any text outside the preamble and numbered steps.
- Keep the tone practical and direct, as if briefing a colleague — not customer-facing, not overly formal.
- Never suggest actions that could compromise security, bypass access controls, or violate a documented policy, even if it would resolve the ticket faster.
"""


def can_access(user: User, ticket: Ticket) -> bool:

    if is_admin(user.role) and is_in_scope(user.department, ticket.type):
        return True

    if is_owner(ticket.poster_id, user.id):
        return True

    return False


def is_owner(ticket_poster_id: uuid.UUID, user_id: uuid.UUID):
    return ticket_poster_id == user_id


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

    # Create the ticket on the database
    ticket = ticket_data.to_orm(poster_id=current_user.id)

    # Summarize ticket

    # Generate ticket information from documents

    messages = [f"Subject: {ticket.subject}", f"Description: {ticket.description}"]

    query_vector = bedrockRepo.embed_text("\n".join(messages))

    chunks = await db.scalars(
        select(DocumentChunk.content)
        .order_by(DocumentChunk.embedding.cosine_distance(query_vector))
        .limit(3)
    )

    context_chunks = list(chunks.all())
    context_text = (
        "\n\n".join(context_chunks) if context_chunks else "No relevant context found."
    )

    user_message = (
        f"Ticket subject: {ticket.subject}\n"
        f"Ticket description: {ticket.description}\n\n"
        f"Retrieved context:\n{context_text}"
    )

    response = bedrockRepo.chat(
        messages=[{"role": "user", "content": f"{user_message}"}],
        system_prompt=TICKET_TRIAGE_SYSTEM_PROMPT,
    )

    ticket.information = response

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


async def update_ticket_assignee(
    db: AsyncSession,
    ticket: Ticket,
    new_assignee_id: uuid.UUID | None,
) -> Ticket:

    ticket.assignee_id = new_assignee_id

    await db.commit()
    await db.refresh(ticket, attribute_names=["assignee", "updated_at"])
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
