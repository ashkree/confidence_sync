export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "high" | "medium" | "low";
export type TicketType = "hr_request" | "it_ticket";

export interface BaseTicket {
  id: string;
  poster_id: string;
  assignee_id: string | null;
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

export interface HrRequest extends BaseTicket {
  type: "hr_request";
  request_type: "leave_request" | "document_request";
  document_type: "noc" | "salary_certificate" | null;
  from_date: string | null; // e.g., "2026-07-25"
  to_date: string | null;
}

export interface ItTicket extends BaseTicket {
  type: "it_ticket";
  request_type: "hardware_issue" | "software_issue";
  device_type: string | null;
  fault_code: string | null;
  software_name: string | null;
}

// Discriminated union for API results
export type AnyTicket = HrRequest | ItTicket;

export const mockTickets: AnyTicket[] = [
  {
    id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
    poster_id: "123e4567-e89b-12d3-a456-426614174000",
    assignee_id: "987e6543-e21b-12d3-a456-426614174999",
    type: "hr_request",
    status: "open",
    priority: "medium",
    subject: "Annual Leave Request - August",
    description:
      "I would like to request my annual leave for the first week of August to travel with my family.",
    information: null,
    ai_summary: "User requesting 5 days of annual leave in August.",
    created_at: "2026-07-20T09:00:00Z",
    updated_at: "2026-07-20T09:00:00Z",
    request_type: "leave_request",
    document_type: null,
    from_date: "2026-08-01",
    to_date: "2026-08-07",
  },
  {
    id: "a32d4fae-7dec-11d0-a765-00a0c91e6bf7",
    poster_id: "123e4567-e89b-12d3-a456-426614174000",
    assignee_id: null,
    type: "it_ticket",
    status: "pending",
    priority: "high",
    subject: "Laptop Screen Flickering",
    description:
      "My external monitor keeps disconnecting and my laptop screen is flickering constantly. I cannot work like this.",
    information: "User is working remotely, may need a replacement shipped.",
    ai_summary:
      "Hardware issue: Laptop screen flickering and external monitor disconnecting. High priority.",
    created_at: "2026-07-21T10:30:00Z",
    updated_at: "2026-07-21T11:15:00Z",
    request_type: "hardware_issue",
    device_type: "MacBook Pro 16",
    fault_code: "E042",
    software_name: null,
  },
  {
    id: "b45e4fae-7dec-11d0-a765-00a0c91e6bf8",
    poster_id: "123e4567-e89b-12d3-a456-426614174000",
    assignee_id: "987e6543-e21b-12d3-a456-426614174999",
    type: "hr_request",
    status: "resolved",
    priority: "low",
    subject: "Request for Salary Certificate",
    description:
      "Need a salary certificate for a bank loan application. Addressed to 'To Whom It May Concern'.",
    information: "Certificate generated and emailed to user.",
    ai_summary: "User requested salary certificate. Request fulfilled.",
    created_at: "2026-07-15T14:20:00Z",
    updated_at: "2026-07-16T09:45:00Z",
    request_type: "document_request",
    document_type: "salary_certificate",
    from_date: null,
    to_date: null,
  },
  {
    id: "c56f4fae-7dec-11d0-a765-00a0c91e6bf9",
    poster_id: "123e4567-e89b-12d3-a456-426614174000",
    assignee_id: null,
    type: "it_ticket",
    status: "open",
    priority: "medium",
    subject: "Cannot access internal wiki",
    description:
      "Getting a 403 Forbidden error when trying to access the engineering wiki space.",
    information: null,
    ai_summary: "Permissions issue: 403 Forbidden on engineering wiki.",
    created_at: "2026-07-21T13:00:00Z",
    updated_at: "2026-07-21T13:00:00Z",
    request_type: "software_issue",
    device_type: null,
    fault_code: null,
    software_name: "Confluence/Wiki",
  },
];
