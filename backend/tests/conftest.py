import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models import Base

# Shared test database URL
DB_URL = (
    "postgresql+psycopg://confidence_sync_test:confidence@localhost/confidence_sync_db"
)

# -------------------------------------------------------------------
# DATABASE SETUP
# Engine is created once per session; each test gets its own
# transactional session that is rolled back when the test ends.
# -------------------------------------------------------------------


@pytest_asyncio.fixture(scope="session")
async def setup_db_engine():
    """Creates all tables once at the start of the test session and
    drops them on teardown."""
    engine = create_async_engine(DB_URL, echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(setup_db_engine):
    """Yields a transactional AsyncSession.

    Every statement executed inside a test is wrapped in a top-level
    transaction that is rolled back after the test, keeping each test
    isolated without having to truncate tables.
    """
    async with setup_db_engine.connect() as conn:
        transaction = await conn.begin()

        AsyncSessionLocal = async_sessionmaker(
            bind=conn,
            class_=AsyncSession,
            expire_on_commit=False,
            # Intercepts session.commit() calls from app code and
            # demotes them to SAVEPOINTs so the outer transaction
            # remains intact for rollback.
            join_transaction_mode="create_savepoint",
        )

        async with AsyncSessionLocal() as session:
            yield session

        await transaction.rollback()


# -------------------------------------------------------------------
# FIXTURE GROUPS
# Wildcard imports surface all fixtures to pytest's collection
# machinery without requiring per-test explicit imports.
# -------------------------------------------------------------------

from tests.fixtures.comments import *  # noqa: F401, E402
from tests.fixtures.seed import *  # noqa: F401, E402
from tests.fixtures.tickets import *  # noqa: F401, E402
from tests.fixtures.users import *  # noqa: F401, E402
