# app/repository/tickets.py
import uuid

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, with_polymorphic

from app.database import get_db
from app.exceptions.tickets import TicketNotFoundError
from app.models import HrRequest, ItTicket, Ticket, TicketComment
from app.models.ticket import TicketType

TicketWithSubtypes = with_polymorphic(Ticket, [HrRequest, ItTicket])


class TicketRepo:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _query(self):
        return select(TicketWithSubtypes).options(
            selectinload(TicketWithSubtypes.poster),
            selectinload(TicketWithSubtypes.assignee),
        )

    async def read_by_id(self, target_id: uuid.UUID) -> Ticket:
        result = await self.db.scalar(self._query().where(Ticket.id == target_id))
        if result is None:
            raise TicketNotFoundError(target_id)
        return result

    async def read_by_poster(self, poster_id: uuid.UUID) -> list[Ticket]:
        result = await self.db.scalars(
            self._query().where(TicketWithSubtypes.poster_id == poster_id)
        )
        return list(result.all())

    async def read_by_type(self, ticket_type: TicketType) -> list[Ticket]:
        result = await self.db.scalars(
            self._query().where(TicketWithSubtypes.type == ticket_type)
        )
        return list(result.all())

    async def create(self, ticket: Ticket) -> Ticket:
        self.db.add(ticket)
        await self.db.commit()
        await self.db.refresh(ticket)
        return ticket

    async def save(self, ticket: Ticket, *, refresh: list[str] | None = None) -> Ticket:
        await self.db.commit()
        await self.db.refresh(ticket, attribute_names=refresh)
        return ticket

    # --- comments (sub-resource, same class) ---

    async def add_comment(self, comment: TicketComment) -> TicketComment:
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def refresh_comment(self, comment: TicketComment) -> TicketComment:
        await self.db.refresh(comment, attribute_names=["author"])
        return comment

    async def read_comments(self, ticket_id: uuid.UUID) -> list[TicketComment]:
        result = await self.db.scalars(
            select(TicketComment)
            .options(selectinload(TicketComment.author))
            .where(TicketComment.ticket_id == ticket_id)
            .order_by(TicketComment.created_at)
        )
        return list(result.all())


async def get_ticket_repo(db: AsyncSession = Depends(get_db)) -> TicketRepo:
    return TicketRepo(db)
