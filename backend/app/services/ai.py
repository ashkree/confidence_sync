import uuid
from typing import Literal

from app.models import HrRequest, ItTicket, Ticket, TicketComment
from app.models.hr_request import RequestType
from app.models.it_ticket import ITRequestType


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
