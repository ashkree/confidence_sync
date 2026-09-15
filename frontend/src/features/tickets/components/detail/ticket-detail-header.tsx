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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold break-words">
              {ticket.subject}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Created {formatDate(ticket.created_at)}
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap shrink-0">
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
            <div className="min-w-0">
              <span className="font-medium block">Poster</span>
              <p className="text-muted-foreground truncate">
                {ticket.poster_name ?? "Unknown"}
              </p>
            </div>
          )}
          {showAssignee && (
            <div className="min-w-0">
              <span className="font-medium block">Assignee</span>
              <p className="text-muted-foreground truncate">
                {assigneeName || "Unassigned"}
              </p>
            </div>
          )}
          <div className="min-w-0">
            <span className="font-medium block">Department</span>
            <p className="text-muted-foreground truncate">
              {ticket.type === "HR_REQUEST"
                ? "Human Resources"
                : "Information Technology"}
            </p>
          </div>
          <div className="min-w-0">
            <span className="font-medium block">Updated</span>
            <p className="text-muted-foreground truncate">
              {formatDate(updatedAt ?? ticket.updated_at)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
