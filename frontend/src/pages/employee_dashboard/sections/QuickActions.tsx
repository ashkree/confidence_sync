import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppWindow, Bed, Cpu, FileCheckCorner } from "lucide-react";

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-4 gap-2">
        <Button className="justify-start" variant="outline">
          <Bed />
          <span> Leave Request </span>
        </Button>
        <Button className="justify-start" variant="outline">
          <FileCheckCorner />
          <span> Document Request </span>
        </Button>
        <Button className="justify-start" variant="outline">
          <Cpu />
          <span> Hardware Fault </span>
        </Button>
        <Button className="justify-start" variant="outline">
          <AppWindow />
          <span> Software Issue </span>
        </Button>
      </CardContent>
    </Card>
  );
}
