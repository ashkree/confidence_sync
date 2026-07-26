import type { Ticket } from "@/types";

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
