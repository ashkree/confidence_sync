import uuid
from datetime import datetime, timezone

import pytest

from app.models import TicketComment

# -------------------------------------------------------------------
# COMMENTS
# -------------------------------------------------------------------


@pytest.fixture()
def comment_admin_on_it_ticket(it_ticket_pending, it_admin_user_1) -> TicketComment:
    return TicketComment(
        id=uuid.uuid4(),
        ticket_id=it_ticket_pending.id,
        author_id=it_admin_user_1.id,
        body="I've ordered a replacement monitor. It should arrive tomorrow.",
        created_at=datetime(2026, 8, 2, 12, 15, tzinfo=timezone.utc),
    )


@pytest.fixture()
def comment_employee_reply(it_ticket_pending, employee_3) -> TicketComment:
    return TicketComment(
        id=uuid.uuid4(),
        ticket_id=it_ticket_pending.id,
        author_id=employee_3.id,
        body="Great, thank you! Let me know when it arrives.",
        created_at=datetime(2026, 8, 2, 12, 30, tzinfo=timezone.utc),
    )
