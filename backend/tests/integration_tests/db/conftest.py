import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Import your Base from your models file so SQLAlchemy knows about your tables
from app.models import Base

DB_URL = (
    "postgresql+psycopg://confidence_sync_test:confidence@localhost/confidence_sync_db"
)


@pytest_asyncio.fixture(scope="session")
async def setup_db_engine():
    """Sets up the database engine and creates/drops the schema once per test session."""
    engine = create_async_engine(DB_URL, echo=False)

    # Setup: Create a clean slate of tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Yield the engine so other fixtures can use it
    yield engine

    # Teardown: Clean up the database and close connections
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(setup_db_engine):
    """
    Provides a transactional database session.
    Everything done in this session is rolled back when the test ends.
    """

    # 1. Open a direct connection to the database
    async with setup_db_engine.connect() as conn:
        # 2. Start a top-level transaction
        transaction = await conn.begin()

        # 3. Bind the session maker strictly to this connection
        AsyncSessionLocal = async_sessionmaker(
            bind=conn,
            class_=AsyncSession,
            expire_on_commit=False,
            # 4. CRITICAL: If your actual app code calls `session.commit()`,
            # this setting intercepts it and turns it into a SAVEPOINT instead.
            # This prevents your app from accidentally committing the test data!
            join_transaction_mode="create_savepoint",
        )

        async with AsyncSessionLocal() as session:
            # Yield the session to the test
            yield session

        # 5. The test is over. Roll back the top-level transaction.
        # This completely wipes out any INSERTs, UPDATEs, or DELETEs the test made.
        await transaction.rollback()


@pytest_asyncio.fixture()
async def seed_db(
    db_session,
    employee_1,
    employee_2,
    employee_3,
    employee_4,
    employee_5,
    it_admin_user_1,
    it_admin_user_2,
    hr_admin_user_1,
    hr_admin_user_2,
    hr_ticket_open,
    hr_ticket_resolved,
    it_ticket_pending,
    it_ticket_closed,
    comment_admin_on_it_ticket,
    comment_employee_reply,
):
    """Automatically seeds the database with all test fixtures."""

    db_session.add_all(
        [
            employee_1,
            employee_2,
            employee_3,
            employee_4,
            employee_5,
            it_admin_user_1,
            it_admin_user_2,
            hr_admin_user_1,
            hr_admin_user_2,
        ]
    )

    db_session.add_all(
        [hr_ticket_open, hr_ticket_resolved, it_ticket_pending, it_ticket_closed]
    )

    db_session.add_all([comment_admin_on_it_ticket, comment_employee_reply])

    await db_session.commit()
