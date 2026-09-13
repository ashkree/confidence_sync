// frontend/src/features/tickets/hooks/use-comments-controls.ts
import { useCallback, useMemo, useState } from "react";

import { addTicketComment } from "../api";
import { useAuth } from "@/features/auth/auth-context";
import type { TicketComment } from "../types";

export function useCommentsControls(
  ticketId: string,
  initialComments: TicketComment[],
  onPosted: () => void,
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
      const addedComment = await addTicketComment(ticketId, draft.trim());
      if (addedComment) {
        setComments((prev) => [...prev, addedComment]);
        setDraft("");
        onPosted(); // re-arm the summary poll
      }
    } finally {
      setIsPending(false);
    }
  }, [ticketId, draft, user, isPending, onPosted]);

  return useMemo(
    () => ({ comments, draft, setDraft, isPending, submit }),
    [comments, draft, isPending, submit],
  );
}
