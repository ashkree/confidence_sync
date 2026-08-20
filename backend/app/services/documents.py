# app/services/documents.py


import uuid
from typing import Literal
from urllib.parse import quote

from fastapi import UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.auth import DepartmentNotConfiguredError
from app.exceptions.data import RecordNotFoundError
from app.models import User
from app.models.documents import Document, DocumentCategory
from app.models.user import UserDepartment
from app.repository.s3 import S3Repo

s3Repo = S3Repo()

DEPARTMENT_BUCKETS = {
    UserDepartment.IT: "it_manuals",
    UserDepartment.HR: "hr_policies",
}


async def create_document(
    db: AsyncSession, current_user: User, file: UploadFile, file_name: str
) -> None:
    department = current_user.department
    if department is None:
        raise DepartmentNotConfiguredError(department)

    bucket_name = DEPARTMENT_BUCKETS.get(department)
    if bucket_name is None:
        raise DepartmentNotConfiguredError(department)

    object_key = uuid.uuid4()
    filename = file_name.lower().replace(" ", "-")

    try:
        s3Repo.upload_file(
            file.file,
            bucket_name,
            str(object_key),
            extra_args={"Metadata": {"original-filename": filename}},
        )
    except s3Repo.client.exceptions.ClientError:
        raise

    new_document = Document(
        object_key=object_key,
        file_name=filename,
        s3_bucket=bucket_name,
        category=DocumentCategory.IT_MANUAL
        if department == UserDepartment.IT
        else DocumentCategory.HR_POLICY,
    )
    db.add(new_document)
    await db.commit()

    # TODO: Trigger a lambda function to generate vectors


async def read_documents(db: AsyncSession, category: DocumentCategory | None = None):

    if category is None:
        response = await db.scalars(select(Document))

    else:
        response = await db.scalars(
            select(Document).where(Document.category == category)
        )

    return list(response.all())


async def read_document(
    db: AsyncSession,
    target_id: uuid.UUID,
    disposition: Literal["inline", "attachment"] = "attachment",
) -> StreamingResponse:
    document = await db.scalar(select(Document).where(Document.id == target_id))
    if document is None:
        raise RecordNotFoundError

    try:
        body = s3Repo.download_file(document.s3_bucket, str(document.object_key))
    except s3Repo.client.exceptions.NoSuchKey:
        raise RecordNotFoundError

    filename = quote(document.file_name)
    return StreamingResponse(
        body.iter_chunks(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'{disposition}; filename="{filename}"'},
    )


async def update_document(bucket_name: str):
    # TODO: Update a document from a bucket
    # TODO: Update database entry
    # TODO: Update vectors
    raise NotImplementedError


async def delete_document(bucket_name: str):
    # TODO: Delete a document from a bucket
    # TODO: Delete database entry
    # TODO: Delete vectors
    raise NotImplementedError
