// frontend/src/features/tickets/context/ticket-detail.tsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { summarizeTicket } from "../api";
import { useAssigneeControls } from "../hooks/use-assignee-controls";
import { useCommentsControls } from "../hooks/use-comments-controls";
import { usePriorityControls } from "../hooks/use-priority-controls";
import { useStatusControls } from "../hooks/use-status-controls";
import type { Ticket, TicketComment } from "../types";

interface TicketDetailContextValue {
  ticket: Ticket;
  updatedAt: string;
  status: ReturnType<typeof useStatusControls>;
  priority: ReturnType<typeof usePriorityControls>;
  assignee: ReturnType<typeof useAssigneeControls>;
  comments: ReturnType<typeof useCommentsControls>;
  aiSummary: string | null;
  isSummarizing: boolean;
  handleSummarize: () => Promise<void>;
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
  const [aiSummary, setAiSummary] = useState<string | null>(
    initial.ai_summary ?? null,
  );
  const [isSummarizing, setIsSummarizing] = useState(false);

  const status = useStatusControls(initial, setUpdatedAt);
  const priority = usePriorityControls(initial, setUpdatedAt);
  const assignee = useAssigneeControls(initial, setUpdatedAt);
  const comments = useCommentsControls(
    initial,
    initialComments,
    setUpdatedAt,
    setAiSummary,
  );

  const handleSummarize = useCallback(async () => {
    if (isSummarizing) return;

    setIsSummarizing(true);
    try {
      const updated = await summarizeTicket(initial.id);
      if (updated?.ai_summary) {
        setAiSummary(updated.ai_summary);
        setUpdatedAt(updated.updated_at);
      }
    } finally {
      setIsSummarizing(false);
    }
  }, [initial.id, isSummarizing]);

  const value = useMemo(
    () => ({
      ticket: initial,
      updatedAt,
      status,
      priority,
      assignee,
      comments,
      aiSummary,
      isSummarizing,
      handleSummarize,
    }),
    [
      initial,
      updatedAt,
      status,
      priority,
      assignee,
      comments,
      aiSummary,
      isSummarizing,
      handleSummarize,
    ],
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
