import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.ticket import Ticket
from app.models.user import User


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    # COLUMNS
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tickets.id"), nullable=False
    )
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # RELATIONSHIPS
    ticket: Mapped["Ticket"] = relationship()
    author: Mapped["User"] = relationship()

    # PROPERTIES
    @property
    def author_name(self) -> str:
        return self.author.name
