# app/models/hr_request.py
import enum
import uuid
from datetime import date

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.ticket import Ticket, TicketType


class RequestType(str, enum.Enum):
    LEAVE_REQUEST = "LEAVE_REQUEST"
    DOCUMENT_REQUEST = "DOCUMENT_REQUEST"


class DocumentType(str, enum.Enum):
    NOC = "NOC"
    SALARY_CERTIFICATE = "SALARY_CERTIFICATE"


class HrRequest(Ticket):
    __tablename__ = "hr_requests"

    id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tickets.id"), primary_key=True)
    request_type: Mapped[RequestType] = mapped_column(
        SAEnum(RequestType, name="request_type"), nullable=False
    )
    document_type: Mapped[DocumentType | None] = mapped_column(
        SAEnum(DocumentType, name="document_type"), nullable=True
    )
    from_date: Mapped[date | None] = mapped_column(nullable=True)
    to_date: Mapped[date | None] = mapped_column(nullable=True)

    __mapper_args__ = {"polymorphic_identity": TicketType.HR_REQUEST}

    def __repr__(self) -> str:
        return (
            f"HrRequest("
            f"id={self.id!r}, "
            f"request_type={self.request_type!r}, "
            f"document_type={self.document_type!r}"
            f")"
        )
