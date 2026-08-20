import type {
  Ticket,
  TicketComment,
  TicketPriority,
  TicketStatus,
} from "@/types";
import { getAllTickets, getAllComments, getUserNameById } from "@/data";
import { formatDate } from "@/lib/date";

let _mockTickets: Ticket[] | null = null;
let _mockComments: TicketComment[] | null = null;

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
  return [];
}

export async function fetchTicket(id: string): Promise<Ticket | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const ticket = getMockTickets().find((t) => t.id === id);
  return ticket || null;
}

export async function createTicket(data: Partial<Ticket>): Promise<Ticket> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newTicket = {
    ...data,
    id: `uuid-${data.type === "HR_REQUEST" ? "hr" : "it"}-${Date.now()}`,
    status: "OPEN" as const,
    priority: "MEDIUM" as const,
    assignee_id: null,
    poster_name: data.poster_name || "Current User",
    assignee_name: null,
    information: null,
    ai_summary: null,
    created_at: formatDate(new Date()),
    updated_at: formatDate(new Date()),
  } as Ticket;

  _mockTickets = [...getMockTickets(), newTicket];
  saveMockTickets();
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
    id: `comment-${Date.now()}`,
    ticket_id: ticketId,
    author_name: "Current User",
    body,
    created_at: formatDate(new Date()),
  };
  _mockComments = [...getMockComments(), comment];
  saveMockComments();
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
