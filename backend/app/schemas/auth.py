from pydantic import BaseModel

from app.schemas.users import UserBase


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    email: str
    refresh_token: str


class LoginResponse(BaseModel):
    token: str
    refresh_token: str | None = None
    user: UserBase
