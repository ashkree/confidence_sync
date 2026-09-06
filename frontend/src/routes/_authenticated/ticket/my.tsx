import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchMyTickets } from "@/api/tickets";
import { TicketTable } from "@/components/ticket-table";
import { createColumnHelper } from "@tanstack/react-table";
import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import type { HrRequest, ItTicket, Ticket } from "@/types";
import HeroSection from "@/components/sections/HeroSection";

export const Route = createFileRoute("/_authenticated/ticket/my")({
  component: MyTicketsPage,
  loader: () => fetchMyTickets(),
});

const itHelper = createColumnHelper<ItTicket>();
const itColumns = [
  itHelper.accessor("request_type", {
    header: "Issue Type",
    cell: (info) => (
      <span className="capitalize">{info.getValue().replace("_", " ")}</span>
    ),
  }),
];

const hrHelper = createColumnHelper<HrRequest>();
const hrColumns = [
  hrHelper.accessor("request_type", {
    header: "Request Type",
    cell: (info) => (
      <span className="capitalize">{info.getValue().replace("_", " ")}</span>
    ),
  }),
  hrHelper.accessor("document_type", {
    header: "Document Type",
    cell: (info) => {
      const val = info.getValue();
      return (
        <span className="capitalize">
          {val ? val.replace("_", " ") : "N/A"}
        </span>
      );
    },
  }),
];

function MyTicketsPage() {
  const data = Route.useLoaderData() as Ticket[];

  const itTickets = data.filter((t): t is ItTicket => t.type === "IT_TICKET");
  const hrRequests = data.filter(
    (t): t is HrRequest => t.type === "HR_REQUEST",
  );

  return (
    <>
      <HeroSection title="My Tickets" />
      <div className="p-6 space-y-8">
        <div className="flex justify-end">
          <Link
            to="/ticket/submit"
            className={buttonVariants({ variant: "default" })}
          >
            <PlusIcon className="mr-2 h-4 w-4" /> New Request
          </Link>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">IT Tickets</h2>
          <TicketTable<ItTicket> columns={itColumns} data={itTickets} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">HR Requests</h2>
          <TicketTable<HrRequest> columns={hrColumns} data={hrRequests} />
        </section>
      </div>
    </>
  );
}
