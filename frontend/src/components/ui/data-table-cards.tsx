import * as React from "react";
import { type Table as TanstackTable, flexRender } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import "./data-table-types";

interface DataTableCardsProps<TData> {
  table: TanstackTable<TData>;
  onRowClick?: (row: TData) => void;
}

export function DataTableCards<TData>({
  table,
  onRowClick,
}: DataTableCardsProps<TData>) {
  const rows = table.getRowModel().rows;

  if (!rows.length) {
    return (
      <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
        No results.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const cells = row.getVisibleCells();
        const titleCell = cells.find(
          (c) => c.column.columnDef.meta?.mobile === "title",
        );
        const badgeCells = cells.filter(
          (c) => c.column.columnDef.meta?.mobile === "badge",
        );
        const actionCell = cells.find(
          (c) =>
            c.column.id === "actions" ||
            c.column.columnDef.meta?.mobile === "hidden",
        );
        const fieldCells = cells.filter((c) => {
          const m = c.column.columnDef.meta?.mobile;
          if (m === "title" || m === "badge" || m === "hidden") return false;
          if (c.column.id === "actions") return false;
          return true;
        });

        return (
          <div
            key={row.id}
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            onClick={() => onRowClick?.(row.original)}
            onKeyDown={(e) => {
              if (onRowClick && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onRowClick(row.original);
              }
            }}
            className={cn(
              "rounded-lg border bg-card p-4 text-left transition-colors",
              onRowClick &&
                "cursor-pointer active:bg-muted/50 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {/* Title line with chevron */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {titleCell ? (
                  <h3 className="font-heading font-medium text-foreground line-clamp-2">
                    {flexRender(
                      titleCell.column.columnDef.cell,
                      titleCell.getContext(),
                    )}
                  </h3>
                ) : (
                  <h3 className="font-heading font-medium text-foreground">
                    Item {row.id}
                  </h3>
                )}
              </div>
              {onRowClick && (
                <ChevronRight className="size-4 shrink-0 text-muted-foreground mt-0.5" />
              )}
            </div>

            {/* Badge row */}
            {badgeCells.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {badgeCells.map((cell) => (
                  <React.Fragment key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Field grid */}
            {fieldCells.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm mt-3 pt-3 border-t">
                {fieldCells.map((cell) => {
                  const label =
                    cell.column.columnDef.meta?.mobileLabel ??
                    (typeof cell.column.columnDef.header === "string"
                      ? cell.column.columnDef.header
                      : cell.column.id);

                  return (
                    <div key={cell.id} className="min-w-0">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-0.5 font-medium">
                        {label}
                      </span>
                      <div className="font-medium truncate text-foreground">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action cell if present */}
            {actionCell && (
              <div
                className="mt-3 pt-3 border-t flex justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                {flexRender(
                  actionCell.column.columnDef.cell,
                  actionCell.getContext(),
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
