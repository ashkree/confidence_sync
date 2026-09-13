import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/date";
import { PriorityBadge, StatusBadge } from "../ticket-badges";
import { useTicketVisibility } from "../../hooks/use-ticket-visibility";
import { CATALOG_BY_REQUEST_TYPE } from "../../catalog";
import { useTicketDetail } from "../../context/ticket-detail";
import { TicketDetailFields } from "../ticket-detail-fields";

export function TicketDetailHeaderCard() {
  const { ticket, updatedAt, status, priority, assignee } = useTicketDetail();
  const { showPriority, showAssignee, showPoster } = useTicketVisibility();
  const meta = CATALOG_BY_REQUEST_TYPE[ticket.request_type];

  const currentStatus = status.value;
  const currentPriority = priority.value;
  const assigneeName = assignee.assigneeName;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Created {formatDate(ticket.created_at)}
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {meta && (
              <Badge variant="secondary" className="font-semibold">
                {meta.label}
              </Badge>
            )}
            {/* Badges read from state so they update immediately after admin actions */}
            <StatusBadge value={currentStatus} />
            {showPriority && currentPriority && (
              <PriorityBadge value={currentPriority} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        <TicketDetailFields ticket={ticket} />

        <Separator />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {showPoster && (
            <div>
              <span className="font-medium">Poster</span>
              <p className="text-muted-foreground">
                {ticket.poster_name ?? "Unknown"}
              </p>
            </div>
          )}
          {showAssignee && (
            <div>
              <span className="font-medium">Assignee</span>
              <p className="text-muted-foreground">
                {assigneeName || "Unassigned"}
              </p>
            </div>
          )}
          <div>
            <span className="font-medium">Department</span>
            <p className="text-muted-foreground">
              {ticket.type === "HR_REQUEST"
                ? "Human Resources"
                : "Information Technology"}
            </p>
          </div>
          <div>
            <span className="font-medium">Updated</span>
            <p className="text-muted-foreground">
              {formatDate(updatedAt ?? ticket.updated_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
