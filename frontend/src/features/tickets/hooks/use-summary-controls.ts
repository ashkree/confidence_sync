// frontend/src/features/tickets/hooks/use-summary-controls.ts
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { fetchTicketEnrichment } from "../api";
import type { Ticket } from "../types";

const POLL_INTERVAL_MS = 2_000;
const MAX_POLLS = 20; // ~40s

export function useSummaryControls(ticket: Ticket) {
  // The baseline summary against which we check for changes.
  // On creation this is null; after a comment this is updated to the existing summary text.
  const [baseline, setBaseline] = useState<string | null>(
    ticket.ai_summary ?? null,
  );
  const [isPolling, setIsPolling] = useState(ticket.ai_summary == null);
  const [attempts, setAttempts] = useState(0);

  const query = useQuery({
    queryKey: ["enrichment", ticket.id],
    queryFn: async () => {
      setAttempts((prev) => prev + 1);
      return await fetchTicketEnrichment(ticket.id);
    },
    enabled: isPolling,
    refetchInterval: (q) => {
      if (!isPolling) return false;
      const data = q.state.data;
      const settled = Boolean(data?.ready && data.summary !== baseline);
      if (settled) return false;
      if (attempts >= MAX_POLLS) return false;
      return POLL_INTERVAL_MS;
    },
  });

  const queryData = query.data;
  const isSettled = Boolean(queryData?.ready && queryData.summary !== baseline);
  const isTimedOut = attempts >= MAX_POLLS && !isSettled;
  const isEnriching = isPolling && !isSettled && !isTimedOut;
  const isRefreshing = isEnriching && baseline !== null;

  const summary = isSettled
    ? (queryData?.summary ?? baseline)
    : (baseline ?? queryData?.summary ?? null);

  const information =
    queryData?.next_steps ?? ticket.information ?? null;

  /** Re-arms polling against the current text. Called after a comment posts. */
  const refresh = useCallback(() => {
    setAttempts(0);
    setBaseline(summary);
    setIsPolling(true);
  }, [summary]);

  return useMemo(
    () => ({
      summary,
      information,
      isEnriching,
      isRefreshing,
      refresh,
    }),
    [summary, information, isEnriching, isRefreshing, refresh],
  );
}
