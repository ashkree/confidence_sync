import datetime
import uuid
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models import HrRequest, ItTicket, TicketComment

# TICKET CREATION SCHEMAS


# Status and Priority will use the default value on creation
class TicketCreateBase(BaseModel):
    """Base schema for creating a new ticket, containing common fields."""

    type: Literal["hr_request", "it_ticket"]
    subject: str
    description: str


class ItTicketCreate(TicketCreateBase):
    """Schema for creating a new IT-related ticket."""

    type: Literal["it_ticket"] = "it_ticket"
    request_type: Literal["hardware_issue", "software_issue"]
    device_type: str | None = None
    fault_code: str | None = None
    software_name: str | None = None

    def to_orm(self, poster_id: uuid.UUID) -> ItTicket:
        return ItTicket(**self.model_dump(exclude={"type"}), poster_id=poster_id)


class HrRequestCreate(TicketCreateBase):
    """Schema for creating a new HR-related request."""

    type: Literal["hr_request"] = "hr_request"
    request_type: Literal["leave_request", "document_request"]
    document_type: Literal["noc", "salary_certificate"] | None = None

    def to_orm(self, poster_id: uuid.UUID) -> HrRequest:
        return HrRequest(**self.model_dump(exclude={"type"}), poster_id=poster_id)


TicketCreate = Annotated[ItTicketCreate | HrRequestCreate, Field(discriminator="type")]


# SHORT TICKET RESPONSES
# used with list views
class TicketListResponseBase(BaseModel):
    """Base schema for ticket summaries returned in list views."""

    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    poster_id: uuid.UUID
    assignee_id: uuid.UUID | None
    type: Literal["hr_request", "it_ticket"]
    status: Literal["open", "pending", "resolved", "closed"]
    priority: Literal["high", "medium", "low"]
    subject: str


class HrRequestListResponse(TicketListResponseBase):
    """Schema for HR request summaries returned in list views."""

    type: Literal["hr_request"] = "hr_request"
    request_type: Literal["leave_request", "document_request"]
    document_type: Literal["noc", "salary_certificate"] | None


class ItTicketListResponse(TicketListResponseBase):
    """Schema for IT ticket summaries returned in list views."""

    type: Literal["it_ticket"] = "it_ticket"
    request_type: Literal["hardware_issue", "software_issue"]


TicketListReponse = Annotated[
    HrRequestListResponse | ItTicketListResponse, Field(discriminator="type")
]


# DETAILED TICKET RESPONSE
# used with detail pages
class TicketDetailResponseBase(BaseModel):
    """
    Full Ticket Response for detail pages.
    Contains comprehensive information about a ticket including AI summaries and timestamps.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    poster_id: uuid.UUID
    assignee_id: uuid.UUID | None
    type: Literal["hr_request", "it_ticket"]
    status: Literal["open", "pending", "resolved", "closed"]
    priority: Literal["high", "medium", "low"]
    subject: str
    description: str
    information: str | None = None
    ai_summary: str | None = None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class ItTicketDetailResponse(TicketDetailResponseBase):
    """Schema for the detailed view of an IT ticket, including specific device and software information."""

    type: Literal["it_ticket"] = "it_ticket"
    request_type: Literal["hardware_issue", "software_issue"]
    device_type: str | None = None
    fault_code: str | None = None
    software_name: str | None = None


class HrRequestDetailResponse(TicketDetailResponseBase):
    """Schema for the detailed view of an HR request, including specific document and date information."""

    type: Literal["hr_request"] = "hr_request"
    request_type: Literal["leave_request", "document_request"]
    document_type: Literal["noc", "salary_certificate"] | None = None
    from_date: datetime.datetime | None = None
    to_date: datetime.datetime | None = None


TicketDetailResponse = Annotated[
    ItTicketDetailResponse | HrRequestDetailResponse,
    Field(discriminator="type"),
]


class TicketStatusPatch(BaseModel):
    status: Literal["open", "pending", "resolved", "closed"]


class TicketPriorityPatch(BaseModel):
    priority: Literal["high", "medium", "low"]


class TicketCommentCreate(BaseModel):
    body: str

    def to_orm(self, ticket_id: uuid.UUID, author_id: uuid.UUID) -> TicketComment:
        return TicketComment(
            **self.model_dump(), ticket_id=ticket_id, author_id=author_id
        )


class TicketCommentResponse(BaseModel):
    id: uuid.UUID
    ticket_id: uuid.UUID
    author_id: uuid.UUID
    body: str
    created_at: datetime.datetime
