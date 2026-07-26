import type { Ticket, HrRequest, ItTicket } from "@/types";

const mockHrRequests: HrRequest[] = [
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    request_type: "document_request",
    document_type: "salary_certificate",
    from_date: null,
    to_date: null,
  },
];

const mockItTickets: ItTicket[] = [
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    request_type: "software_issue",
    device_type: "Laptop",
    fault_code: null,
    software_name: "Adobe Photoshop",
  },
];

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
