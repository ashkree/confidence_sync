import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchMyTickets } from "@/api/tickets";
import { TicketTable } from "@/components/ticket-table";
import { buttonVariants } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import type { Ticket } from "@/types";
import HeroSection from "@/components/sections/HeroSection";

export const Route = createFileRoute("/_authenticated/ticket/my")({
  component: MyTicketsPage,
  loader: () => fetchMyTickets(),
});

function MyTicketsPage() {
  const data = Route.useLoaderData() as Ticket[];

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

        <TicketTable<Ticket> showType data={data} />
      </div>
    </>
  );
}

