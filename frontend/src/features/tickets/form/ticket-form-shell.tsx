import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField, TextareaField } from "./fields";
import type { RequestTypeMeta } from "./catalog";

export function TicketFormShell({
  meta,
  form,
  children,
}: {
  meta: RequestTypeMeta;
  form: any;
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-4">
        <Link
          to="/ticket/submit"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Not the right request type?
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{meta.label}</CardTitle>
          <CardDescription>{meta.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field name="subject">
              {(field: any) => (
                <TextField
                  field={field}
                  label="Subject"
                  placeholder="Brief summary of the issue or request"
                />
              )}
            </form.Field>

            <form.Field name="description">
              {(field: any) => (
                <TextareaField
                  field={field}
                  label="Description"
                  placeholder="Please provide details..."
                  className="min-h-25"
                />
              )}
            </form.Field>

            {children}

            <form.Subscribe selector={(state: any) => state.canSubmit}>
              {(canSubmit: boolean) => (
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full sm:w-auto"
                >
                  Submit Request
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
