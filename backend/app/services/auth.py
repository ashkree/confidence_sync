import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User


async def read_user_by_cognito_sub(
    db: AsyncSession, cognito_sub: uuid.UUID
) -> User | None:
    """Look up a local user record by their Cognito sub identifier."""
    result = await db.scalars(select(User).where(User.cognito_sub == cognito_sub))
    return result.first()
