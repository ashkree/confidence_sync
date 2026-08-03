import pytest
from fastapi.testclient import TestClient

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.main import app

# -------------------------------------------------------------------
# HTTP CLIENT FIXTURES
# DB session is provided by the shared tests/conftest.py.
# -------------------------------------------------------------------


@pytest.fixture
def client(db_session):
    """TestClient wired up to the shared transactional db_session.

    get_db is overridden to return the same rolled-back session used
    by the rest of the test suite, so API tests share isolation
    guarantees with integration tests.
    """
    app.dependency_overrides[get_db] = lambda: db_session

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture
def as_user(client):
    """Returns a helper that sets the authenticated user for a test.

    Usage::

        def test_something(as_user, employee_1):
            c = as_user(employee_1)
            response = c.get("/tickets/")
    """

    def _set_user(user):
        app.dependency_overrides[get_current_user] = lambda: user
        return client

    return _set_user
