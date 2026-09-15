import { createFileRoute } from "@tanstack/react-router";
import { TicketHubPage } from "@/features/tickets/components/ticket-hub-page";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/_authenticated/ticket/submit/")({
  head: () => ({ meta: [{ title: pageTitle("Submit a request") }] }),
  component: TicketHubPage,
});
