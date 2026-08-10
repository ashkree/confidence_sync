import type { Ticket } from "./ticket";

export type HrRequestType = "LEAVE_REQUEST" | "DOCUMENT_REQUEST";
export type DocumentType = "NOC" | "SALARY_CERTIFICATE";

export interface HrRequest extends Ticket {
  type: "HR_REQUEST";
  request_type: HrRequestType;
  document_type: DocumentType | null;
  from_date: string | null;
  to_date: string | null;
}
