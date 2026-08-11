import type { Ticket, TicketComment, TicketPriority, TicketStatus } from "@/types";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth-token");
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

export async function fetchMyTickets(): Promise<Ticket[]> {
  return fetchWithAuth("/api/v1/tickets/me");
}

export async function fetchTickets(): Promise<Ticket[]> {
  return fetchWithAuth("/api/v1/tickets");
}

export async function fetchTicket(id: string): Promise<Ticket> {
  return fetchWithAuth(`/api/v1/tickets/${id}`);
}

export async function createTicket(data: Partial<Ticket>): Promise<Ticket> {
  return fetchWithAuth("/api/v1/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket> {
  return fetchWithAuth(`/api/v1/tickets/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export async function updateTicketPriority(
  id: string,
  priority: TicketPriority,
): Promise<Ticket> {
  return fetchWithAuth(`/api/v1/tickets/${id}/priority`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priority }),
  });
}

export async function fetchTicketComments(
  ticketId: string,
): Promise<TicketComment[]> {
  return fetchWithAuth(`/api/v1/tickets/${ticketId}/comments`);
}

export async function addTicketComment(
  ticketId: string,
  body: string,
): Promise<TicketComment> {
  return fetchWithAuth(`/api/v1/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket_id: ticketId, body }),
  });
}

export async function assignTicket(
  id: string,
  assigneeId: string | null,
): Promise<Ticket> {
  return fetchWithAuth(`/api/v1/tickets/${id}/assignee`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assignee_id: assigneeId }),
  });
}
