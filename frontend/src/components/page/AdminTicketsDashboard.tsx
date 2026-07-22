import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockTickets, TicketStatus, TicketPriority } from "@/lib/mockTickets";

export function AdminTicketsDashboard() {
  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "default";
      case "pending":
        return "secondary";
      case "resolved":
        return "outline";
      case "closed":
        return "destructive";
      default:
        return "default";
    }
  };

  const getPriorityBadgeVariant = (priority: TicketPriority) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatTicketType = (type: string) => {
    return type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Ticket Management</h1>
        <p className="text-muted-foreground">
          View and manage employee HR and IT requests.
        </p>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {ticket.id.split("-")[0]}
                </TableCell>
                <TableCell className="font-medium max-w-[300px] truncate" title={ticket.subject}>
                  {ticket.subject}
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground text-sm">
                    {formatTicketType(ticket.type)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(ticket.status)} className="capitalize">
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="capitalize">
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {format(new Date(ticket.created_at), "MMM d, yyyy")}
                </TableCell>
              </TableRow>
            ))}
            {mockTickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
