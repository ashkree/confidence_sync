import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Clock, User } from "lucide-react";
import { formatDate } from "@/lib/date";
import { useTicketDetail } from "../../context/ticket-detail";

export function TicketCommentsSection() {
  const { comments } = useTicketDetail();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          comments.comments.map((comment) => (
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
            value={comments.draft}
            onChange={(e) => comments.setDraft(e.target.value)}
          />
          <Button
            onClick={comments.submit}
            disabled={!comments.draft.trim() || comments.isPending}
          >
            {comments.isPending ? "Submitting..." : "Add Comment"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
