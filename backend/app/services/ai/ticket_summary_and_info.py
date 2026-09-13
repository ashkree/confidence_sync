import asyncio
import logging
import uuid
from collections import defaultdict

from app.database import AsyncSessionLocal
from app.repository.document import DocumentRepo
from app.repository.ticket import TicketRepo
from app.services.ai.ticket_information import generate_ticket_information
from app.services.ai.ticket_summary import generate_ticket_summary

logger = logging.getLogger(__name__)

_enrichment_locks: dict[uuid.UUID, asyncio.Lock] = defaultdict(asyncio.Lock)
_enrichment_queued: set[uuid.UUID] = set()


async def enrich_new_ticket(ticket_id: uuid.UUID) -> None:
    try:
        async with AsyncSessionLocal() as db:
            ticket_repo = TicketRepo(db)
            document_repo = DocumentRepo(db)

            ticket = await ticket_repo.read_by_id(ticket_id)

            # Generate the summary and next steps
            summary, next_steps = await asyncio.gather(
                generate_ticket_summary(ticket),
                generate_ticket_information(document_repo, ticket),
            )

            # update ticket
            ticket.ai_summary = summary
            ticket.information = next_steps

            await ticket_repo.save(ticket)
    except Exception:
        logger.exception("Enrichment failed for new ticket %s", ticket_id)


async def enrich_ticket_summary(ticket_id: uuid.UUID) -> None:
    """Regenerate a ticket's summary, serialized per ticket.

    At most one run may wait per ticket. A third comment arriving while one run
    executes and another is queued needs no new task: the queued run reads
    comments *after* acquiring the lock, so it will already see that comment.

    Deliberately does not touch `information` — next-steps are admin-facing and
    must stay stable while an admin is reading them.
    """
    if ticket_id in _enrichment_queued:
        return

    _enrichment_queued.add(ticket_id)
    try:
        async with _enrichment_locks[ticket_id]:
            _enrichment_queued.discard(ticket_id)

            async with AsyncSessionLocal() as db:
                ticket_repo = TicketRepo(db)
                ticket = await ticket_repo.read_by_id(ticket_id)
                comments = await ticket_repo.read_comments(ticket_id)
                ticket.ai_summary = await generate_ticket_summary(ticket, comments)
                await ticket_repo.save(ticket)
    except Exception:
        logger.exception("Summary enrichment failed for ticket %s", ticket_id)
    finally:
        _enrichment_queued.discard(ticket_id)
