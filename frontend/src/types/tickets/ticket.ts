export type TicketType = "hr_request" | "it_ticket";
export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "high" | "medium" | "low";

export interface Ticket {
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
