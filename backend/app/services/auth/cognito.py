# app/services/auth/cognito.py
import jwt

from app.repository.cognito import get_cognito_client


async def authenticate(email: str, password: str):

    response = await get_cognito_client().login_user(email, password)
    claims = jwt.decode(response["IdToken"], options={"verify_signature": False})
    return (
        response["AccessToken"],
        response.get("RefreshToken"),
        claims["cognito:username"],
    )


async def refresh_tokens(username: str, refresh_token: str):
    response = await get_cognito_client().refresh_token(username, refresh_token)
    return response["AccessToken"], response.get("RefreshToken")

