import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function PendingRequestsSection() {
  return (
    <Card>
      <CardHeader className="items-center flex justify-between">
        <CardTitle>My Requests</CardTitle>
        <CardAction>
          <Button variant="outline">
            <Plus />
            <span>New Request</span>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </CardContent>
    </Card>
  );
}
