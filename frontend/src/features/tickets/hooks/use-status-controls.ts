// frontend/src/features/tickets/hooks/use-status-controls.ts
import { useCallback, useMemo, useState } from "react";

import { updateTicketStatus } from "../api";
import type { Ticket, TicketStatus } from "../types";

export function useStatusControls(
  ticket: Ticket,
  onTouched: (updatedAt: string) => void,
) {
  const [value, setValue] = useState<TicketStatus>(ticket.status);
  const [draft, setDraft] = useState<TicketStatus>(ticket.status);
  const [isPending, setIsPending] = useState(false);

  const update = useCallback(async () => {
    // Guards a double-click firing two identical requests.
    if (isPending) return;

    setIsPending(true);
    try {
      const updated = await updateTicketStatus(ticket.id, draft);
      if (updated) {
        setValue(updated.status);
        onTouched(updated.updated_at);
      }
    } finally {
      setIsPending(false);
    }
  }, [ticket.id, draft, isPending, onTouched]);

  const isDirty = draft !== value;

  return useMemo(
    () => ({ value, draft, setDraft, isDirty, isPending, update }),
    [value, draft, isDirty, isPending, update],
  );
}
