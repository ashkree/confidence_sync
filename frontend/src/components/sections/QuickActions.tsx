import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { AppWindow, Bed, Cpu, FileCheckCorner } from "lucide-react";
import type { RequestTypeSlug } from "@/features/tickets/catalog";

const quick_actions: {
  icon: typeof Bed;
  name: string;
  slug: RequestTypeSlug;
}[] = [
  {
    icon: Bed,
    name: "Leave Request",
    slug: "leave-request",
  },
  {
    icon: FileCheckCorner,
    name: "Document Request",
    slug: "document-request",
  },
  {
    icon: Cpu,
    name: "Hardware Issue",
    slug: "hardware-issue",
  },
  {
    icon: AppWindow,
    name: "Software Issue",
    slug: "software-issue",
  },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {quick_actions.map((action) => (
          <Link
            key={action.slug}
            to="/ticket/submit/$requestType"
            params={{ requestType: action.slug }}
          >
            <Button className="w-full justify-start min-w-0" variant="outline">
              <action.icon />
              <span className="truncate"> {action.name} </span>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
