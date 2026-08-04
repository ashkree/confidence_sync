import uuid

import pytest

from app.services.auth import read_user_by_cognito_sub


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestReadUserByCognitoSub:
    """Tests for read_user_by_cognito_sub — auth service DB query."""

    async def test_returns_user_when_sub_matches(self, db_session, employee_1):
        """Returns the matching User when the cognito_sub exists in the database."""

        result = await read_user_by_cognito_sub(db_session, employee_1.cognito_sub)

        assert result is not None
        assert result.id == employee_1.id
        assert result.email == employee_1.email

    async def test_returns_none_when_sub_does_not_match(self, db_session):
        """Returns None when no user has the given cognito_sub."""

        result = await read_user_by_cognito_sub(db_session, uuid.uuid4())

        assert result is None
