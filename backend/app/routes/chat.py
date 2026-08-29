from fastapi import APIRouter, Depends, Query

from app.authorization.guards import require_authenticated
from app.schemas.chat import MessagesResponse, PostMessageRequest, SendMessageResponse
from app.services.chat import read_messages, write_message

chat_router = APIRouter(prefix="/chat")


@chat_router.get(
    "/messages",
    response_model=MessagesResponse,
    dependencies=[Depends(require_authenticated)],
)
async def get_messages(
    session_id: str = Query(...),
):
    raise await read_messages()


@chat_router.post(
    "/messages",
    response_model=SendMessageResponse,
    dependencies=[Depends(require_authenticated)],
)
async def send_message(
    request: PostMessageRequest,
):
    raise await write_message()
