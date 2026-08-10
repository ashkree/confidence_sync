import type { Ticket } from "./ticket";
export type ItRequestType = "HARDWARE_ISSUE" | "SOFTWARE_ISSUE";

export interface ItTicket extends Ticket {
  type: "IT_TICKET";
  request_type: ItRequestType;
  device_type: string | null;
  fault_code: string | null;
  software_name: string | null;
}
