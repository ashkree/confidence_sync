import type {
  Ticket,
  HrRequest,
  ItTicket,
  TicketComment,
  TicketStatus,
} from "@/types";

const defaultHrRequests: HrRequest[] = [
  {
    id: "uuid-hr-1",
    poster_id: "e1",
    assignee_id: "ahr1",
    type: "HR_REQUEST",
    status: "OPEN",
    priority: "HIGH",
    subject: "Leave request for next week",
    description: "I need to take a leave for a family emergency.",
    information: null,
    ai_summary: null,
    poster_name: "Employee One",
    assignee_name: "HR Admin One",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    request_type: "LEAVE_REQUEST",
    document_type: null,
    from_date: "2026-08-01",
    to_date: "2026-08-05",
  },
  {
    id: "uuid-hr-2",
    poster_id: "e2",
    assignee_id: null,
    type: "HR_REQUEST",
    status: "PENDING",
    priority: "MEDIUM",
    subject: "Salary certificate for bank",
    description: "I need a salary certificate to apply for a loan.",
    information: null,
    ai_summary: null,
    poster_name: "Employee Two",
    assignee_name: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    request_type: "DOCUMENT_REQUEST",
    document_type: "SALARY_CERTIFICATE",
    from_date: null,
    to_date: null,
  },
];

let mockHrRequests: HrRequest[] = (() => {
  try {
    return (
      JSON.parse(sessionStorage.getItem("mockHrRequests") || "null") ||
      defaultHrRequests
    );
  } catch {
    return defaultHrRequests;
  }
})();
const saveHrRequests = () =>
  sessionStorage.setItem("mockHrRequests", JSON.stringify(mockHrRequests));

const defaultItTickets: ItTicket[] = [
  {
    id: "uuid-it-1",
    poster_id: "e1",
    assignee_id: "ait1",
    type: "IT_TICKET",
    status: "OPEN",
    priority: "HIGH",
    subject: "Laptop screen flickering",
    description: "My laptop screen keeps flickering since yesterday.",
    information: null,
    ai_summary: null,
    poster_name: "Employee One",
    assignee_name: "IT Admin One",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    request_type: "HARDWARE_ISSUE",
    device_type: "Laptop",
    fault_code: null,
    software_name: null,
  },
  {
    id: "uuid-it-2",
    poster_id: "e3",
    assignee_id: null,
    type: "IT_TICKET",
    status: "RESOLVED",
    priority: "LOW",
    subject: "Need Photoshop installed",
    description: "I need Photoshop for the new design project.",
    information: null,
    ai_summary: null,
    poster_name: "Employee Three",
    assignee_name: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    request_type: "SOFTWARE_ISSUE",
    device_type: "Laptop",
    fault_code: null,
    software_name: "Adobe Photoshop",
  },
];

let mockItTickets: ItTicket[] = (() => {
  try {
    return (
      JSON.parse(sessionStorage.getItem("mockItTickets") || "null") ||
      defaultItTickets
    );
  } catch {
    return defaultItTickets;
  }
})();
const saveItTickets = () =>
  sessionStorage.setItem("mockItTickets", JSON.stringify(mockItTickets));

export async function fetchTickets(): Promise<Ticket[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...mockHrRequests, ...mockItTickets];
}

export async function fetchMyTickets(): Promise<Ticket[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [];
}
export async function fetchTicket(id: string): Promise<Ticket | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const department = id.includes("-hr-") ? "HR" : "IT";
  const source =
    department === "HR"
      ? mockHrRequests
      : department === "IT"
        ? mockItTickets
        : [];
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
  try {
    return (
      JSON.parse(sessionStorage.getItem("mockComments") || "null") ||
      defaultComments
    );
  } catch {
    return defaultComments;
  }
})();
const saveComments = () =>
  sessionStorage.setItem("mockComments", JSON.stringify(mockComments));

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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Ticket;

  if (data.type === "HR_REQUEST") {
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
  status: TicketStatus,
): Promise<Ticket | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const department = id.includes("-hr-") ? "HR" : "IT";
  if (department === "HR") {
    mockHrRequests = mockHrRequests.map((t) =>
      t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t,
    );
    saveHrRequests();
    return mockHrRequests.find((t) => t.id === id) || null;
  }
  if (department === "IT") {
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
  body: string,
): Promise<TicketComment> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const comment: TicketComment = {
    id: `comment-${Date.now()}`,
    ticket_id: ticketId,
    author_id: "0000", // adjust to however the mock module accesses the logged-in user
    body,
    created_at: new Date().toISOString(),
  };
  mockComments = [...mockComments, comment];
  saveComments();
  return comment;
}
