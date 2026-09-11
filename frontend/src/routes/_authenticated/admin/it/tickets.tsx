import { fetchTickets } from "@/features/tickets/api";
import { createFileRoute } from "@tanstack/react-router";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createColumnHelper } from "@tanstack/react-table";
import type { ItTicket } from "@/features/tickets/types";
import { CATALOG_BY_REQUEST_TYPE } from "@/features/tickets/catalog";
import HeroSection from "@/components/sections/HeroSection";

const helper = createColumnHelper<ItTicket>();

const ticket_columns = [
  helper.accessor("request_type", {
    header: "Issue Type",
    cell: (info) => {
      const val = info.getValue();
      return <span>{CATALOG_BY_REQUEST_TYPE[val]?.label ?? val}</span>;
    },
  }),
];

export const Route = createFileRoute("/_authenticated/admin/it/tickets")({
  component: RouteComponent,
  loader: () => fetchTickets(),
});

function RouteComponent() {
  const data = Route.useLoaderData();

  const unassignedCount = data.filter((t) => !t.assignee_name).length;
  const openCount = data.filter((t) => t.status === "OPEN").length;
  const pendingCount = data.filter((t) => t.status === "PENDING").length;

  const itTickets = data.filter((t): t is ItTicket => t.type === "IT_TICKET");

  return (
    <>
      <HeroSection title="IT Tickets" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unassigned Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unassignedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Open Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
        </div>

        <TicketTable<ItTicket>
          columns={ticket_columns}
          data={itTickets}
          showPoster
          showAssignee
          showPriority
        />
      </div>
    </>
  );
}
