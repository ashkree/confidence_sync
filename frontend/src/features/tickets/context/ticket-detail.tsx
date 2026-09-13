// frontend/src/features/tickets/context/ticket-detail.tsx
import { createContext, useContext, useMemo, useState } from "react";

import { useAssigneeControls } from "../hooks/use-assignee-controls";
import { useCommentsControls } from "../hooks/use-comments-controls";
import { usePriorityControls } from "../hooks/use-priority-controls";
import { useStatusControls } from "../hooks/use-status-controls";
import { useSummaryControls } from "../hooks/use-summary-controls";
import type { Ticket, TicketComment } from "../types";

interface TicketDetailContextValue {
  ticket: Ticket;
  updatedAt: string;
  status: ReturnType<typeof useStatusControls>;
  priority: ReturnType<typeof usePriorityControls>;
  assignee: ReturnType<typeof useAssigneeControls>;
  comments: ReturnType<typeof useCommentsControls>;
  summary: ReturnType<typeof useSummaryControls>;
}

const TicketDetailContext = createContext<TicketDetailContextValue | null>(
  null,
);

export function TicketDetailProvider({
  initial,
  initialComments = [],
  children,
}: {
  initial: Ticket;
  initialComments?: TicketComment[];
  children: React.ReactNode;
}) {
  const [updatedAt, setUpdatedAt] = useState(initial.updated_at);

  const status = useStatusControls(initial, setUpdatedAt);
  const priority = usePriorityControls(initial, setUpdatedAt);
  const assignee = useAssigneeControls(initial, setUpdatedAt);
  const summary = useSummaryControls(initial);
  const comments = useCommentsControls(
    initial.id,
    initialComments,
    summary.refresh,
  );

  const value = useMemo(
    () => ({
      ticket: initial,
      updatedAt,
      status,
      priority,
      assignee,
      comments,
      summary,
    }),
    [initial, updatedAt, status, priority, assignee, comments, summary],
  );

  return <TicketDetailContext value={value}>{children}</TicketDetailContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTicketDetail() {
  const ctx = useContext(TicketDetailContext);
  if (ctx === null) {
    throw new Error(
      "useTicketDetail must be used within a TicketDetailProvider",
    );
  }
  return ctx;
}
