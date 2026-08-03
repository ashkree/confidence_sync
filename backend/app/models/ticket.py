# app/models/ticket.py
import enum
import uuid
from datetime import datetime

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.user import User


class TicketType(str, enum.Enum):
    HR_REQUEST = "hr_request"
    IT_TICKET = "it_ticket"


class TicketStatus(str, enum.Enum):
    OPEN = "open"
    PENDING = "pending"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketPriority(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Ticket(Base):
    __tablename__ = "tickets"

    # COLUMNS
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    poster_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    assignee_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    type: Mapped[TicketType] = mapped_column(
        SAEnum(TicketType, name="ticket_type"), nullable=False
    )
    status: Mapped[TicketStatus] = mapped_column(
        SAEnum(TicketStatus, name="ticket_status"),
        default=TicketStatus.OPEN,
        nullable=False,
    )
    priority: Mapped[TicketPriority] = mapped_column(
        SAEnum(TicketPriority, name="ticket_priority"),
        default=TicketPriority.MEDIUM,
        nullable=False,
    )
    subject: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    information: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )

    # RELATIONSHIPS
    poster: Mapped["User"] = relationship(foreign_keys=[poster_id])
    assignee: Mapped["User | None"] = relationship(foreign_keys=[assignee_id])

    # PROPERTIES
    @property
    def poster_name(self) -> str:
        return self.poster.name

    @property
    def assignee_name(self) -> str | None:
        return self.assignee.name if self.assignee else None

    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": None,
    }

    def __repr__(self) -> str:
        return (
            f"Ticket("
            f"id={self.id!r}, "
            f"type={self.type!r}, "
            f"status={self.status!r}, "
            f"subject={self.subject!r}"
            f")"
        )
