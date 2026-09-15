import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchMyTickets } from "@/features/tickets/api";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import type { Ticket } from "@/features/tickets/types";
import HeroSection from "@/components/sections/HeroSection";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/_authenticated/ticket/my")({
  head: () => ({ meta: [{ title: pageTitle("My Tickets") }] }),
  component: MyTicketsPage,
  loader: () => fetchMyTickets(),
});

function MyTicketsPage() {
  const data = Route.useLoaderData() as Ticket[];

  return (
    <>
      <HeroSection
        title="My Tickets"
        actions={
          <Link
            to="/ticket/submit"
            className={buttonVariants({ variant: "default" })}
          >
            <PlusIcon className="mr-2 h-4 w-4" /> New Request
          </Link>
        }
      />
      <div className="p-4 md:p-6 space-y-6 md:space-y-8">
        <TicketTable<Ticket> showType data={data} />
      </div>
    </>
  );
}
