import uuid
from unittest.mock import AsyncMock, MagicMock
import pytest
from httpx import ASGITransport, AsyncClient

from app.authorization.guards import require_authenticated
from app.main import app
from app.models.chat_session import ChatSession
from app.repository.chat import get_chat_repo


@pytest.mark.asyncio
async def test_delete_session_route():
    target_session_id = uuid.uuid4()
    new_session_id = uuid.uuid4()

    mock_chat_repo = MagicMock()
    mock_session = ChatSession(id=uuid.uuid4(), session_id=target_session_id)
    new_session = ChatSession(id=uuid.uuid4(), session_id=new_session_id)

    mock_chat_repo.read_session_by_id = AsyncMock(return_value=mock_session)
    mock_chat_repo.delete_session = AsyncMock()
    mock_chat_repo.create_session = AsyncMock(return_value=new_session)

    app.dependency_overrides[require_authenticated] = lambda: MagicMock()
    app.dependency_overrides[get_chat_repo] = lambda: mock_chat_repo

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.delete(
                f"/api/v1/chat/session?session_id={target_session_id}"
            )

        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == str(new_session_id)
        assert data["messages"] == []
        mock_chat_repo.delete_session.assert_called_once_with(mock_session)
        mock_chat_repo.create_session.assert_called_once()
    finally:
        app.dependency_overrides.clear()
