import enum
import uuid
from datetime import datetime

from sqlalchemy import Enum as SAEnum
from sqlalchemy import String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base
from app.models.document_chunks import DocumentChunk


class DocumentCategory(str, enum.Enum):
    HR_POLICY = "HR_POLICY"
    IT_MANUAL = "IT_MANUAL"


class Document(Base):
    __tablename__ = "documents"

    # COLUMNS
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    object_key: Mapped[uuid.UUID] = mapped_column(Uuid)
    file_name: Mapped[str] = mapped_column(String(50), nullable=False)
    s3_bucket: Mapped[str] = mapped_column(String(50), nullable=False)
    category: Mapped[DocumentCategory] = mapped_column(
        SAEnum(DocumentCategory, name="document_category"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )

    chunks: Mapped[list[DocumentChunk]] = relationship(cascade="all, delete-orphan")
