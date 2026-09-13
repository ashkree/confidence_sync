import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { createTicket } from "../api";
import { baseSchema, baseDefaults } from "./schema";
import type { RequestTypeModule } from "./types";

export function useTicketForm<TExtra extends Record<string, unknown>>(
  module: RequestTypeModule<TExtra>,
) {
  const navigate = useNavigate();

  return useForm({
    defaultValues: { ...baseDefaults, ...module.defaults },
    validators: {
      onSubmit: baseSchema.extend(module.schema.shape) as any,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = module.toPayload(value as any);
        const ticket = await createTicket(payload);
        navigate({
          to: "/ticket/$ticketId",
          params: { ticketId: ticket.id },
          state: { createdTicket: ticket },
        });
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data) {
          const data = err.response.data;
          if (Array.isArray(data.detail)) {
            const messages = data.detail
              .map((d: any) => d.msg || JSON.stringify(d))
              .join(", ");
            alert(`Validation error: ${messages}`);
          } else if (typeof data.detail === "string") {
            alert(data.detail);
          } else {
            alert("Failed to submit ticket. Please try again.");
          }
        } else {
          alert("Failed to submit ticket. Please try again.");
        }
        throw err;
      }
    },
  });
}
