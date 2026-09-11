import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
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
      onSubmit: baseSchema.extend(module.schema.shape),
    },
    onSubmit: async ({ value }) => {
      const payload = module.toPayload(value as any);
      const ticket = await createTicket(payload as any);
      navigate({ to: "/ticket/$ticketId", params: { ticketId: ticket.id } });
    },
  });
}
