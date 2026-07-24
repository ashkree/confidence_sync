import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/employee",
    reason: (search.reason as string) || "insufficient_permissions",
  }),
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const { redirect, reason } = Route.useSearch();

  const reasonMessages = {
    insufficient_role: "You do not have the required role to access this page.",
    insufficient_permissions:
      "You do not have the required permissions to access this page.",
    default: "You are not authorized to access this page.",
  };

  const message =
    reasonMessages[reason as keyof typeof reasonMessages] ||
    reasonMessages.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-3">
          <Link
            to="/employee"
            className={buttonVariants({ variant: "default", className: "w-full" })}
          >
            Go to Dashboard
          </Link>

          <Link
            to={redirect}
            className={buttonVariants({ variant: "secondary", className: "w-full" })}
          >
            Try Again
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
