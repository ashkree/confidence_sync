import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User

async def read_user_by_cognito_sub(db: AsyncSession, cognito_sub: str | uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.cognito_sub == cognito_sub))
    return result.scalar_one_or_none()
