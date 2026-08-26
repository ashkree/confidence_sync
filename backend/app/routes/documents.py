# app/routes/documents.py
import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.authorization.guards import require_admin, require_authenticated
from app.models import User
from app.models.documents import DocumentCategory
from app.repository.document import DocumentRepo, get_document_repo
from app.schemas.documents import DocumentResponse
from app.services.documents import create_document, read_document, read_documents

document_router = APIRouter(prefix="/documents")


@document_router.post("/create", status_code=201)
async def create_document_route(
    file: UploadFile = File(...),
    file_name: str = Form(...),
    document_repo: DocumentRepo = Depends(get_document_repo),
    current_user: User = Depends(require_admin),
):
    await create_document(document_repo, current_user, file, file_name)


@document_router.get(
    "",
    response_model=list[DocumentResponse],
    dependencies=[Depends(require_authenticated)],
)
async def list_documents(
    category: DocumentCategory | None = None,
    document_repo: DocumentRepo = Depends(get_document_repo),
):
    return await read_documents(document_repo, category)


@document_router.get("/{id}/download", dependencies=[Depends(require_authenticated)])
async def download_document(
    id: uuid.UUID,
    document_repo: DocumentRepo = Depends(get_document_repo),
):
    return await read_document(document_repo, id, "attachment")


@document_router.get("/{id}/view", dependencies=[Depends(require_authenticated)])
async def view_document(
    id: uuid.UUID,
    document_repo: DocumentRepo = Depends(get_document_repo),
):
    return await read_document(document_repo, id, "inline")
