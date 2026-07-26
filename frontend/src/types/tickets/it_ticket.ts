import type { Ticket } from "./ticket";
export type ItRequestType = "hardware_issue" | "software_issue";

export interface ItTicket extends Ticket {
  type: "it_ticket";
  request_type: ItRequestType;
  device_type: string | null;
  fault_code: string | null;
  software_name: string | null;
}
