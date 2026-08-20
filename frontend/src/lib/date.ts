import { format } from "date-fns";

/**
 * Formats any date input (Date object, ISO 8601 string, or DD/MM/YYYY string)
 * into standard DD/MM/YYYY format.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? "" : format(value, "dd/MM/yyyy");
  }
  if (typeof value === "string") {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    const d = new Date(value);
    if (!isNaN(d.getTime())) return format(d, "dd/MM/yyyy");
  }
  return String(value);
}
