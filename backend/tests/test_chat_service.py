import uuid
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from app.exceptions.chat import SessionNotFoundError
from app.exceptions.external import BedrockUnavailableError
from app.models.chat_message import ChatMessage, MessageRole
from app.models.chat_session import ChatSession
from app.services.chat import reset_session, write_message


@pytest.mark.asyncio
async def test_write_message_success():
    chat_repo = MagicMock()
    document_repo = MagicMock()

    session_id = uuid.uuid4()
    session = ChatSession(id=uuid.uuid4(), session_id=session_id)
    session.messages = []

    chat_repo.read_session_by_id = AsyncMock(return_value=session)
    chat_repo.as_history = MagicMock(return_value=[])
    chat_repo.stage_message = MagicMock()
    chat_repo.create_message = AsyncMock(side_effect=lambda msg: msg)
    chat_repo.rollback = AsyncMock()

    document_repo.cosine_distance = AsyncMock(return_value=[])

    mock_bedrock = MagicMock()
    mock_bedrock.embed_text = AsyncMock(return_value=[0.1, 0.2])
    mock_bedrock.chat = AsyncMock(return_value="Hello! How can I assist?")

    with patch("app.services.chat.get_bedrock_client", return_value=mock_bedrock):
        result = await write_message(
            chat_repo=chat_repo,
            document_repo=document_repo,
            session_id=session_id,
            content="I need help with my laptop",
        )

    # Document retrieval used cosine distance without explicit threshold override
    document_repo.cosine_distance.assert_called_once_with([0.1, 0.2])

    # User message was staged (not committed via create_message)
    chat_repo.stage_message.assert_called_once()
    staged_msg = chat_repo.stage_message.call_args[0][0]
    assert staged_msg.role == MessageRole.USER
    assert staged_msg.content == "I need help with my laptop"

    # AI message was committed
    chat_repo.create_message.assert_called_once()
    ai_msg = chat_repo.create_message.call_args[0][0]
    assert ai_msg.role == MessageRole.ASSISTANT
    assert ai_msg.content == "Hello! How can I assist?"

    # Rollback was NOT called
    chat_repo.rollback.assert_not_called()

    assert result["session_id"] == str(session_id)
    assert result["message"].content == "Hello! How can I assist?"


@pytest.mark.asyncio
async def test_write_message_bedrock_failure_rolls_back():
    chat_repo = MagicMock()
    document_repo = MagicMock()

    session_id = uuid.uuid4()
    session = ChatSession(id=uuid.uuid4(), session_id=session_id)
    session.messages = []

    chat_repo.read_session_by_id = AsyncMock(return_value=session)
    chat_repo.as_history = MagicMock(return_value=[])
    chat_repo.stage_message = MagicMock()
    chat_repo.create_message = AsyncMock()
    chat_repo.rollback = AsyncMock()

    document_repo.cosine_distance = AsyncMock(return_value=[])

    mock_bedrock = MagicMock()
    mock_bedrock.embed_text = AsyncMock(return_value=[0.1, 0.2])
    mock_bedrock.chat = AsyncMock(side_effect=BedrockUnavailableError("Bedrock timeout"))

    with patch("app.services.chat.get_bedrock_client", return_value=mock_bedrock):
        with pytest.raises(BedrockUnavailableError):
            await write_message(
                chat_repo=chat_repo,
                document_repo=document_repo,
                session_id=session_id,
                content="I need help with my laptop",
            )

    # User message was staged
    chat_repo.stage_message.assert_called_once()

    # Commit was NEVER called (user message not saved permanently)
    chat_repo.create_message.assert_not_called()

    # Rollback WAS called to purge staged message
    chat_repo.rollback.assert_called_once()


@pytest.mark.asyncio
async def test_reset_session_deletes_and_creates_new():
    chat_repo = MagicMock()

    old_session_id = uuid.uuid4()
    old_session = ChatSession(id=uuid.uuid4(), session_id=old_session_id)

    new_session_id = uuid.uuid4()
    new_session = ChatSession(id=uuid.uuid4(), session_id=new_session_id)

    chat_repo.read_session_by_id = AsyncMock(return_value=old_session)
    chat_repo.delete_session = AsyncMock()
    chat_repo.create_session = AsyncMock(return_value=new_session)

    result = await reset_session(chat_repo=chat_repo, session_id=old_session_id)

    chat_repo.read_session_by_id.assert_called_once_with(old_session_id)
    chat_repo.delete_session.assert_called_once_with(old_session)
    chat_repo.create_session.assert_called_once()

    assert result["session_id"] == str(new_session_id)
    assert result["messages"] == []


@pytest.mark.asyncio
async def test_reset_session_handles_missing_session_gracefully():
    chat_repo = MagicMock()

    non_existent_id = uuid.uuid4()
    new_session_id = uuid.uuid4()
    new_session = ChatSession(id=uuid.uuid4(), session_id=new_session_id)

    chat_repo.read_session_by_id = AsyncMock(side_effect=SessionNotFoundError(non_existent_id))
    chat_repo.delete_session = AsyncMock()
    chat_repo.create_session = AsyncMock(return_value=new_session)

    result = await reset_session(chat_repo=chat_repo, session_id=non_existent_id)

    chat_repo.delete_session.assert_not_called()
    chat_repo.create_session.assert_called_once()

    assert result["session_id"] == str(new_session_id)
    assert result["messages"] == []
