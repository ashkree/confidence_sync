import type { RowData } from "@tanstack/table-core";

declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /**
     * How this column behaves on small screens.
     * - "title":  card heading (exactly one per table)
     * - "badge":  rendered in the card's badge row (status, priority)
     * - "field":  label + value pair in the card body
     * - "hidden": omitted from the card entirely
     */
    mobile?: "title" | "badge" | "field" | "hidden";
    /** Overrides the header string as the card's field label. */
    mobileLabel?: string;
  }
}
