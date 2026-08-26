# app/routes/documents.py
import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.authorization.guards import require_admin, require_authenticated
from app.database import get_db
from app.models import User
from app.models.documents import DocumentCategory
from app.schemas.documents import DocumentResponse
from app.services.documents import create_document, read_document, read_documents

document_router = APIRouter(prefix="/documents")


@document_router.post("/create", status_code=201)
async def create_document_route(
    file: UploadFile = File(...),
    file_name: str = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await create_document(db, current_user, file, file_name)


@document_router.get(
    "",
    response_model=list[DocumentResponse],
    dependencies=[Depends(require_authenticated)],
)
async def list_documents(
    category: DocumentCategory | None = None,
    db: AsyncSession = Depends(get_db),
):

    if category is not None:
        documents = await read_documents(db, category)

    else:
        documents = await read_documents(db)

    return documents


@document_router.get("/{id}/download", dependencies=[Depends(require_authenticated)])
async def download_document(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    return await read_document(db, id, "attachment")


@document_router.get("/{id}/view", dependencies=[Depends(require_authenticated)])
async def view_document(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    return await read_document(db, id, "inline")
