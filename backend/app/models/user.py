import enum
import uuid
from datetime import datetime
from typing import override

from sqlalchemy import Enum as SAEnum
from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class UserRole(str, enum.Enum):
    EMPLOYEE = "employee"
    ADMIN = "admin"


class UserDepartment(str, enum.Enum):
    HR = "hr"
    IT = "it"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    cognito_sub: Mapped[uuid.UUID] = mapped_column(unique=True, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role"), default=UserRole.EMPLOYEE, nullable=False
    )
    department: Mapped[UserDepartment | None] = mapped_column(
        SAEnum(UserDepartment, name="user_department"),
        nullable=True,
    )
    phone_number: Mapped[str] = mapped_column(String(15), nullable=False)
    leave_days: Mapped[int] = mapped_column(default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )

    @override
    def __repr__(self) -> str:
        return (
            f"User("
            f"id={self.id!r}, "
            f"name={self.name!r}, "
            f"email={self.email!r}, "
            f"role={self.role!r}, "
            f"department={self.department!r}"
            f")"
        )
