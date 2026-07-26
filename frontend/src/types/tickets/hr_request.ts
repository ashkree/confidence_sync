import type { Ticket } from "./ticket";

export type HrRequestType = "leave_request" | "document_request";
export type DocumentType = "noc" | "salary_certificate";

export interface HrRequest extends Ticket {
  type: "hr_request";
  request_type: HrRequestType;
  document_type: DocumentType | null;
  from_date: string | null;
  to_date: string | null;
}
