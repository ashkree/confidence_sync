from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, Field


class UserCommon(BaseModel):
    """Base schema containing common attributes shared across all user types."""

    id: str
    name: str
    email: str


class Employee(UserCommon):
    """Schema representing a regular employee without administrative privileges."""

    role: Literal["employee"]
    department: None = None


class Admin(UserCommon):
    """Schema representing an administrator with elevated privileges in specific departments."""

    role: Literal["admin"]
    department: Literal["hr", "it"]


UserBase = Annotated[Employee | Admin, Field(discriminator="role")]


class UserProfile(UserCommon):
    """Detailed schema for a user's profile, including leave days, phone number, and timestamps."""

    role: Literal["employee", "admin"]
    department: Literal["hr", "it"] | None
    phone_number: str
    leave_days: int
    created_at: datetime
    updated_at: datetime
