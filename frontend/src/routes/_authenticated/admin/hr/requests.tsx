import { fetchTickets } from "@/features/tickets/api";

import { createFileRoute } from "@tanstack/react-router";
import { TicketTable } from "@/features/tickets/components/ticket-table";
import { StatCard } from "@/components/stat-card";
import { CircleDot, Clock, Inbox } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import type { HrRequest } from "@/features/tickets/types";
import { CATALOG_BY_REQUEST_TYPE, humanizeEnum } from "@/features/tickets/catalog";
import HeroSection from "@/components/sections/HeroSection";
import { pageTitle } from "@/lib/page-title";

const helper = createColumnHelper<HrRequest>();

const ticket_columns = [
  helper.accessor("request_type", {
    header: "Request Type",
    cell: (info) => {
      const val = info.getValue();
      return <span>{CATALOG_BY_REQUEST_TYPE[val]?.label ?? val}</span>;
    },
  }),
  helper.accessor("document_type", {
    header: "Document Type",
    cell: (info) => {
      const val = info.getValue();
      return <span>{val ? humanizeEnum(val) : "N/A"}</span>;
    },
  }),
];

export const Route = createFileRoute("/_authenticated/admin/hr/requests")({
  head: () => ({ meta: [{ title: pageTitle("HR Requests") }] }),
  component: RouteComponent,
  loader: () => fetchTickets(),
});

function RouteComponent() {
  const data = Route.useLoaderData();

  const unassignedCount = data.filter((t) => !t.assignee_id).length;
  const openCount = data.filter((t) => t.status === "OPEN").length;
  const pendingCount = data.filter((t) => t.status === "PENDING").length;

  const hrTickets = data.filter((t): t is HrRequest => t.type === "HR_REQUEST");

  return (
    <>
      <HeroSection title="HR Requests" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Unassigned"
            value={unassignedCount}
            icon={Inbox}
            tone="warn"
            hint="Needs an owner"
          />
          <StatCard
            label="Open"
            value={openCount}
            icon={CircleDot}
            tone="info"
            hint="Currently active"
          />
          <StatCard
            label="Pending"
            value={pendingCount}
            icon={Clock}
            tone="neutral"
            hint="Waiting on info"
          />
        </div>

        <TicketTable<HrRequest>
          columns={ticket_columns}
          data={hrTickets}
          showPoster
          showAssignee
          showPriority
        />
      </div>
    </>
  );
}
