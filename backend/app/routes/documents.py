# app/routes/documents.py
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.models.documents import DocumentCategory
from app.schemas.documents import DocumentResponse
from app.services.auth import require_admin
from app.services.documents import create_document, read_documents

document_router = APIRouter(prefix="/documents")


@document_router.post("/create", status_code=201)
async def create_document_route(
    file: UploadFile = File(...),
    file_name: str = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    await create_document(db, current_user, file, file_name)


@document_router.get("", response_model=list[DocumentResponse])
async def list_documents(
    category: DocumentCategory | None = None, db: AsyncSession = Depends(get_db)
):

    print(category)

    if category is not None:
        documents = await read_documents(db)

    else:
        documents = await read_documents(db, category)

    print(documents)
    return documents
