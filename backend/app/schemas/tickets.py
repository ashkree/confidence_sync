import datetime
import uuid
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models import HrRequest, ItTicket, TicketComment
from app.models.hr_request import DocumentType, RequestType
from app.models.it_ticket import ITRequestType
from app.models.ticket import TicketPriority, TicketStatus, TicketType
from app.schemas.date_types import FormattedDate, FormattedDateTime

# TICKET CREATION SCHEMAS


# Status and Priority will use the default value on creation
class TicketCreateBase(BaseModel):
    """Base schema for creating a new ticket, containing common fields."""

    type: TicketType
    subject: str
    description: str


class ItTicketCreate(TicketCreateBase):
    """Schema for creating a new IT-related ticket."""

    type: Literal[TicketType.IT_TICKET] = TicketType.IT_TICKET
    request_type: ITRequestType
    device_type: str | None = None
    fault_code: str | None = None
    software_name: str | None = None

    def to_orm(self, poster_id: uuid.UUID) -> ItTicket:
        return ItTicket(**self.model_dump(exclude={"type"}), poster_id=poster_id)


class HrRequestCreate(TicketCreateBase):
    """Schema for creating a new HR-related request."""

    type: Literal[TicketType.HR_REQUEST] = TicketType.HR_REQUEST
    request_type: RequestType
    document_type: DocumentType | None = None
    from_date: FormattedDate | None = None
    to_date: FormattedDate | None = None

    def to_orm(self, poster_id: uuid.UUID) -> HrRequest:
        return HrRequest(**self.model_dump(exclude={"type"}), poster_id=poster_id)


TicketCreate = Annotated[ItTicketCreate | HrRequestCreate, Field(discriminator="type")]


# SHORT TICKET RESPONSES
# used with list views
class TicketListEmployeeResponseBase(BaseModel):
    """Base schema for ticket summaries returned in employee list views."""

    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    type: TicketType
    status: TicketStatus
    subject: str
    updated_at: datetime.datetime


class TicketListResponseBase(TicketListEmployeeResponseBase):
    """Base schema for ticket summaries returned in admin list views."""

    poster_id: uuid.UUID
    assignee_id: uuid.UUID | None
    poster_name: str
    assignee_name: str | None
    priority: TicketPriority


class HrRequestListEmployeeResponse(TicketListEmployeeResponseBase):
    """Schema for HR request summaries in employee list views."""

    type: Literal[TicketType.HR_REQUEST] = TicketType.HR_REQUEST
    request_type: RequestType
    document_type: DocumentType | None = None


class ItTicketListEmployeeResponse(TicketListEmployeeResponseBase):
    """Schema for IT ticket summaries in employee list views."""

    type: Literal[TicketType.IT_TICKET] = TicketType.IT_TICKET
    request_type: ITRequestType


class HrRequestListResponse(TicketListResponseBase):
    """Schema for HR request summaries returned in admin list views."""

    type: Literal[TicketType.HR_REQUEST] = TicketType.HR_REQUEST
    request_type: RequestType
    document_type: DocumentType | None = None


class ItTicketListResponse(TicketListResponseBase):
    """Schema for IT ticket summaries returned in admin list views."""

    type: Literal[TicketType.IT_TICKET] = TicketType.IT_TICKET
    request_type: ITRequestType


TicketListReponse = Annotated[
    HrRequestListResponse | ItTicketListResponse, Field(discriminator="type")
]

TicketListResponse = TicketListReponse

TicketListEmployeeResponse = Annotated[
    HrRequestListEmployeeResponse | ItTicketListEmployeeResponse,
    Field(discriminator="type"),
]


# DETAILED TICKET RESPONSE
# used with detail pages
class TicketDetailEmployeeBase(BaseModel):
    """
    Employee Ticket Response for detail pages.
    Excludes internal triage signals (priority, poster, assignee, information).
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: TicketType
    status: TicketStatus
    subject: str
    description: str
    ai_summary: str | None = None
    created_at: FormattedDateTime
    updated_at: FormattedDateTime


class TicketDetailAdminBase(TicketDetailEmployeeBase):
    """
    Admin Ticket Response for detail pages.
    Includes internal triage signals (priority, poster, assignee, information).
    """

    poster_id: uuid.UUID
    assignee_id: uuid.UUID | None
    poster_name: str
    assignee_name: str | None
    priority: TicketPriority
    information: str | None = None


# Alias for backward compatibility if any service imports TicketDetailResponseBase
TicketDetailResponseBase = TicketDetailAdminBase


class ItTicketDetailEmployeeResponse(TicketDetailEmployeeBase):
    """Schema for employee view of an IT ticket."""

    type: Literal[TicketType.IT_TICKET] = TicketType.IT_TICKET
    request_type: ITRequestType
    device_type: str | None = None
    fault_code: str | None = None
    software_name: str | None = None


class ItTicketDetailResponse(TicketDetailAdminBase):
    """Schema for the detailed admin view of an IT ticket, including specific device and software information."""

    type: Literal[TicketType.IT_TICKET] = TicketType.IT_TICKET
    request_type: ITRequestType
    device_type: str | None = None
    fault_code: str | None = None
    software_name: str | None = None


class HrRequestDetailEmployeeResponse(TicketDetailEmployeeBase):
    """Schema for employee view of an HR request."""

    type: Literal[TicketType.HR_REQUEST] = TicketType.HR_REQUEST
    request_type: RequestType
    document_type: DocumentType | None = None
    from_date: FormattedDate | None = None
    to_date: FormattedDate | None = None


class HrRequestDetailResponse(TicketDetailAdminBase):
    """Schema for the detailed admin view of an HR request, including specific document and date information."""

    type: Literal[TicketType.HR_REQUEST] = TicketType.HR_REQUEST
    request_type: RequestType
    document_type: DocumentType | None = None
    from_date: FormattedDate | None = None
    to_date: FormattedDate | None = None


TicketDetailResponse = Annotated[
    ItTicketDetailResponse | HrRequestDetailResponse,
    Field(discriminator="type"),
]

TicketDetailEmployeeResponse = Annotated[
    ItTicketDetailEmployeeResponse | HrRequestDetailEmployeeResponse,
    Field(discriminator="type"),
]


class TicketStatusPatch(BaseModel):
    status: TicketStatus


class TicketPriorityPatch(BaseModel):
    priority: TicketPriority


class TicketAssigneePatch(BaseModel):
    assignee_id: uuid.UUID | None


class TicketCommentCreate(BaseModel):
    body: str

    def to_orm(self, ticket_id: uuid.UUID, author_id: uuid.UUID) -> TicketComment:
        return TicketComment(
            **self.model_dump(), ticket_id=ticket_id, author_id=author_id
        )


class TicketCommentResponse(BaseModel):
    id: uuid.UUID
    ticket_id: uuid.UUID
    author_name: str
    body: str
    created_at: FormattedDateTime
