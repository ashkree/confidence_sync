import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Ticket } from "@/types";
import { cn } from "@/lib/utils";
import { getPriorityColor, getStatusColor } from "@/lib/ticket-colors";

export default function PendingRequestsSection({ tickets = [] }: { tickets?: Ticket[] }) {
  return (
    <Card>
      <CardHeader className="items-center flex justify-between">
        <CardTitle>My Requests</CardTitle>
        <CardAction>
          <Link to="/ticket/submit">
            <Button variant="outline">
              <Plus />
              <span>New Request</span>
            </Button>
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No pending requests.</p>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to="/ticket/$ticketId"
              params={{ ticketId: ticket.id }}
              search={{ department: ticket.type === "HR_REQUEST" ? "HR" : "IT" }}
              className="block"
            >
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground capitalize">{ticket.type.replace("_", " ")}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={cn("capitalize text-xs font-semibold", getStatusColor(ticket.status))}>{ticket.status}</Badge>
                  <Badge variant="outline" className={cn("capitalize text-xs font-semibold", getPriorityColor(ticket.priority))}>{ticket.priority}</Badge>
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
