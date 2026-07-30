from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserBase(BaseModel):
    id: str
    name: str
    email: str
    role: Literal["employee", "admin"]
    department: Literal["hr", "it"] | None


class UserProfile(UserBase):
    phone_number: str
    leave_days: int
    created_at: datetime
    updated_at: datetime
