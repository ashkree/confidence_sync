import pytest_asyncio

# -------------------------------------------------------------------
# DB SEED
# Seeds all test data in insertion order: users → tickets → comments.
# Tests that need a populated DB should use @pytest.mark.usefixtures("seed_db").
# -------------------------------------------------------------------


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
    """Populates the database with the full set of test fixtures.

    Insertion order matters for FK constraints:
      1. Users (no dependencies)
      2. Tickets (depend on users)
      3. Comments (depend on tickets + users)
    """
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
