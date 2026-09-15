import uuid
from unittest.mock import AsyncMock, MagicMock, patch
import jwt
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.auth.cognito import authenticate


@pytest.mark.asyncio
async def test_authenticate_extracts_cognito_username():
    expected_uuid = str(uuid.uuid4())
    mock_id_token = jwt.encode(
        {"cognito:username": expected_uuid, "sub": expected_uuid},
        "a_secure_secret_key_that_is_at_least_32_bytes_long!",
        algorithm="HS256",
    )

    mock_client = MagicMock()
    mock_client.login_user = AsyncMock(
        return_value={
            "AccessToken": "mock-access-token",
            "RefreshToken": "mock-refresh-token",
            "IdToken": mock_id_token,
        }
    )

    with patch("app.services.auth.cognito.get_cognito_client", return_value=mock_client):
        access, refresh, username = await authenticate("user@example.com", "Password123!")

    assert access == "mock-access-token"
    assert refresh == "mock-refresh-token"
    assert username == expected_uuid


@pytest.mark.asyncio
async def test_post_login_sets_refresh_username_cookie():
    user_uuid = str(uuid.uuid4())

    with patch(
        "app.routes.auth.authenticate",
        new=AsyncMock(return_value=("acc-token", "ref-token", user_uuid)),
    ):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            res = await client.post(
                "/api/v1/auth/login",
                json={"email": "test@example.com", "password": "Password123!"},
            )

        assert res.status_code == 200
        assert res.json() == {"token": "acc-token"}

        # Verify Set-Cookie headers for refresh_username and refresh_token
        set_cookie_headers = res.headers.get_list("set-cookie")
        set_cookie_str = "; ".join(set_cookie_headers)

        assert f"refresh_username={user_uuid}" in set_cookie_str
        assert "refresh_token=ref-token" in set_cookie_str
        assert "path=/api/v1/auth/refresh" in set_cookie_str.lower()
        assert "httponly" in set_cookie_str.lower()


@pytest.mark.asyncio
async def test_post_refresh_success_with_refresh_username():
    user_uuid = str(uuid.uuid4())

    with patch(
        "app.routes.auth.refresh_tokens",
        new=AsyncMock(return_value=("new-acc-token", None)),
    ) as mock_refresh:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            client.cookies.set("refresh_username", user_uuid, path="/api/v1/auth/refresh")
            client.cookies.set("refresh_token", "my-refresh-token", path="/api/v1/auth/refresh")

            res = await client.post("/api/v1/auth/refresh")

        assert res.status_code == 200
        assert res.json() == {"token": "new-acc-token"}
        mock_refresh.assert_called_once_with(user_uuid, "my-refresh-token")


@pytest.mark.asyncio
async def test_post_refresh_missing_cookies_returns_401():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/v1/auth/refresh")

    # Must be 401 Unauthorized, NOT 503 ExternalServiceError!
    assert res.status_code == 401
    data = res.json()
    assert data["error"] == "missing_refresh_cookie"


@pytest.mark.asyncio
async def test_post_logout_clears_username_and_legacy_email_cookies():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/v1/auth/logout")

    assert res.status_code == 204
    set_cookie_headers = res.headers.get_list("set-cookie")
    set_cookie_str = "; ".join(set_cookie_headers)

    # Check that refresh_token, refresh_username, and legacy refresh_email are deleted
    assert "refresh_token=" in set_cookie_str
    assert "refresh_username=" in set_cookie_str
    assert "refresh_email=" in set_cookie_str
