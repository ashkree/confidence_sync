import uuid

from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User


async def find_user_by_email(
    db: AsyncSession, form_data: OAuth2PasswordRequestForm
) -> User | None:

    # Look up user by email (case-insensitive)
    # Note: OAuth2PasswordRequestForm uses "username" field, but we treat it as email

    result = await db.scalars(
        select(User).where(func.lower(User.email) == form_data.username.lower())
    )

    return result.first()


async def find_user_by_id(db: AsyncSession, id: uuid.UUID) -> User | None:

    result = await db.scalars(select(User).where(User.id == id))

    return result.first()
