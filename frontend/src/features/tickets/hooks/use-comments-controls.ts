// frontend/src/features/tickets/hooks/use-comments-controls.ts
import { useCallback, useMemo, useState } from "react";

import { addTicketComment, fetchTicket } from "../api";
import { useAuth } from "@/features/auth/auth-context";
import type { Ticket, TicketComment } from "../types";

export function useCommentsControls(
  ticket: Ticket,
  initialComments: TicketComment[],
  onTouched: (updatedAt: string) => void,
  onSummaryRefresh: (summary: string | null) => void,
) {
  const { user } = useAuth();
  const [comments, setComments] = useState<TicketComment[]>(
    initialComments ?? [],
  );
  const [draft, setDraft] = useState("");
  const [isPending, setIsPending] = useState(false);

  const submit = useCallback(async () => {
    if (!draft.trim() || !user || isPending) return;

    setIsPending(true);
    try {
      const addedComment = await addTicketComment(ticket.id, draft.trim());
      if (addedComment) {
        setComments((prev) => [...prev, addedComment]);
        setDraft("");

        // The backend regenerates the AI summary on every comment, but the
        // comment endpoint only returns the comment — re-fetch the ticket
        // to pick up the refreshed summary.
        const refreshed = await fetchTicket(ticket.id);
        if (refreshed) {
          onSummaryRefresh(refreshed.ai_summary ?? null);
          onTouched(refreshed.updated_at);
        }
      }
    } finally {
      setIsPending(false);
    }
  }, [ticket.id, draft, user, isPending, onTouched, onSummaryRefresh]);

  return useMemo(
    () => ({ comments, draft, setDraft, isPending, submit }),
    [comments, draft, isPending, submit],
  );
}
