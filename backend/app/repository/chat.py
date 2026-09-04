import uuid

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.exceptions.chat import SessionNotFoundError
from app.models import ChatMessage, ChatSession


class ChatRepo:
    def __init__(self, db: AsyncSession):
        self.db = db

    # Chat Messages
    async def create_message(self, message: ChatMessage):

        # Add the message entry into the database
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)

        return message

    # Chat Sessions
    async def create_session(self) -> ChatSession:

        session = ChatSession()
        self.db.add(session)
        await self.db.commit()

        return session

    async def read_session_by_id(self, target_id: uuid.UUID) -> ChatSession:

        session = await self.db.scalar(
            select(ChatSession)
            .where(
                ChatSession.session_id == target_id,
            )
            .options(selectinload(ChatSession.messages))
        )

        if session is None:
            raise SessionNotFoundError(target_id)

        return session

    async def delete_session(self, session: ChatSession):

        await self.db.delete(session)
        await self.db.commit()

    @staticmethod
    def as_history(session: ChatSession) -> list[tuple[str, str]]:
        """Return all messages in a session as (role, content) tuples."""
        return [message.as_turn() for message in session.messages]


async def get_chat_repo(db: AsyncSession = Depends(get_db)) -> ChatRepo:
    return ChatRepo(db)
