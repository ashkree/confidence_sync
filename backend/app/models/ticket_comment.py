import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models import Base


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tickets.id"), nullable=False
    )
    author_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    subject: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
