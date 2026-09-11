import { fetchTicket } from "@/features/tickets/api";
import { TicketDetailPage } from "@/features/tickets/components/ticket-detail-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/ticket/$ticketId")({
  loader: async ({ params }) => {
    return fetchTicket(params.ticketId);
  },
  component: TicketDetailPage,
});
