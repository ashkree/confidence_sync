from pydantic import BaseModel

from app.schemas.users import UserBase


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: UserBase
