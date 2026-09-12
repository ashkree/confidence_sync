import { getRouteApi } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TicketDetailProvider } from "../context/ticket-detail";
import { TicketDetailHeaderCard } from "./detail/ticket-detail-header";
import { TicketDetailSummarySection } from "./detail/ticket-detail-summary-section";
import { TicketDetailAdminControlsCard } from "./detail/ticket-detail-admin-controls-card";
import { TicketCommentsSection } from "./detail/ticket-comments-section";

const routeApi = getRouteApi("/_authenticated/ticket/$ticketId");

export function TicketDetailPage() {
  const { ticket, initialComments } = routeApi.useLoaderData();

  if (!ticket) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">Ticket not found</p>
            <p className="text-sm mt-1">
              The requested ticket does not exist or you do not have permission
              to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TicketDetailProvider
      initial={ticket}
      initialComments={initialComments ?? []}
    >
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        {/* Back link */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <TicketDetailHeaderCard />
        <TicketDetailSummarySection />
        <TicketDetailAdminControlsCard />
        <TicketCommentsSection />
      </div>
    </TicketDetailProvider>
  );
}
