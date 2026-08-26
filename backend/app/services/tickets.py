import uuid

from app.models import Ticket, User
from app.models.ticket import TicketPriority, TicketStatus, TicketType
from app.models.ticket_comment import TicketComment
from app.models.user import UserDepartment
from app.repository.ticket import TicketRepo
from app.schemas.tickets import TicketCommentCreate, TicketCreate

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
    ticket_repo: TicketRepo, current_user: User, ticket_data: TicketCreate
):
    """
    Create a new ticket based on what what the actual type of TicketCreate is
    """

    # create the ticket model
    ticket = ticket_data.to_orm(poster_id=current_user.id)

    # generate additional information
    # messages = [f"Subject: {ticket.subject}", f"Description: {ticket.description}"]
    #
    # query_vector = await get_bedrock_client().embed_text("\n".join(messages))
    #
    # chunks = await db.scalars(
    #     select(DocumentChunk.content)
    #     .order_by(DocumentChunk.embedding.cosine_distance(query_vector))
    #     .limit(3)
    # )
    #
    # context_chunks = list(chunks.all())
    # context_text = (
    #     "\n\n".join(context_chunks) if context_chunks else "No relevant context found."
    # )
    #
    # user_message = (
    #     f"Ticket subject: {ticket.subject}\n"
    #     f"Ticket description: {ticket.description}\n\n"
    #     f"Retrieved context:\n{context_text}"
    # )
    #
    # response = await get_bedrock_client().chat(
    #     messages=[{"role": "user", "content": f"{user_message}"}],
    #     system_prompt=TICKET_TRIAGE_SYSTEM_PROMPT,
    # )
    #
    # ticket.information = response

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
    ticket_id: uuid.UUID,
    author_id: uuid.UUID,
) -> TicketComment:

    comment = comment_data.to_orm(ticket_id, author_id)

    # also needs to trigger summarization (only summarization)

    return await ticket_repo.add_comment(comment)
