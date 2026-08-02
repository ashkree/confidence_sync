import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User


async def read_user_by_email(db: AsyncSession, email: str) -> User | None:
    # Look up user by email (case-insensitive)
    result = await db.scalars(
        select(User).where(func.lower(User.email) == email.lower())
    )
    return result.first()


async def read_user_by_id(db: AsyncSession, id: uuid.UUID) -> User | None:
    result = await db.scalars(select(User).where(User.id == id))
    return result.first()
