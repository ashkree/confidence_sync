# app/services/auth/cognito.py

from app.repository.cognito import get_cognito_client


async def authenticate(email: str, password: str):

    response = await get_cognito_client().login_user(email, password)
    return response["AccessToken"], response.get("RefreshToken")


async def refresh_tokens(email: str, refresh_token: str):
    response = await get_cognito_client().refresh_token(email, refresh_token)
    return response["AccessToken"], response.get("RefreshToken")
