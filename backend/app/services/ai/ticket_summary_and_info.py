import asyncio
import uuid

from app.database import AsyncSessionLocal
from app.repository.document import DocumentRepo
from app.repository.ticket import TicketRepo
from app.services.ai.ticket_information import generate_ticket_information
from app.services.ai.ticket_summary import generate_ticket_summary


async def enrich_new_ticket(ticket_id: uuid.UUID):

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
