import { fetchTicket, fetchTicketComments } from "@/features/tickets/api";
import { TicketDetailPage } from "@/features/tickets/components/ticket-detail-page";
import { createFileRoute } from "@tanstack/react-router";
import type { Ticket } from "@/features/tickets/types";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/_authenticated/ticket/$ticketId")({
  head: () => ({
    meta: [{ title: pageTitle("Ticket") }],
  }),
  loader: async ({ params, location }) => {
    const fromCreate = (
      location.state as { createdTicket?: Ticket } | undefined
    )?.createdTicket;

    if (fromCreate) {
      // Just created: no comments can exist yet, and we already hold the ticket.
      return { ticket: fromCreate, initialComments: [] };
    }

    const [ticket, initialComments] = await Promise.all([
      fetchTicket(params.ticketId),
      fetchTicketComments(params.ticketId),
    ]);
    return { ticket, initialComments };
  },
  component: TicketDetailPage,
});
