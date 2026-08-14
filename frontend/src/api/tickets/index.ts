import * as mock from "./tickets.mock";
import * as service from "./tickets.service";
import { USE_MOCK_DATA } from "@/lib/env";

const useMock = USE_MOCK_DATA;

export const {
  fetchMyTickets,
  fetchTickets,
  fetchTicket,
  createTicket,
  updateTicketStatus,
  updateTicketPriority,
  fetchTicketComments,
  addTicketComment,
  assignTicket,
} = useMock ? mock : service;
