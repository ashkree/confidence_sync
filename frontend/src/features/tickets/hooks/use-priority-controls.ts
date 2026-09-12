// frontend/src/features/tickets/hooks/use-priority-controls.ts
import { useCallback, useMemo, useState } from "react";

import { updateTicketPriority } from "../api";
import type { Ticket, TicketPriority } from "../types";

export function usePriorityControls(
  ticket: Ticket,
  onTouched: (updatedAt: string) => void,
) {
  const [value, setValue] = useState<TicketPriority>(
    ticket.priority ?? "MEDIUM",
  );
  const [draft, setDraft] = useState<TicketPriority>(
    ticket.priority ?? "MEDIUM",
  );
  const [isPending, setIsPending] = useState(false);

  const update = useCallback(async () => {
    // Guards a double-click firing two identical requests.
    if (isPending) return;

    setIsPending(true);
    try {
      const updated = await updateTicketPriority(ticket.id, draft);
      if (updated) {
        setValue(updated.priority as TicketPriority);
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
