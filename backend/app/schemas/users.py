from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.user import UserDepartment, UserRole


class UserCommon(BaseModel):
    """Base schema containing common attributes shared across all user types."""

    model_config = ConfigDict(from_attributes=True)

    name: str
    email: str


class Employee(UserCommon):
    """Schema representing a regular employee without administrative privileges."""

    role: Literal[UserRole.EMPLOYEE]
    department: None = None


class Admin(UserCommon):
    """Schema representing an administrator with elevated privileges in specific departments."""

    role: Literal[UserRole.ADMIN]
    department: UserDepartment


UserBase = Annotated[Employee | Admin, Field(discriminator="role")]


class UserProfile(UserCommon):
    """Detailed schema for a user's profile, including leave days, phone number, and timestamps."""

    role: UserRole
    department: UserDepartment | None
    phone_number: str
    leave_days: int
    created_at: datetime
    updated_at: datetime
