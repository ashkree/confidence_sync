import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { FileText } from "lucide-react";
import { useTicketDetail } from "../../context/ticket-detail";
import { useTicketVisibility } from "../../hooks/use-ticket-visibility";

export function TicketDetailSummarySection() {
  const { summary } = useTicketDetail();
  const { showAiSummary, showInformation } = useTicketVisibility();

  const showSummaryCard = showAiSummary;
  const showInformationCard = showInformation;

  if (!showSummaryCard && !showInformationCard) {
    return null;
  }

  return (
    <section className="space-y-6">
      {/* Summary Card */}
      {showSummaryCard && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Summary</CardTitle>
              {summary.isRefreshing && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  Updating…
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {summary.summary ? (
              <Markdown className="text-muted-foreground">
                {summary.summary}
              </Markdown>
            ) : summary.isEnriching ? (
              <div className="space-y-2 animate-pulse py-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                <FileText className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">Summary unavailable.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Information Card — visible to admin even if not yet available, matching summary states */}
      {showInformationCard && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Information</CardTitle>
              {summary.isRefreshing && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  Updating…
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {summary.information ? (
              <Markdown className="text-muted-foreground">
                {summary.information}
              </Markdown>
            ) : summary.isEnriching ? (
              <div className="space-y-2 animate-pulse py-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                <FileText className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">Information unavailable.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

// Support alternative name if referenced elsewhere
export { TicketDetailSummarySection as TicketDetailSummaryCard };
