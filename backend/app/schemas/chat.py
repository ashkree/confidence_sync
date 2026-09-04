import uuid

from pydantic import BaseModel, ConfigDict

from app.models.chat_message import MessageRole


class ChatMessage(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role: MessageRole
    content: str


class PostMessageRequest(BaseModel):
    session_id: uuid.UUID
    content: str


class MessagesResponse(BaseModel):
    session_id: str
    messages: list[ChatMessage]


class SendMessageResponse(BaseModel):
    session_id: str
    message: ChatMessage
