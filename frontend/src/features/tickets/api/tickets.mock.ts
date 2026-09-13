import type {
  Ticket,
  TicketComment,
  TicketEnrichment,
  TicketPriority,
  TicketStatus,
} from "../types";
import type { TicketCreatePayload } from "../form/types";
import {
  getAllTickets,
  getAllComments,
  getUserNameById,
  getUserByEmail,
} from "@/mocks";
import { formatDate } from "@/lib/date";

let _mockTickets: Ticket[] | null = null;
let _mockComments: TicketComment[] | null = null;

const _enrichmentTimers = new Map<string, number>();

function getMockTickets(): Ticket[] {
  if (!_mockTickets) {
    try {
      const stored = sessionStorage.getItem("mockTickets_v2");
      if (stored) {
        _mockTickets = JSON.parse(stored);
      } else {
        _mockTickets = getAllTickets();
      }
    } catch {
      _mockTickets = getAllTickets();
    }
  }
  return _mockTickets!;
}

function saveMockTickets() {
  if (_mockTickets) {
    sessionStorage.setItem("mockTickets_v2", JSON.stringify(_mockTickets));
  }
}

function getMockComments(): TicketComment[] {
  if (!_mockComments) {
    try {
      const stored = sessionStorage.getItem("mockComments_v2");
      if (stored) {
        _mockComments = JSON.parse(stored);
      } else {
        _mockComments = getAllComments();
      }
    } catch {
      _mockComments = getAllComments();
    }
  }
  return _mockComments!;
}

function saveMockComments() {
  if (_mockComments) {
    sessionStorage.setItem("mockComments_v2", JSON.stringify(_mockComments));
  }
}

export async function fetchTickets(): Promise<Ticket[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return getMockTickets();
}

export async function fetchMyTickets(): Promise<Ticket[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const email = localStorage.getItem("auth-email");
  const user = email ? getUserByEmail(email) : null;
  const tickets = getMockTickets();
  if (!user) return tickets;
  return tickets.filter((t) => t.poster_id === user.id);
}

export async function fetchTicket(id: string): Promise<Ticket | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const ticket = getMockTickets().find((t) => t.id === id);
  return ticket || null;
}

export async function createTicket(data: TicketCreatePayload): Promise<Ticket> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const email = localStorage.getItem("auth-email");
  const user = email ? getUserByEmail(email) : null;
  const newTicket = {
    ...data,
    id: `uuid-${data.type === "HR_REQUEST" ? "hr" : "it"}-${Date.now()}`,
    status: "OPEN" as const,
    priority: "MEDIUM" as const,
    poster_id: user?.id || "user-1",
    poster_name: user?.name || "Current User",
    assignee_id: null,
    assignee_name: null,
    information: null,
    ai_summary: null,
    created_at: formatDate(new Date()),
    updated_at: formatDate(new Date()),
  } as Ticket;

  _mockTickets = [...getMockTickets(), newTicket];
  saveMockTickets();
  _enrichmentTimers.set(newTicket.id, Date.now());
  return newTicket;
}

export async function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  let found = false;
  _mockTickets = getMockTickets().map((t) => {
    if (t.id === id) {
      found = true;
      return { ...t, status, updated_at: formatDate(new Date()) };
    }
    return t;
  });
  if (found) saveMockTickets();
  return getMockTickets().find((t) => t.id === id) || null;
}

export async function updateTicketPriority(
  id: string,
  priority: TicketPriority,
): Promise<Ticket | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  let found = false;
  _mockTickets = getMockTickets().map((t) => {
    if (t.id === id) {
      found = true;
      return { ...t, priority, updated_at: formatDate(new Date()) };
    }
    return t;
  });
  if (found) saveMockTickets();
  return getMockTickets().find((t) => t.id === id) || null;
}

export async function fetchTicketComments(
  ticketId: string,
): Promise<TicketComment[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return getMockComments().filter((c) => c.ticket_id === ticketId);
}

export async function addTicketComment(
  ticketId: string,
  body: string,
): Promise<TicketComment> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const comment: TicketComment = {
    id: crypto.randomUUID(),
    ticket_id: ticketId,
    author_name: "Current User",
    body,
    created_at: formatDate(new Date()),
  };
  _mockComments = [...getMockComments(), comment];
  saveMockComments();
  _enrichmentTimers.set(ticketId, Date.now());
  return comment;
}

export async function assignTicket(
  id: string,
  assigneeId: string | null,
): Promise<Ticket | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let found = false;
  _mockTickets = getMockTickets().map((t) => {
    if (t.id === id) {
      found = true;
      return {
        ...t,
        assignee_id: assigneeId,
        assignee_name: assigneeId ? getUserNameById(assigneeId) : null,
        updated_at: formatDate(new Date()),
      };
    }
    return t;
  });

  if (found) saveMockTickets();
  return getMockTickets().find((t) => t.id === id) || null;
}

export async function summarizeTicket(id: string): Promise<Ticket | null> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  let found = false;
  _mockTickets = getMockTickets().map((t) => {
    if (t.id === id) {
      found = true;
      return {
        ...t,
        ai_summary:
          "This is a mock AI-generated summary of the ticket for development testing.",
        updated_at: formatDate(new Date()),
      };
    }
    return t;
  });
  if (found) saveMockTickets();
  return getMockTickets().find((t) => t.id === id) || null;
}

export async function fetchTicketEnrichment(
  ticketId: string,
): Promise<TicketEnrichment> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const now = Date.now();
  if (!_enrichmentTimers.has(ticketId)) {
    _enrichmentTimers.set(ticketId, now);
  }

  const elapsed = now - _enrichmentTimers.get(ticketId)!;

  // Simulate ~6s enrichment delay
  if (elapsed < 6000) {
    const existing = getMockTickets().find((t) => t.id === ticketId);
    return {
      ready: false,
      summary: existing?.ai_summary ?? null,
      next_steps: existing?.information ?? null,
    };
  }

  // Enrichment "complete" — update the mock ticket store
  const ticket = getMockTickets().find((t) => t.id === ticketId);
  if (ticket) {
    const comments = getMockComments().filter((c) => c.ticket_id === ticketId);
    let summary =
      "This is a mock AI-generated summary of the ticket for development testing.";
    if (comments.length > 0) {
      summary += ` Updated with ${comments.length} comment(s).`;
    }
    const information =
      ticket.information ||
      "1. **Review the request details** — confirm the reported issue matches a known category.\n2. **Check for prior tickets** from the same reporter for recurring patterns.";

    _mockTickets = getMockTickets().map((t) =>
      t.id === ticketId
        ? {
            ...t,
            ai_summary: summary,
            information,
            updated_at: formatDate(new Date()),
          }
        : t,
    );
    saveMockTickets();
  }

  const updated = getMockTickets().find((t) => t.id === ticketId);
  return {
    ready: true,
    summary: updated?.ai_summary ?? null,
    next_steps: updated?.information ?? null,
  };
}
