import { fetchTickets } from "@/api/tickets";
import { createFileRoute } from "@tanstack/react-router";
import { TicketTable } from "@/components/ticket-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createColumnHelper } from "@tanstack/react-table";
import type { HrRequest } from "@/types";

const helper = createColumnHelper<HrRequest>();

const ticket_columns = [
  helper.accessor("request_type", {
    header: "Request Type",
    cell: (info) => (
      <span className="capitalize">{info.getValue().replace("_", " ")}</span>
    ),
  }),
  helper.accessor("document_type", {
    header: "Document Type",
    cell: (info) => {
      const val = info.getValue();
      return <span className="capitalize">{val ? val.replace("_", " ") : "N/A"}</span>;
    },
  }),
];

export const Route = createFileRoute("/_authenticated/admin/hr/requests")({
  component: RouteComponent,
  loader: () => fetchTickets(),
});

function RouteComponent() {
  const data = Route.useLoaderData();

  const unassignedCount = data.filter((t) => !t.assignee_id).length;
  const openCount = data.filter((t) => t.status === "open").length;
  const pendingCount = data.filter((t) => t.status === "pending").length;

  const hrTickets = data as HrRequest[];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        HR Requests Dashboard
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unassigned Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unassignedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      <TicketTable<HrRequest> columns={ticket_columns} data={hrTickets} />
    </div>
  );
}
