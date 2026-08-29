import datetime
from typing import Literal

from pydantic import BaseModel


class PostMessageRequest(BaseModel):
    session_id: str | None = None
    content: str


class ChatMessage(BaseModel):
    role: Literal["assistant", "user"]
    content: str
    created_at: datetime.datetime


class MessagesResponse(BaseModel):
    session_id: str
    messages: list[ChatMessage]


class SendMessageResponse(BaseModel):
    session_id: str
    message: ChatMessage
