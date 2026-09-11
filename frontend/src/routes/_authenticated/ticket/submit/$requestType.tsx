import { createFileRoute, redirect, useBlocker } from "@tanstack/react-router";
import { CATALOG, type RequestTypeSlug } from "@/features/tickets/form/catalog";
import { REGISTRY } from "@/features/tickets/form/registry";
import { useTicketForm } from "@/features/tickets/form/use-ticket-form";
import { TicketFormShell } from "@/features/tickets/form/ticket-form-shell";

export const Route = createFileRoute(
  "/_authenticated/ticket/submit/$requestType",
)({
  beforeLoad: ({ params }) => {
    if (!(params.requestType in CATALOG)) {
      throw redirect({ to: "/ticket/submit" });
    }
  },
  component: TicketSubmitFormPage,
});

function TicketSubmitFormPage() {
  const { requestType } = Route.useParams();
  const slug = requestType as RequestTypeSlug;
  const meta = CATALOG[slug];
  const module = REGISTRY[slug];
  const form = useTicketForm(module);

  useBlocker({
    shouldBlockFn: () => {
      if (form.state.isDirty && !form.state.isSubmitted) {
        return !window.confirm(
          "You have unsaved changes. Are you sure you want to leave?",
        );
      }
      return false;
    },
    enableBeforeUnload: () => form.state.isDirty && !form.state.isSubmitted,
  });

  return (
    <TicketFormShell meta={meta} form={form}>
      <module.Fields form={form} />
    </TicketFormShell>
  );
}
