import { CalendarDays, FileText, HardDrive, AppWindow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RequestTypeSlug =
  | "leave-request"
  | "document-request"
  | "hardware-issue"
  | "software-issue";

export interface RequestTypeMeta {
  requestType: string;
  department: "HR" | "IT";
  ticketType: "HR_REQUEST" | "IT_TICKET";
  label: string;
  description: string;
  icon: LucideIcon;
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
  },
  "document-request": {
    requestType: "DOCUMENT_REQUEST",
    department: "HR",
    ticketType: "HR_REQUEST",
    label: "Document Request",
    description:
      "Request an NOC or salary certificate. Select the document type and we'll route it to HR.",
    icon: FileText,
  },
  "hardware-issue": {
    requestType: "HARDWARE_ISSUE",
    department: "IT",
    ticketType: "IT_TICKET",
    label: "Hardware Issue",
    description:
      "Report a problem with a laptop, monitor, keyboard, or other equipment. Specify the device type and any fault code.",
    icon: HardDrive,
  },
  "software-issue": {
    requestType: "SOFTWARE_ISSUE",
    department: "IT",
    ticketType: "IT_TICKET",
    label: "Software Issue",
    description:
      "Report a bug, crash, or access problem with company software. Tell us which application is affected.",
    icon: AppWindow,
  },
} as const satisfies Record<RequestTypeSlug, RequestTypeMeta>;

export const SLUGS = Object.keys(CATALOG) as RequestTypeSlug[];
