# app/models/it_ticket.py
import enum
import uuid

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.ticket import Ticket, TicketType


class ITRequestType(str, enum.Enum):
    HARDWARE_ISSUE = "HARDWARE_ISSUE"
    SOFTWARE_ISSUE = "SOFTWARE_ISSUE"


class ItTicket(Ticket):
    __tablename__ = "it_tickets"

    id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tickets.id"), primary_key=True)
    request_type: Mapped[ITRequestType] = mapped_column(
        SAEnum(ITRequestType, name="it_request_type"), nullable=False
    )
    device_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    fault_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    software_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    __mapper_args__ = {"polymorphic_identity": TicketType.IT_TICKET}

    def __repr__(self) -> str:
        return (
            f"ITTicket("
            f"id={self.id!r}, "
            f"request_type={self.request_type!r}, "
            f"device_type={self.device_type!r}, "
            f"fault_code={self.fault_code!r}, "
            f"software_name={self.software_name!r}"
            f")"
        )
