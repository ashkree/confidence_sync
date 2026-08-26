import uuid
from typing import Sequence

from fastapi import Depends
from langchain_core.documents import Document as LcDocument
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.exceptions.documents import DocumentNotFoundError
from app.models import Document, DocumentChunk
from app.models.documents import DocumentCategory


class DocumentRepo:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, document: Document):
        self.db.add(document)
        await self.db.flush()

    async def read_by_id(self, id: uuid.UUID):

        document = await self.db.scalar(select(Document).where(Document.id == id))
        if document is None:
            raise DocumentNotFoundError(id)

        return document

    async def read_documents(self, category: DocumentCategory | None = None):

        if category is None:
            response = await self.db.scalars(select(Document))
        else:
            response = await self.db.scalars(
                select(Document).where(Document.category == category)
            )

        return list(response.all())

    async def batch_create_chunks(
        self,
        document_id: uuid.UUID,
        chunks: Sequence[LcDocument],
        vectors: Sequence[Sequence[float]],
    ) -> None:
        self.db.add_all(
            DocumentChunk(
                document_id=document_id,
                content=chunk.page_content,
                page_number=chunk.metadata.get("page"),
                chunk_index=idx,
                embedding=vector,
            )
            for idx, (chunk, vector) in enumerate(zip(chunks, vectors))
        )
        await self.db.commit()

    async def cosine_distance(self, query: Sequence[float], limit: int = 3):
        chunks = await self.db.scalars(
            select(DocumentChunk.content)
            .order_by(DocumentChunk.embedding.cosine_distance(query))
            .limit(limit)
        )

        return list(chunks.all())


def get_document_repo(db: AsyncSession = Depends(get_db)):
    return DocumentRepo(db)
