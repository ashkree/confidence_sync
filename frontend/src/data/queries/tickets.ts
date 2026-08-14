import type { Ticket, TicketComment, HrRequest, ItTicket } from "@/types";
import ticketsData from "../tickets.json";
import commentsData from "../ticket_comments.json";

const allTickets: Ticket[] = ticketsData as Ticket[];
const allComments: TicketComment[] = commentsData as TicketComment[];

export function getAllTickets(): Ticket[] {
  return allTickets;
}

export function getAllComments(): TicketComment[] {
  return allComments;
}

export function getTicketById(id: string): Ticket | null {
  return allTickets.find((t) => t.id === id) ?? null;
}

export function getTicketsByPoster(posterId: string): Ticket[] {
  return allTickets.filter((t) => t.poster_id === posterId);
}

export function getHrRequests(): HrRequest[] {
  return allTickets.filter((t): t is HrRequest => t.type === "HR_REQUEST");
}

export function getItTickets(): ItTicket[] {
  return allTickets.filter((t): t is ItTicket => t.type === "IT_TICKET");
}

export function getCommentsByTicket(ticketId: string): TicketComment[] {
  return allComments.filter((c) => c.ticket_id === ticketId);
}
