import { CalendarDays, FileText, HardDrive, AppWindow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RequestTypeSlug =
  | "leave-request"
  | "document-request"
  | "hardware-issue"
  | "software-issue";

export interface DetailFieldDescriptor {
  key: string;
  label: string;
  format?: (val: any) => string;
}

export interface RequestTypeMeta {
  requestType: string;
  department: "HR" | "IT";
  ticketType: "HR_REQUEST" | "IT_TICKET";
  label: string;
  description: string;
  icon: LucideIcon;
  detailFields: DetailFieldDescriptor[];
  renderDetail?: (ticket: any) => React.ReactNode;
}

export function humanizeEnum(val: string): string {
  if (!val) return "";
  if (val === "NOC") return "NOC";
  return val
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const CATALOG = {
  "leave-request": {
    requestType: "LEAVE_REQUEST",
    department: "HR",
    ticketType: "HR_REQUEST",
    label: "Leave Request",
    description:
      "Book annual, sick, or unpaid leave. You'll need your start and end dates.",
    icon: CalendarDays,
    detailFields: [
      { key: "from_date", label: "From" },
      { key: "to_date", label: "To" },
    ],
  },
  "document-request": {
    requestType: "DOCUMENT_REQUEST",
    department: "HR",
    ticketType: "HR_REQUEST",
    label: "Document Request",
    description:
      "Request an NOC or salary certificate. Select the document type and we'll route it to HR.",
    icon: FileText,
    detailFields: [
      { key: "document_type", label: "Document Type", format: humanizeEnum },
    ],
  },
  "hardware-issue": {
    requestType: "HARDWARE_ISSUE",
    department: "IT",
    ticketType: "IT_TICKET",
    label: "Hardware Issue",
    description:
      "Report a problem with a laptop, monitor, keyboard, or other equipment. Specify the device type and any fault code.",
    icon: HardDrive,
    detailFields: [
      { key: "device_type", label: "Device Type" },
      { key: "fault_code", label: "Fault Code" },
    ],
  },
  "software-issue": {
    requestType: "SOFTWARE_ISSUE",
    department: "IT",
    ticketType: "IT_TICKET",
    label: "Software Issue",
    description:
      "Report a bug, crash, or access problem with company software. Tell us which application is affected.",
    icon: AppWindow,
    detailFields: [{ key: "software_name", label: "Software" }],
  },
} as const satisfies Record<RequestTypeSlug, RequestTypeMeta>;

export const SLUGS = Object.keys(CATALOG) as RequestTypeSlug[];

// Request types are unique across both HR and IT departments, so a flat map is safe.
export const CATALOG_BY_REQUEST_TYPE = Object.fromEntries(
  Object.entries(CATALOG).map(([slug, meta]) => [meta.requestType, { slug, ...meta }]),
) as Record<string, RequestTypeMeta & { slug: RequestTypeSlug }>;
