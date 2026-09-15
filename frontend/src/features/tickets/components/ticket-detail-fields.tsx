import { CATALOG_BY_REQUEST_TYPE } from "../catalog";
import type { Ticket } from "../types";

export function TicketDetailFields({ ticket }: { ticket: Ticket }) {
  const meta = CATALOG_BY_REQUEST_TYPE[ticket.request_type];
  if (!meta) return null;
  if (meta.renderDetail) return <>{meta.renderDetail(ticket)}</>;

  const rows = meta.detailFields
    .map((field) => {
      const raw = (ticket as any)[field.key];
      const value = field.format ? field.format(raw) : raw;
      return { label: field.label, value };
    })
    .filter((row) => row.value != null && row.value !== "");

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-muted/20 p-3.5 rounded-lg border">
      {rows.map((row) => (
        <div key={row.label} className="min-w-0">
          <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider block mb-0.5">
            {row.label}
          </span>
          <p className="font-medium truncate">{row.value}</p>
        </div>
      ))}
    </div>
  );
}
