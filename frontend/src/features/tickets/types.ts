export type TicketType = "HR_REQUEST" | "IT_TICKET";

export type TicketStatus = "OPEN" | "PENDING" | "RESOLVED" | "CLOSED";

export type TicketPriority = "HIGH" | "MEDIUM" | "LOW";

export interface Ticket {
  id: string;
  poster_id: string;
  assignee_id: string | null;
  poster_name: string;
  assignee_name: string | null;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  description: string;
  information: string | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export type ItRequestType = "HARDWARE_ISSUE" | "SOFTWARE_ISSUE";

export interface ItTicket extends Ticket {
  type: "IT_TICKET";
  request_type: ItRequestType;
  device_type: string | null;
  fault_code: string | null;
  software_name: string | null;
}

export type HrRequestType = "LEAVE_REQUEST" | "DOCUMENT_REQUEST";

export type DocumentType = "NOC" | "SALARY_CERTIFICATE";

export interface HrRequest extends Ticket {
  type: "HR_REQUEST";
  request_type: HrRequestType;
  document_type: DocumentType | null;
  from_date: string | null;
  to_date: string | null;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_name: string;
  body: string;
  created_at: string;
}
