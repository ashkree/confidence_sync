export type TicketType = "HR_REQUEST" | "IT_TICKET";

export type TicketStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";

export type TicketPriority = "HIGH" | "MEDIUM" | "LOW";

export interface BaseTicket {
  id: string;
  type: TicketType;
  status: TicketStatus;
  subject: string;
  description: string;
  created_at: string;
  updated_at: string;
  ai_summary: string | null;
  // Sensitive admin-only fields (omitted in employee responses)
  priority?: TicketPriority;
  poster_id?: string;
  poster_name?: string;
  assignee_id?: string | null;
  assignee_name?: string | null;
  information?: string | null;
}

export type ItRequestType = "HARDWARE_ISSUE" | "SOFTWARE_ISSUE";

export interface ItTicket extends BaseTicket {
  type: "IT_TICKET";
  request_type: ItRequestType;
  device_type: string | null;
  fault_code: string | null;
  software_name: string | null;
}

export type HrRequestType = "LEAVE_REQUEST" | "DOCUMENT_REQUEST";

export type DocumentType = "NOC" | "SALARY_CERTIFICATE";

export interface HrRequest extends BaseTicket {
  type: "HR_REQUEST";
  request_type: HrRequestType;
  document_type: DocumentType | null;
  from_date: string | null;
  to_date: string | null;
}

export type Ticket = ItTicket | HrRequest;

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface TicketEnrichment {
  ready: boolean;
  summary: string | null;
  next_steps: string | null;
}
