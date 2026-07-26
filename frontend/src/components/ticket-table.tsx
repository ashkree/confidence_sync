import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/data-table";
import type { Ticket } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPriorityColor, getStatusColor } from "@/lib/ticket-colors";



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
