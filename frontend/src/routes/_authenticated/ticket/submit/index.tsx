import { createFileRoute } from "@tanstack/react-router";
import { TicketHubPage } from "@/features/tickets/components/ticket-hub-page";

export const Route = createFileRoute("/_authenticated/ticket/submit/")({
  component: TicketHubPage,
});
