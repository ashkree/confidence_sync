import type { Ticket, TicketComment, TicketStatus } from "@/types";

export async function fetchTickets(department: string): Promise<Ticket[]> {
  const res = await fetch(`/api/tickets?department=${department}`);
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export async function fetchTicket(id: string, department: string): Promise<Ticket> {
  const res = await fetch(`/api/tickets/${id}?department=${department}`);
  if (!res.ok) throw new Error("Failed to fetch ticket");
  return res.json();
}

export async function createTicket(data: Partial<Ticket>): Promise<Ticket> {
  const res = await fetch("/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create ticket");
  return res.json();
}

export async function updateTicketStatus(
  id: string,
  department: string,
  status: TicketStatus,
): Promise<Ticket> {
  const res = await fetch(`/api/tickets/${id}/status?department=${department}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update ticket status");
  return res.json();
}

export async function fetchTicketComments(
  ticketId: string,
): Promise<TicketComment[]> {
  const res = await fetch(`/api/tickets/${ticketId}/comments`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

export async function addTicketComment(
  ticketId: string,
  authorId: string,
  subject: string,
): Promise<TicketComment> {
  const res = await fetch(`/api/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ author_id: authorId, subject }),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}
