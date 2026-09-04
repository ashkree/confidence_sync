import uuid

from fastapi import APIRouter, Depends, Query

from app.authorization.guards import require_authenticated
from app.repository.chat import ChatRepo, get_chat_repo
from app.repository.document import DocumentRepo, get_document_repo
from app.schemas.chat import MessagesResponse, PostMessageRequest, SendMessageResponse
from app.services.chat import get_active_session, write_message

chat_router = APIRouter(prefix="/chat")


@chat_router.get(
    "/messages",
    response_model=MessagesResponse,
    dependencies=[Depends(require_authenticated)],
)
async def get_messages(
    session_id: uuid.UUID | None = Query(None),
    chat_repo: ChatRepo = Depends(get_chat_repo),
):
    return await get_active_session(chat_repo, session_id)


@chat_router.post(
    "/send",
    response_model=SendMessageResponse,
    dependencies=[Depends(require_authenticated)],
)
async def send_message(
    request: PostMessageRequest,
    chat_repo: ChatRepo = Depends(get_chat_repo),
    document_repo: DocumentRepo = Depends(get_document_repo),
):
    return await write_message(
        chat_repo, document_repo, request.session_id, request.content
    )
