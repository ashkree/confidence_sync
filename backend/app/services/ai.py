import asyncio
import uuid
from typing import Literal

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import HrRequest, ItTicket, Ticket, TicketComment
from app.models.hr_request import RequestType
from app.models.it_ticket import ITRequestType
from app.repository.bedrock import bedrockRepo
from app.services.tickets import read_ticket_comments


def _format_tickets(ticket: Ticket) -> str:

    sub = ticket.subject
    desc = ticket.description
    summary = ticket.ai_summary if ticket.ai_summary else ""

    base = [f"Subject: {sub}", f"Description: {desc}"]

    if summary:
        base.append(f"Summary: {summary}")

    if isinstance(ticket, ItTicket):
        base.append(f"Request Type: {ticket.request_type.value}")

        if ticket.request_type == ITRequestType.HARDWARE_ISSUE:
            base.append(f"Device Type: {ticket.device_type}")
            base.append(f"Fault Code: {ticket.fault_code}")
        else:
            base.append(f"Software Name: {ticket.software_name}")

    if isinstance(ticket, HrRequest):
        base.append(f"Request Type: {ticket.request_type.value}")

        if ticket.request_type == RequestType.DOCUMENT_REQUEST:
            base.append(f"Document Type: {ticket.document_type}")
        else:
            base.append(f"From Date: {ticket.from_date}")
            base.append(f"To Date: {ticket.to_date}")

    return "\n".join(base)


def _format_ticket_comments(
    poster_id: uuid.UUID, assignee_id: uuid.UUID | None, comments: list[TicketComment]
):

    thread = []

    for comment in comments:
        if comment.author_id == poster_id:
            role = "Reporter"
        elif comment.author_id == assignee_id:
            role = "Assignee"
        else:
            role = "Other"

        thread.append(f"{role}: {comment.body}")

    return "\n".join(thread)


def _format_message(role: Literal["user", "assistant"], content: str) -> dict:
    return {
        "role": role,
        "content": [{"text": content}],
    }


def summarize_ticket(ticket: Ticket, comments: list[TicketComment]):

    TICKET_SUMMARY_SYSTEM_PROMPT = """You are summarizing a support ticket and its comment thread for an internal admin dashboard. The summary will be read by staff who need to quickly understand the situation without reading the full thread.

    You will be given a ticket subject, description, and a thread of comments labeled by role: Reporter (the person who submitted the ticket), Assignee (the person handling it), or Other.

Write a summary that:
    - States the core issue or request in one sentence.
    - Notes the current status based on the most recent comments (e.g. resolved, awaiting a response, blocked, in progress).
    - Surfaces any specific actions taken or promised (e.g. "ordered a replacement part," "escalated to vendor," "scheduled a call").
    - Surfaces any concrete details mentioned that matter for follow-up — dates, error codes, device/model names, deadlines, or conditions someone is waiting on.
    - Attributes actions and statements to their role (Reporter vs Assignee) when it affects meaning — e.g. distinguish "Reporter says the issue persists" from "Assignee confirmed a fix."

Do not:
    - Invent details not present in the ticket or comments.
    - Include personal names, even if mentioned in the text.
    - Pad the summary with generic phrasing like "this ticket is about" or "in summary."
    - Exceed 4 sentences.

Output plain text only, no headers or bullet points."""

    # format ticket and comments
    baseTicket = _format_tickets(ticket)
    commentThread = _format_ticket_comments(
        ticket.poster_id, ticket.assignee_id, comments
    )

    # format messages and system prompt
    message = [_format_message("user", "\n".join([baseTicket, commentThread]))]

    # trigger ai summarization
    response = bedrockRepo.chat(message, system_prompt=TICKET_SUMMARY_SYSTEM_PROMPT)

    return response


async def generate_ticket_summary(db: AsyncSession, ticket: Ticket) -> Ticket:
    """
    Route-agnostic AI summary orchestrator.

    Fetches comments, generates a summary via Bedrock, persists it
    to the ticket's ai_summary column, and returns the updated ticket.

    Can be called from any route handler or service function:
      - ticket creation
      - comment creation
      - manual summarize endpoint
    """
    comments = await read_ticket_comments(db, ticket.id)
    summary = await asyncio.to_thread(summarize_ticket, ticket, list(comments))

    ticket.ai_summary = summary
    await db.commit()
    await db.refresh(ticket, attribute_names=["ai_summary", "updated_at"])

    return ticket
