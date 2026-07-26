import * as mock from "./tickets.mock";
import * as service from "./tickets.service";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

export const { fetchTickets, fetchTicket } = useMock ? mock : service;
