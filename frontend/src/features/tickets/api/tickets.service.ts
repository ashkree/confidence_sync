import { apiClient } from "@/lib/api-client";
import type {
  Ticket,
  TicketComment,
  TicketEnrichment,
  TicketPriority,
  TicketStatus,
} from "../types";
import type { TicketCreatePayload } from "../form/types";

export async function fetchMyTickets(): Promise<Ticket[]> {
  const { data } = await apiClient.get<Ticket[]>("/tickets/me");
  return data;
}

export async function fetchTickets(): Promise<Ticket[]> {
  const { data } = await apiClient.get<Ticket[]>("/tickets");
  return data;
}

export async function fetchTicket(id: string): Promise<Ticket> {
  const { data } = await apiClient.get<Ticket>(`/tickets/${id}`);
  return data;
}

export async function createTicket(
  data: TicketCreatePayload,
): Promise<Ticket> {
  const { data: ticket } = await apiClient.post<Ticket>("/tickets", data);
  return ticket;
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket> {
  const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/status`, {
    status,
  });
  return data;
}

export async function updateTicketPriority(
  id: string,
  priority: TicketPriority,
): Promise<Ticket> {
  const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/priority`, {
    priority,
  });
  return data;
}

export async function fetchTicketComments(
  ticketId: string,
): Promise<TicketComment[]> {
  const { data } = await apiClient.get<TicketComment[]>(
    `/tickets/${ticketId}/comments`,
  );
  return data;
}

export async function addTicketComment(
  ticketId: string,
  body: string,
): Promise<TicketComment> {
  const { data } = await apiClient.post<TicketComment>(
    `/tickets/${ticketId}/comments`,
    { body },
  );
  return data;
}

export async function assignTicket(
  id: string,
  assigneeId: string | null,
): Promise<Ticket> {
  const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/assignee`, {
    assignee_id: assigneeId,
  });
  return data;
}

export async function summarizeTicket(id: string): Promise<Ticket> {
  const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/summarize`);
  return data;
}

export async function fetchTicketEnrichment(
  ticketId: string,
): Promise<TicketEnrichment> {
  const { data } = await apiClient.get<TicketEnrichment>(
    `/tickets/${ticketId}/enrichment`,
  );
  return data;
}
