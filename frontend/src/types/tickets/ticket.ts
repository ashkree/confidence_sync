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
