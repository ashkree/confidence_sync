// frontend/src/features/tickets/hooks/use-assignee-controls.ts
import { useCallback, useMemo, useState } from "react";

import { assignTicket } from "../api";
import { useAuth } from "@/features/auth/auth-context";
import type { Ticket } from "../types";

export function useAssigneeControls(
  ticket: Ticket,
  onTouched: (updatedAt: string) => void,
) {
  const { user } = useAuth();
  const [assigneeId, setAssigneeId] = useState<string | null>(
    ticket.assignee_id ?? null,
  );
  const [assigneeName, setAssigneeName] = useState<string | null>(
    ticket.assignee_name ?? null,
  );
  const [isPending, setIsPending] = useState(false);

  const isAssignedToMe = Boolean(user && assigneeId && assigneeId === user.id);

  const toggle = useCallback(async () => {
    if (isPending) return;

    setIsPending(true);
    try {
      const newAssigneeId = isAssignedToMe ? null : (user?.id ?? null);
      const updated = await assignTicket(ticket.id, newAssigneeId);
      if (updated) {
        setAssigneeId(updated.assignee_id ?? null);
        setAssigneeName(updated.assignee_name ?? null);
        onTouched(updated.updated_at);
      }
    } finally {
      setIsPending(false);
    }
  }, [ticket.id, user, isAssignedToMe, isPending, onTouched]);

  return useMemo(
    () => ({ assigneeId, assigneeName, isAssignedToMe, isPending, toggle }),
    [assigneeId, assigneeName, isAssignedToMe, isPending, toggle],
  );
}
