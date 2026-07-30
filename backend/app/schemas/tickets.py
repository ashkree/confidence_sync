# app/schemas/tickets.py
import uuid
from datetime import date, datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.hr_request import DocumentType, RequestType
from app.models.it_ticket import ITRequestType
from app.models.ticket import TicketPriority, TicketStatus, TicketType


class TicketBase(BaseModel):
    """Shared fields common to every ticket, regardless of type."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    poster_name: str
    assignee_name: str | None
    status: TicketStatus
    priority: TicketPriority
    subject: str
    description: str
    information: str | None
    created_at: datetime
    updated_at: datetime


class HrRequest(TicketBase):
    type: Literal[TicketType.HR_REQUEST]
    request_type: RequestType
    document_type: DocumentType | None
    from_date: date | None
    to_date: date | None


class ItTicket(TicketBase):
    type: Literal[TicketType.IT_TICKET]
    request_type: ITRequestType
    device_type: str | None
    fault_code: str | None
    software_name: str | None


Ticket = Annotated[HrRequest | ItTicket, Field(discriminator="type")]


class TicketStatusPatch(BaseModel):
    """Body for PATCH /tickets/{id}/status. id comes from the URL, not the body."""

    status: TicketStatus


class TicketComment(BaseModel):
    """Response shape for a single comment."""

    model_config = ConfigDict(from_attributes=True)

    author_name: str
    body: str
    created_at: datetime


class TicketCommentCreate(BaseModel):
    """Body for POST /tickets/{id}/comments."""

    body: str
