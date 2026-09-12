import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { FileText, Sparkles } from "lucide-react";
import { useTicketDetail } from "../../context/ticket-detail";
import { useTicketVisibility } from "../../hooks/use-ticket-visibility";

export function TicketDetailSummarySection() {
  const { ticket, aiSummary, isSummarizing, handleSummarize } =
    useTicketDetail();
  const { showAiSummary, showInformation, canGenerateSummary } =
    useTicketVisibility();

  const showSummaryCard = showAiSummary;
  const showInformationCard = showInformation && !!ticket.information;

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
              {canGenerateSummary && !aiSummary && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isSummarizing ? "Generating..." : "Generate Summary"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {aiSummary ? (
              <Markdown className="text-muted-foreground">{aiSummary}</Markdown>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                <FileText className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm">No AI summary generated yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Information Card — only rendered when the field has content and role permits */}
      {showInformation && ticket.information && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Markdown className="text-muted-foreground">
              {ticket.information}
            </Markdown>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

// Support alternative name if referenced elsewhere
export { TicketDetailSummarySection as TicketDetailSummaryCard };
