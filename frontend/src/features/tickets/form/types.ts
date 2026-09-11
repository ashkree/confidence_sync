import type { z } from "zod";
import type { BaseValues } from "./schema";

export interface ItTicketCreatePayload {
  type: "IT_TICKET";
  subject: string;
  description: string;
  request_type: "HARDWARE_ISSUE" | "SOFTWARE_ISSUE";
  device_type?: string;
  fault_code?: string;
  software_name?: string;
}

export interface HrRequestCreatePayload {
  type: "HR_REQUEST";
  subject: string;
  description: string;
  request_type: "LEAVE_REQUEST" | "DOCUMENT_REQUEST";
  document_type?: "NOC" | "SALARY_CERTIFICATE";
  from_date?: string; // "dd/MM/yyyy"
  to_date?: string;   // "dd/MM/yyyy"
}

export type TicketCreatePayload = ItTicketCreatePayload | HrRequestCreatePayload;

export interface RequestTypeModule<TExtra extends Record<string, unknown>> {
  defaults: TExtra;
  schema: z.ZodObject<z.ZodRawShape>;
  Fields: React.ComponentType<{ form: any }>;
  toPayload: (values: BaseValues & TExtra) => TicketCreatePayload;
}
