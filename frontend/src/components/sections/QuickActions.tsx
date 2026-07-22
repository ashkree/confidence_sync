import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { AppWindow, Bed, Cpu, FileCheckCorner } from "lucide-react";

const quick_actions = [
  {
    icon: Bed,
    name: "Leave Request",
  },
  {
    icon: FileCheckCorner,
    name: "Document Request",
  },
  {
    icon: Cpu,
    name: "Hardware Issue",
  },
  {
    icon: AppWindow,
    name: "Software Issue",
  },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-4 gap-2">
        {quick_actions.map((action) => (
          <Link to="/employee/ticket/submit">
            <Button className="w-full justify-start" variant="outline">
              <action.icon />
              <span> {action.name} </span>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
