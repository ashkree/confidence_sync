# app/routes/documents.py
from fastapi import APIRouter, Depends

from app.models import User
from app.schemas.documents import DocumentResponse
from app.services.auth import get_current_user
from app.services.documents import get_document_categories_for_user

document_router = APIRouter(prefix="/documents")


@document_router.get(
    "/me",
    response_model=list[DocumentResponse],
    summary="List documents for the current user",
)
async def get_my_documents(
    current_user: User = Depends(get_current_user),
) -> list[DocumentResponse]:
    """Return documents the current user is allowed to see, based on their role and department.

    - Employees receive both HR policies and IT manuals.
    - IT admins receive IT manuals only.
    - HR admins receive HR policies only.

    Returns:
        list[DocumentResponse]: Documents scoped to the current user.
    """
    categories = get_document_categories_for_user(current_user)

    # TODO: fetch documents from S3, filtering by `categories`.
    # Each S3 object should be stored under a prefix matching its category,
    # e.g. s3://<bucket>/HR_POLICY/<key> and s3://<bucket>/IT_MANUAL/<key>.
    # For now this returns an empty list until the S3 integration is wired up.
    _ = categories
    return []
