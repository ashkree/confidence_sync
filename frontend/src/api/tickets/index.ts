import * as mock from "./tickets.mock";
import * as service from "./tickets.service";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

export const {
  fetchMyTickets,
  fetchTickets,
  fetchTicket,
  createTicket,
  updateTicketStatus,
  fetchTicketComments,
  addTicketComment,
} = useMock ? mock : service;
