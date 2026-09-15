import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UserCheck, UserMinus } from "lucide-react";
import type { TicketPriority, TicketStatus } from "../../types";
import { useTicketDetail } from "../../context/ticket-detail";
import { useTicketVisibility } from "../../hooks/use-ticket-visibility";

export function TicketDetailAdminControlsCard() {
  const { status, priority, assignee } = useTicketDetail();
  const { showAdminControls } = useTicketVisibility();

  if (!showAdminControls) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Admin Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-medium sm:w-20 sm:shrink-0">Status</span>
          <Select
            value={status.draft}
            onValueChange={(val) => status.setDraft(val as TicketStatus)}
          >
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={status.update} disabled={status.isPending} className="w-full sm:w-auto">
            {status.isPending ? "Updating..." : "Update"}
          </Button>
        </div>

        <Separator />

        {/* Priority row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-medium sm:w-20 sm:shrink-0">Priority</span>
          <Select
            value={priority.draft}
            onValueChange={(val) => priority.setDraft(val as TicketPriority)}
          >
            <SelectTrigger className="w-full sm:w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={priority.update} disabled={priority.isPending} className="w-full sm:w-auto">
            {priority.isPending ? "Updating..." : "Update"}
          </Button>
        </div>

        <Separator />

        {/* Assignee row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-medium sm:w-20 sm:shrink-0">Assignee</span>
          <p className="text-sm text-muted-foreground flex-1">
            {assignee.assigneeName || "Unassigned"}
          </p>
          <Button
            variant="outline"
            onClick={assignee.toggle}
            disabled={assignee.isPending}
            className="w-full sm:w-auto"
          >
            {assignee.isPending ? (
              "Updating..."
            ) : assignee.isAssignedToMe ? (
              <>
                <UserMinus className="w-4 h-4 mr-2" />
                Unassign
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 mr-2" />
                Assign to me
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
