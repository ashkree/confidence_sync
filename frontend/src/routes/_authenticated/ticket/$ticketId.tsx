import { createFileRoute } from "@tanstack/react-router";
import { TicketDetailPage } from "@/components/page/TicketDetailPage";
import { fetchTicket } from "@/api/tickets";

export const Route = createFileRoute("/_authenticated/ticket/$ticketId")({
  validateSearch: (search: Record<string, unknown>) => ({
    department: (search.department as string) || "it",
  }),
  loaderDeps: ({ search: { department } }) => ({ department }),
  loader: async ({ params, deps }) => {
    return fetchTicket(params.ticketId, deps.department);
  },
  component: TicketDetailPage,
});
