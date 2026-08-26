# app/services/documents.py
import uuid
from io import BytesIO
from typing import Literal
from urllib.parse import quote

from fastapi import UploadFile
from fastapi.responses import StreamingResponse
from langchain_core.documents import Document as LcDocument
from pymupdf import open as open_pdf

from app.exceptions.documents import DepartmentNotConfiguredError, DocumentNotFoundError
from app.exceptions.external import S3ObjectNotFoundError
from app.models import User
from app.models.documents import Document, DocumentCategory
from app.models.user import UserDepartment
from app.repository.bedrock import get_bedrock_client
from app.repository.document import DocumentRepo
from app.repository.s3 import get_s3_client

DEPARTMENT_BUCKETS = {
    UserDepartment.IT: "it_manuals",
    UserDepartment.HR: "hr_policies",
}


def extract_pdf_documents(pdf, filename: str) -> list[LcDocument]:
    docs = []
    for page_num, page in enumerate(pdf):
        text = page.get_text()
        if text.strip():
            docs.append(
                LcDocument(
                    page_content=text,
                    metadata={"source": filename, "page": page_num + 1},
                )
            )
    pdf.close()
    return docs


async def create_document(
    document_repo: DocumentRepo, current_user: User, file: UploadFile, file_name: str
) -> None:
    department = current_user.department

    if department is None:
        raise DepartmentNotConfiguredError(department)

    bucket_name = DEPARTMENT_BUCKETS.get(department)
    if bucket_name is None:
        raise DepartmentNotConfiguredError(department)

    object_key = uuid.uuid4()
    filename = file_name.lower().replace(" ", "-")

    file_bytes = await file.read()
    pdf = open_pdf(stream=file_bytes, filetype="pdf")
    docs = extract_pdf_documents(pdf, filename)
    chunks, vectors = await get_bedrock_client().embed_pdf(docs)

    await get_s3_client().upload_file(
        BytesIO(file_bytes),
        bucket_name,
        str(object_key),
        extra_args={"Metadata": {"original-filename": filename}},
    )

    new_document = Document(
        object_key=object_key,
        file_name=filename,
        s3_bucket=bucket_name,
        category=DocumentCategory.IT_MANUAL
        if department == UserDepartment.IT
        else DocumentCategory.HR_POLICY,
    )

    await document_repo.create(new_document)
    await document_repo.batch_create_chunks(new_document.id, chunks, vectors)


async def read_document(
    document_repo: DocumentRepo,
    target_id: uuid.UUID,
    disposition: Literal["inline", "attachment"] = "attachment",
) -> StreamingResponse:

    document = document_repo.read_by_id(target_id)

    try:
        body = await get_s3_client().download_file(
            document.s3_bucket, str(document.object_key)
        )
    except S3ObjectNotFoundError:
        raise DocumentNotFoundError(target_id)

    filename = quote(document.file_name)
    return StreamingResponse(
        body.iter_chunks(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'{disposition}; filename="{filename}"'},
    )


async def read_documents(
    document_repo: DocumentRepo, category: DocumentCategory | None = None
):

    return await document_repo.read_documents(category)


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
