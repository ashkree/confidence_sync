import { fetchTicket, fetchTicketComments } from "@/features/tickets/api";
import { TicketDetailPage } from "@/features/tickets/components/ticket-detail-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/ticket/$ticketId")({
  loader: async ({ params }) => {
    const [ticket, initialComments] = await Promise.all([
      fetchTicket(params.ticketId),
      fetchTicketComments(params.ticketId),
    ]);
    return { ticket, initialComments };
  },
  component: TicketDetailPage,
});
