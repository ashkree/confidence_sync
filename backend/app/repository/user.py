# app/repository/user.py
import uuid

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.exceptions.users import UserNotFoundError
from app.models import User
from app.models.user import UserDepartment, UserRole


class UserRepo:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _query(self):
        return select(User)

    async def read_by_id(self, target_id: uuid.UUID) -> User:
        user = await self.db.scalar(self._query().where(User.id == target_id))
        if user is None:
            raise UserNotFoundError(target_id)
        return user

    async def read_by_cognito_sub(self, cognito_sub: str | uuid.UUID) -> User:
        user = await self.db.scalar(
            self._query().where(User.cognito_sub == cognito_sub)
        )
        if user is None:
            raise UserNotFoundError(cognito_sub)
        return user

    async def read_by_email(self, email: str) -> User:
        """Look up by email.

        Not for unauthenticated paths: UserNotFoundError carries the identifier
        into the 404 body, which would let a caller enumerate valid addresses.
        Login goes through Cognito and InvalidCredentialsError instead.
        """
        user = await self.db.scalar(self._query().where(User.email == email))
        if user is None:
            raise UserNotFoundError(email)
        return user

    async def read_admins_by_department(self, department: UserDepartment) -> list[User]:
        """Admins in one department — the candidate set for ticket assignment."""
        result = await self.db.scalars(
            self._query()
            .where(User.role == UserRole.ADMIN, User.department == department)
            .order_by(User.name)
        )
        return list(result.all())

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def save(self, user: User, *, refresh: list[str] | None = None) -> User:
        await self.db.commit()
        await self.db.refresh(user, attribute_names=refresh)
        return user


async def get_user_repo(db: AsyncSession = Depends(get_db)) -> UserRepo:
    return UserRepo(db)
