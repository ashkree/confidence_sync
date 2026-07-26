import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/data-table";
import type { Ticket } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    case "medium":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    case "low":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "pending":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
    case "resolved":
    case "closed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
  }
}

function getBaseColumns<TData extends Ticket>(): ColumnDef<TData, any>[] {
  const helper = createColumnHelper<TData>();

  return [
    helper.accessor("subject" as any, {
      header: "Subject",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("poster_id" as any, {
      header: "Poster",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("assignee_id" as any, {
      header: "Assignee",
      cell: (info) => info.getValue() ?? "Unassigned",
    }),
    helper.accessor("priority" as any, {
      header: "Priority",
      cell: (info) => {
        const value = info.getValue() as string;
        return (
          <Badge
            variant="outline"
            className={cn("capitalize font-semibold", getPriorityColor(value))}
          >
            {value}
          </Badge>
        );
      },
    }),
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
  ];
}

interface TicketTableProps<TData extends Ticket> {
  columns?: ColumnDef<TData, any>[];
  data: TData[];
}

export function TicketTable<TData extends Ticket>({
  columns = [],
  data,
}: TicketTableProps<TData>) {
  return (
    <DataTable
      columns={[...getBaseColumns<TData>(), ...columns]}
      data={data}
    />
  );
}
