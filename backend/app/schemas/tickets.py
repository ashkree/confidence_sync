import datetime
import uuid
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, TypeAdapter

from app.models import HrRequest, ItTicket, TicketComment
from app.models.hr_request import DocumentType, RequestType
from app.models.it_ticket import ITRequestType
from app.models.ticket import TicketPriority, TicketStatus, TicketType
from app.schemas.date_types import FormattedDate, FormattedDateTime

# ---------------------------------------------------------------------------
# TICKET CREATION SCHEMAS
# ---------------------------------------------------------------------------


# Status and Priority use their server-side defaults on creation.
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


# ---------------------------------------------------------------------------
# SUBTYPE FIELD MIXINS
#
# Each subtype's own columns are declared exactly once here and mixed into the
# employee/admin variants below. The `type` discriminator lives ONLY on these
# mixins -- never on the shared bases -- so that multiple inheritance can't
# clobber the Literal with a plain TicketType and break the discriminated union.
# ---------------------------------------------------------------------------


class ItListFields(BaseModel):
    """IT columns present in list views."""

    type: Literal[TicketType.IT_TICKET] = TicketType.IT_TICKET
    request_type: ITRequestType


class ItDetailFields(ItListFields):
    """IT columns present in detail views."""

    device_type: str | None = None
    fault_code: str | None = None
    software_name: str | None = None


class HrListFields(BaseModel):
    """HR columns present in list views."""

    type: Literal[TicketType.HR_REQUEST] = TicketType.HR_REQUEST
    request_type: RequestType
    document_type: DocumentType | None = None


class HrDetailFields(HrListFields):
    """HR columns present in detail views."""

    from_date: FormattedDate | None = None
    to_date: FormattedDate | None = None


# ---------------------------------------------------------------------------
# SHARED BASES
#
# Employee bases carry only what a requester may see. Admin bases extend them
# with internal triage signals. Adding a sensitive column to an admin base is
# therefore hidden from employees by default.
# ---------------------------------------------------------------------------


class TicketListEmployeeBase(BaseModel):
    """Common list fields visible to the ticket's poster."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: TicketStatus
    subject: str
    # NOTE: raw datetime here while detail views use FormattedDateTime.
    # Pre-existing inconsistency; the frontend formats this one client-side.
    updated_at: datetime.datetime


class TicketListAdminBase(TicketListEmployeeBase):
    """Common list fields visible to department admins."""

    poster_id: uuid.UUID
    assignee_id: uuid.UUID | None
    poster_name: str
    assignee_name: str | None
    priority: TicketPriority


class TicketDetailEmployeeBase(BaseModel):
    """Common detail fields visible to the ticket's poster.

    Excludes internal triage signals: priority, poster, assignee, information.
    `ai_summary` IS included -- it is regenerated with the comment thread, so
    it carries admin instructions the employee is meant to read.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: TicketStatus
    subject: str
    description: str
    ai_summary: str | None = None
    created_at: FormattedDateTime
    updated_at: FormattedDateTime


class TicketDetailAdminBase(TicketDetailEmployeeBase):
    """Common detail fields visible to department admins."""

    poster_id: uuid.UUID
    assignee_id: uuid.UUID | None
    poster_name: str
    assignee_name: str | None
    priority: TicketPriority
    information: str | None = None


# ---------------------------------------------------------------------------
# LIST RESPONSES
# ---------------------------------------------------------------------------


class ItTicketListEmployeeResponse(TicketListEmployeeBase, ItListFields):
    """IT ticket summary as shown to the poster."""


class HrRequestListEmployeeResponse(TicketListEmployeeBase, HrListFields):
    """HR request summary as shown to the poster."""


class ItTicketListResponse(TicketListAdminBase, ItListFields):
    """IT ticket summary as shown to admins."""


class HrRequestListResponse(TicketListAdminBase, HrListFields):
    """HR request summary as shown to admins."""


TicketListResponse = Annotated[
    ItTicketListResponse | HrRequestListResponse,
    Field(discriminator="type"),
]

TicketListEmployeeResponse = Annotated[
    ItTicketListEmployeeResponse | HrRequestListEmployeeResponse,
    Field(discriminator="type"),
]


# ---------------------------------------------------------------------------
# DETAIL RESPONSES
# ---------------------------------------------------------------------------


class ItTicketDetailEmployeeResponse(TicketDetailEmployeeBase, ItDetailFields):
    """Full IT ticket as shown to the poster."""


class HrRequestDetailEmployeeResponse(TicketDetailEmployeeBase, HrDetailFields):
    """Full HR request as shown to the poster."""


class ItTicketDetailResponse(TicketDetailAdminBase, ItDetailFields):
    """Full IT ticket as shown to admins."""


class HrRequestDetailResponse(TicketDetailAdminBase, HrDetailFields):
    """Full HR request as shown to admins."""


TicketDetailResponse = Annotated[
    ItTicketDetailResponse | HrRequestDetailResponse,
    Field(discriminator="type"),
]

TicketDetailEmployeeResponse = Annotated[
    ItTicketDetailEmployeeResponse | HrRequestDetailEmployeeResponse,
    Field(discriminator="type"),
]


# ---------------------------------------------------------------------------
# TYPE ADAPTERS
#
# The response types above are Annotated unions, not BaseModel subclasses, so
# they have no .model_validate(). Use these adapters to serialize an ORM object
# by role. Built once at import -- constructing a TypeAdapter per request is
# expensive.
# ---------------------------------------------------------------------------

TicketDetailAdapter: TypeAdapter = TypeAdapter(TicketDetailResponse)
TicketDetailEmployeeAdapter: TypeAdapter = TypeAdapter(TicketDetailEmployeeResponse)
TicketListAdapter: TypeAdapter = TypeAdapter(list[TicketListResponse])
TicketListEmployeeAdapter: TypeAdapter = TypeAdapter(list[TicketListEmployeeResponse])


# ---------------------------------------------------------------------------
# PATCH & COMMENT SCHEMAS
# ---------------------------------------------------------------------------


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
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    ticket_id: uuid.UUID
    author_name: str
    body: str
    created_at: FormattedDateTime


class TicketEnrichmentResponse(BaseModel):
    ready: bool
    summary: str | None = None
    next_steps: str | None = None
