from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, EmailStr, Field


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserCommon(BaseModel):
    id: str
    name: str
    email: str


class Employee(UserCommon):
    role: Literal["employee"]
    department: None = None


class Admin(UserCommon):
    role: Literal["admin"]
    department: Literal["hr", "it"]


UserBase = Annotated[Employee | Admin, Field(discriminator="role")]


class UserProfile(UserCommon):
    role: Literal["employee", "admin"]
    department: Literal["hr", "it"] | None
    phone_number: str
    leave_days: int
    created_at: datetime
    updated_at: datetime


class UserToken(BaseModel):
    access_token: str
    token_type: str
