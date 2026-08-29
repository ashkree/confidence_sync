import uuid
from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.schemas.chat import ChatMessage


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )
    ttl: Mapped[datetime] = mapped_column(
        server_default=func.now() + timedelta(hours=24),
    )

    messages: Mapped[list[ChatMessage]] = relationship(cascade="all, delete-orphan")
