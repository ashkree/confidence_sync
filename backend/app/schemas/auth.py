from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    email: str
    refresh_token: str


class TokenResponse(BaseModel):
    token: str
