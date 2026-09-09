import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import type { Ticket } from "../types";
import { getPriorityColor, getStatusColor } from "../lib/ticket-colors";

function getBaseColumns<TData extends Ticket>(options: {
  showPoster: boolean;
  showAssignee: boolean;
  showPriority: boolean;
  showType: boolean;
}): ColumnDef<TData, any>[] {
  const helper = createColumnHelper<TData>();

  return [
    helper.accessor("subject" as any, {
      header: "Subject",
      cell: (info) => info.getValue(),
    }),
    ...(options.showType
      ? [
          helper.accessor("type" as any, {
            header: "Type",
            cell: (info) => {
              const value = info.getValue() as string;
              return (
                <span className="capitalize">
                  {value === "HR_REQUEST" ? "HR Request" : "IT Ticket"}
                </span>
              );
            },
          }),
        ]
      : []),
    ...(options.showPoster
      ? [
          helper.accessor("poster_name" as any, {
            header: "Poster",
            cell: (info) => info.getValue(),
          }),
        ]
      : []),
    ...(options.showAssignee
      ? [
          helper.accessor("assignee_name" as any, {
            header: "Assignee",
            cell: (info) => info.getValue() ?? "Unassigned",
          }),
        ]
      : []),
    ...(options.showPriority
      ? [
          helper.accessor("priority" as any, {
            header: "Priority",
            cell: (info) => {
              const value = info.getValue() as string;
              return (
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize font-semibold",
                    getPriorityColor(value),
                  )}
                >
                  {value}
                </Badge>
              );
            },
          }),
        ]
      : []),
    helper.accessor("status" as any, {
      header: "Status",
      cell: (info) => {
        const value = info.getValue() as string;
        return (
          <Badge
            variant="outline"
            className={cn("capitalize font-semibold", getStatusColor(value))}
          >
            {value}
          </Badge>
        );
      },
    }),
    helper.accessor("updated_at" as any, {
      header: "Updated At",
      cell: (info) => {
        const value = info.getValue() as string;
        return new Date(value).toLocaleDateString();
      },
    }),
  ];
}

interface TicketTableProps<TData extends Ticket> {
  columns?: ColumnDef<TData, any>[];
  data: TData[];
  showPoster?: boolean;
  showAssignee?: boolean;
  showPriority?: boolean;
  showType?: boolean;
}

export function TicketTable<TData extends Ticket>({
  columns = [],
  data,
  showPoster = false,
  showAssignee = false,
  showPriority = false,
  showType = false,
}: TicketTableProps<TData>) {
  const navigate = useNavigate();

  return (
    <DataTable
      columns={[
        ...getBaseColumns<TData>({
          showPoster,
          showAssignee,
          showPriority,
          showType,
        }),
        ...columns,
      ]}
      data={data}
      onRowClick={(row) => {
        navigate({
          to: "/ticket/$ticketId",
          params: { ticketId: row.id },
          search: { department: row.type === "HR_REQUEST" ? "HR" : "IT" },
        });
      }}
    />
  );
}
