import type { Ticket, HrRequest, ItTicket, TicketComment, TicketStatus } from "@/types";

const defaultHrRequests: HrRequest[] = [
  {
    id: "uuid-hr-1",
    poster_id: "e1",
    assignee_id: "ahr1",
    type: "hr_request",
    status: "open",
    priority: "high",
    subject: "Leave request for next week",
    description: "I need to take a leave for a family emergency.",
    information: null,
    ai_summary: null,
    poster_name: "Employee One",
    assignee_name: "HR Admin One",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    request_type: "leave_request",
    document_type: null,
    from_date: "2026-08-01",
    to_date: "2026-08-05",
  },
  {
    id: "uuid-hr-2",
    poster_id: "e2",
    assignee_id: null,
    type: "hr_request",
    status: "pending",
    priority: "medium",
    subject: "Salary certificate for bank",
    description: "I need a salary certificate to apply for a loan.",
    information: null,
    ai_summary: null,
    poster_name: "Employee Two",
    assignee_name: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    request_type: "document_request",
    document_type: "salary_certificate",
    from_date: null,
    to_date: null,
  },
];

let mockHrRequests: HrRequest[] = (() => {
  try { return JSON.parse(sessionStorage.getItem("mockHrRequests") || "null") || defaultHrRequests; } catch { return defaultHrRequests; }
})();
const saveHrRequests = () => sessionStorage.setItem("mockHrRequests", JSON.stringify(mockHrRequests));

const defaultItTickets: ItTicket[] = [
  {
    id: "uuid-it-1",
    poster_id: "e1",
    assignee_id: "ait1",
    type: "it_ticket",
    status: "open",
    priority: "high",
    subject: "Laptop screen flickering",
    description: "My laptop screen keeps flickering since yesterday.",
    information: null,
    ai_summary: null,
    poster_name: "Employee One",
    assignee_name: "IT Admin One",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    request_type: "hardware_issue",
    device_type: "Laptop",
    fault_code: null,
    software_name: null,
  },
  {
    id: "uuid-it-2",
    poster_id: "e3",
    assignee_id: null,
    type: "it_ticket",
    status: "resolved",
    priority: "low",
    subject: "Need Photoshop installed",
    description: "I need Photoshop for the new design project.",
    information: null,
    ai_summary: null,
    poster_name: "Employee Three",
    assignee_name: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    request_type: "software_issue",
    device_type: "Laptop",
    fault_code: null,
    software_name: "Adobe Photoshop",
  },
];

let mockItTickets: ItTicket[] = (() => {
  try { return JSON.parse(sessionStorage.getItem("mockItTickets") || "null") || defaultItTickets; } catch { return defaultItTickets; }
})();
const saveItTickets = () => sessionStorage.setItem("mockItTickets", JSON.stringify(mockItTickets));

export async function fetchTickets(department: string): Promise<Ticket[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (department === "hr") {
    return mockHrRequests;
  }
  if (department === "it") {
    return mockItTickets;
  }
  return [];
}

export async function fetchTicket(id: string, department: string): Promise<Ticket | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const source = department === "hr" ? mockHrRequests : department === "it" ? mockItTickets : [];
  const ticket = source.find((t) => t.id === id);
  return ticket || null;
}

const defaultComments: TicketComment[] = [
  {
    id: "comment-1",
    ticket_id: "uuid-hr-1",
    author_id: "ahr1",
    subject: "We are reviewing your leave request.",
    created_at: new Date().toISOString(),
  },
  {
    id: "comment-2",
    ticket_id: "uuid-it-1",
    author_id: "ait1",
    subject: "We have ordered a replacement screen for your laptop.",
    created_at: new Date().toISOString(),
  },
];

let mockComments: TicketComment[] = (() => {
  try { return JSON.parse(sessionStorage.getItem("mockComments") || "null") || defaultComments; } catch { return defaultComments; }
})();
const saveComments = () => sessionStorage.setItem("mockComments", JSON.stringify(mockComments));

export async function createTicket(data: Partial<Ticket>): Promise<Ticket> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newTicket = {
    ...data,
    id: `uuid-${data.type === "hr_request" ? "hr" : "it"}-${Date.now()}`,
    status: "open" as const,
    priority: "medium" as const,
    assignee_id: null,
    poster_name: "Current User",
    assignee_name: null,
    information: null,
    ai_summary: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Ticket;

  if (data.type === "hr_request") {
    mockHrRequests = [...mockHrRequests, newTicket as HrRequest];
    saveHrRequests();
  } else {
    mockItTickets = [...mockItTickets, newTicket as ItTicket];
    saveItTickets();
  }
  return newTicket;
}

export async function updateTicketStatus(
  id: string,
  department: string,
  status: TicketStatus,
): Promise<Ticket | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (department === "hr") {
    mockHrRequests = mockHrRequests.map((t) =>
      t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t,
    );
    saveHrRequests();
    return mockHrRequests.find((t) => t.id === id) || null;
  }
  if (department === "it") {
    mockItTickets = mockItTickets.map((t) =>
      t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t,
    );
    saveItTickets();
    return mockItTickets.find((t) => t.id === id) || null;
  }
  return null;
}

export async function fetchTicketComments(
  ticketId: string,
): Promise<TicketComment[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockComments.filter((c) => c.ticket_id === ticketId);
}

export async function addTicketComment(
  ticketId: string,
  authorId: string,
  subject: string,
): Promise<TicketComment> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const comment: TicketComment = {
    id: `comment-${Date.now()}`,
    ticket_id: ticketId,
    author_id: authorId,
    subject,
    created_at: new Date().toISOString(),
  };
  mockComments = [...mockComments, comment];
  saveComments();
  return comment;
}
