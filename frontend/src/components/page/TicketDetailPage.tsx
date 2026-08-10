import { useState, useEffect } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useAuth } from "@/auth";
import { usePermissions } from "@/hooks/usePermission";
import {
  fetchTicketComments,
  addTicketComment,
  updateTicketStatus,
} from "@/api/tickets";
import { getPriorityColor, getStatusColor } from "@/lib/ticket-colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { TicketStatus, TicketComment } from "@/types";

const routeApi = getRouteApi("/_authenticated/ticket/$ticketId");

export function TicketDetailPage() {
  const ticket = routeApi.useLoaderData();
  const { user } = useAuth();
  const { hasRole } = usePermissions();
  const isAdmin = hasRole("ADMIN");

  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [currentStatus, setCurrentStatus] = useState<TicketStatus>(
    (ticket?.status as TicketStatus) || "OPEN",
  );

  useEffect(() => {
    if (ticket) {
      fetchTicketComments(ticket.id).then(setComments);
    }
  }, [ticket]);

  if (!ticket) {
    // Show a not-found state
    return <div className="container mx-auto p-6">...</div>;
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    // Using a simplistic addTicketComment call for the stub
    const addedComment = await addTicketComment(ticket.id, newComment);

    if (addedComment) {
      setComments((prev) => [...prev, addedComment]);
      setNewComment("");
    }
  };

  const handleStatusUpdate = async () => {
    await updateTicketStatus(ticket.id, currentStatus);
    // Ideally we would refresh or update the local ticket status here
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Back link */}
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Created {format(new Date(ticket.created_at), "PPP")}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "capitalize font-semibold",
                  getStatusColor(ticket.status),
                )}
              >
                {ticket.status}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize font-semibold",
                  getPriorityColor(ticket.priority),
                )}
              >
                {ticket.priority}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Description</h3>
            <p className="text-sm text-muted-foreground">
              {ticket.description}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Poster</span>
              <p className="text-muted-foreground">{ticket.poster_name}</p>
            </div>
            <div>
              <span className="font-medium">Assignee</span>
              <p className="text-muted-foreground">
                {ticket.assignee_name || "Unassigned"}
              </p>
            </div>
            <div>
              <span className="font-medium">Type</span>
              <p className="text-muted-foreground capitalize">
                {ticket.type.replace("_", " ")}
              </p>
            </div>
            <div>
              <span className="font-medium">Updated</span>
              <p className="text-muted-foreground">
                {format(new Date(ticket.updated_at), "PPP")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Status Change - only visible to admins */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select
                value={currentStatus}
                onValueChange={(val) => setCurrentStatus(val as TicketStatus)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleStatusUpdate}>Update Status</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-3 rounded-lg bg-muted/50"
              >
                <User className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(comment.created_at), "PPp")}
                    </span>
                  </div>
                  <p className="text-sm">{comment.body}</p>
                </div>
              </div>
            ))
          )}
          <Separator />
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              Add Comment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
