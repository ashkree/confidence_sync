import { useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import {
  fetchTicket,
  addTicketComment,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  summarizeTicket,
} from "../api";
import { getPriorityColor, getStatusColor } from "../lib/ticket-colors";
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
import {
  ArrowLeft,
  Clock,
  FileText,
  Sparkles,
  User,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { TicketPriority, TicketStatus, TicketComment } from "../types";
import { useAuth } from "@/features/auth/auth-context";
import { useTicketVisibility } from "../hooks/use-ticket-visibility";
import { TicketDetailFields } from "./ticket-detail-fields";
import { CATALOG_BY_REQUEST_TYPE } from "../catalog";
import { Markdown } from "@/components/ui/markdown";

const routeApi = getRouteApi("/_authenticated/ticket/$ticketId");

export function TicketDetailPage() {
  const { ticket, initialComments } = routeApi.useLoaderData();
  const { user } = useAuth();
  const {
    showPriority,
    showAssignee,
    showPoster,
    showInformation,
    showAiSummary,
    showAdminControls,
    canGenerateSummary,
  } = useTicketVisibility();

  const [comments, setComments] = useState<TicketComment[]>(initialComments ?? []);
  const [newComment, setNewComment] = useState("");

  // Track status, priority, and updatedAt reactively so header badges stay in sync
  const [currentStatus, setCurrentStatus] = useState<TicketStatus>(
    (ticket?.status as TicketStatus) || "OPEN",
  );
  const [currentPriority, setCurrentPriority] = useState<TicketPriority>(
    (ticket?.priority as TicketPriority) || "MEDIUM",
  );
  const [updatedAt, setUpdatedAt] = useState(ticket?.updated_at);

  // Track assignee reactively — driven fully from the API response after each action
  const [assigneeId, setAssigneeId] = useState<string | null>(
    ticket?.assignee_id ?? null,
  );
  const [assigneeName, setAssigneeName] = useState<string | null>(
    ticket?.assignee_name ?? null,
  );

  // A user is considered assigned to themselves when the ticket's assignee_id matches their own id
  const isAssignedToMe = !!user && !!assigneeId && assigneeId === user.id;

  // Track AI summary state
  const [aiSummary, setAiSummary] = useState<string | null>(
    ticket?.ai_summary ?? null,
  );
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Loading states for actions
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

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
              The requested ticket does not exist or you do not have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const meta = CATALOG_BY_REQUEST_TYPE[ticket.request_type];

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    setIsSubmittingComment(true);
    try {
      const addedComment = await addTicketComment(ticket.id, newComment);
      if (addedComment) {
        setComments((prev) => [...prev, addedComment]);
        setNewComment("");

        // The backend regenerates the AI summary on every comment, but the
        // comment endpoint only returns the comment — re-fetch the ticket
        // to pick up the refreshed summary.
        const refreshed = await fetchTicket(ticket.id);
        if (refreshed) {
          setAiSummary(refreshed.ai_summary ?? null);
          setUpdatedAt(refreshed.updated_at);
        }
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async () => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateTicketStatus(ticket.id, currentStatus);
      if (updated) {
        setCurrentStatus(updated.status as TicketStatus);
        setUpdatedAt(updated.updated_at);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityUpdate = async () => {
    setIsUpdatingPriority(true);
    try {
      const updated = await updateTicketPriority(ticket.id, currentPriority);
      if (updated) {
        setCurrentPriority(updated.priority as TicketPriority);
        setUpdatedAt(updated.updated_at);
      }
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  const handleAssign = async () => {
    setIsAssigning(true);
    try {
      // Toggle: assign to self if unassigned/assigned to someone else, unassign if already mine
      const newAssigneeId = isAssignedToMe ? null : (user?.id ?? null);
      const updated = await assignTicket(ticket.id, newAssigneeId);
      if (updated) {
        setAssigneeId(updated.assignee_id ?? null);
        setAssigneeName(updated.assignee_name ?? null);
      }
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const updated = await summarizeTicket(ticket.id);
      if (updated?.ai_summary) {
        setAiSummary(updated.ai_summary);
        setUpdatedAt(updated.updated_at);
      }
    } finally {
      setIsSummarizing(false);
    }
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
                Created {formatDate(ticket.created_at)}
              </p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              {meta && (
                <Badge variant="secondary" className="font-semibold">
                  {meta.label}
                </Badge>
              )}
              {/* Badges read from local state so they update immediately after admin actions */}
              <Badge
                variant="outline"
                className={cn(
                  "capitalize font-semibold",
                  getStatusColor(currentStatus),
                )}
              >
                {currentStatus}
              </Badge>
              {showPriority && currentPriority && (
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize font-semibold",
                    getPriorityColor(currentPriority),
                  )}
                >
                  {currentPriority}
                </Badge>
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

      {/* Summary Card */}
      {showAiSummary && (
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

      {/* Admin Controls — status, priority, and assignee in one consolidated card */}
      {showAdminControls && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admin Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status row */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-20 shrink-0">Status</span>
              <Select
                value={currentStatus}
                onValueChange={(val) => setCurrentStatus(val as TicketStatus)}
              >
                <SelectTrigger className="w-45">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleStatusUpdate} disabled={isUpdatingStatus}>
                {isUpdatingStatus ? "Updating..." : "Update"}
              </Button>
            </div>

            <Separator />

            {/* Priority row */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-20 shrink-0">
                Priority
              </span>
              <Select
                value={currentPriority}
                onValueChange={(val) =>
                  setCurrentPriority(val as TicketPriority)
                }
              >
                <SelectTrigger className="w-45">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handlePriorityUpdate}
                disabled={isUpdatingPriority}
              >
                {isUpdatingPriority ? "Updating..." : "Update"}
              </Button>
            </div>

            <Separator />

            {/* Assignee row */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-20 shrink-0">
                Assignee
              </span>
              <p className="text-sm text-muted-foreground flex-1">
                {assigneeName || "Unassigned"}
              </p>
              <Button
                variant="outline"
                onClick={handleAssign}
                disabled={isAssigning}
              >
                {isAssigning ? (
                  "Updating..."
                ) : isAssignedToMe ? (
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
                      {formatDate(comment.created_at)}
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
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? "Submitting..." : "Add Comment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
