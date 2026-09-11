"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TextField,
  TextareaField,
  SelectField,
  DateField,
} from "../form/fields";
import { createTicket } from "../api";
import type { Ticket } from "../types";
import { useAuth } from "@/features/auth/auth-context";

const routeApi = getRouteApi("/_authenticated/ticket/submit");

const schema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  department: z.enum(["HR", "IT"], { message: "Department is required" }),
  priority: z.string(),
  request_type: z.string(),
  document_type: z.string().optional(),
  from_date: z.date().optional(),
  to_date: z.date().optional(),
  device_type: z.string().optional(),
  fault_code: z.string().optional(),
  software_name: z.string().optional(),
});

const DEPARTMENT_OPTIONS = [
  { value: "HR", label: "Human Resources (HR)" },
  { value: "IT", label: "Information Technology (IT)" },
];

const HR_REQUEST_OPTIONS = [
  { value: "LEAVE_REQUEST", label: "Leave Request" },
  { value: "DOCUMENT_REQUEST", label: "Document Request" },
];

const IT_REQUEST_OPTIONS = [
  { value: "HARDWARE_ISSUE", label: "Hardware Issue" },
  { value: "SOFTWARE_ISSUE", label: "Software Issue" },
];

const DOCUMENT_OPTIONS = [
  { value: "SALARY_CERTIFICATE", label: "Salary Certificate" },
  { value: "NOC", label: "NOC (No Objection Certificate)" },
];

export function TicketSubmissionPage() {
  const search = routeApi.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm({
    defaultValues: {
      subject: "",
      description: "",
      department: search.department || "",
      priority: "MEDIUM",
      request_type: search.requestType || search.ticketType || "",
      document_type: undefined as string | undefined,
      from_date: undefined as Date | undefined,
      to_date: undefined as Date | undefined,
      device_type: undefined as string | undefined,
      fault_code: undefined as string | undefined,
      software_name: undefined as string | undefined,
    },
    validators: {
      // @ts-expect-error Zod optional properties mismatch with required properties in defaultValues
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      const newTicket = await createTicket({
        ...value,
        from_date: value.from_date
          ? format(value.from_date, "dd/MM/yyyy")
          : undefined,
        to_date: value.to_date
          ? format(value.to_date, "dd/MM/yyyy")
          : undefined,
        type: value.department === "HR" ? "HR_REQUEST" : "IT_TICKET",
        priority: value.priority as "LOW" | "MEDIUM" | "HIGH",
        poster_id: user?.id,
        poster_name: user?.name,
      } as unknown as Partial<Ticket>);
      navigate({
        to: "/ticket/$ticketId",
        params: { ticketId: newTicket.id },
        search: { department: newTicket.type === "HR_REQUEST" ? "HR" : "IT" },
      });
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Submit a Request</CardTitle>
          <CardDescription>
            Fill out the form below to submit a new ticket to the HR or IT
            department.
          </CardDescription>
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
              {(field) => (
                <TextField
                  field={field}
                  label="Subject"
                  placeholder="Brief summary of the issue or request"
                />
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <TextareaField
                  field={field}
                  label="Description"
                  placeholder="Please provide details..."
                  className="min-h-25"
                />
              )}
            </form.Field>

            <form.Field name="department">
              {(field) => (
                <SelectField
                  field={field}
                  label="Department"
                  placeholder="Select department"
                  options={DEPARTMENT_OPTIONS}
                />
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values}>
              {(values) => {
                const department = values.department;
                const requestType = values.request_type;

                return (
                  <>
                    {/* HR Specific Fields */}
                    {department === "HR" && (
                      <div className="space-y-6 p-4 border rounded-md bg-muted/20">
                        <form.Field name="request_type">
                          {(field) => (
                            <SelectField
                              field={field}
                              label="Request Type"
                              placeholder="Select request type"
                              options={HR_REQUEST_OPTIONS}
                            />
                          )}
                        </form.Field>

                        {requestType === "LEAVE_REQUEST" && (
                          <div className="grid grid-cols-2 gap-4">
                            <form.Field name="from_date">
                              {(field) => (
                                <DateField field={field} label="From Date" />
                              )}
                            </form.Field>
                            <form.Field name="to_date">
                              {(field) => (
                                <DateField field={field} label="To Date" />
                              )}
                            </form.Field>
                          </div>
                        )}

                        {requestType === "DOCUMENT_REQUEST" && (
                          <form.Field name="document_type">
                            {(field) => (
                              <SelectField
                                field={field}
                                label="Document Type"
                                placeholder="Select document"
                                options={DOCUMENT_OPTIONS}
                              />
                            )}
                          </form.Field>
                        )}
                      </div>
                    )}

                    {/* IT Specific Fields */}
                    {department === "IT" && (
                      <div className="space-y-6 p-4 border rounded-md bg-muted/20">
                        <form.Field name="request_type">
                          {(field) => (
                            <SelectField
                              field={field}
                              label="Ticket Type"
                              placeholder="Select ticket type"
                              options={IT_REQUEST_OPTIONS}
                            />
                          )}
                        </form.Field>

                        {requestType === "HARDWARE_ISSUE" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <form.Field name="device_type">
                              {(field) => (
                                <TextField
                                  field={field}
                                  label="Device Type"
                                  placeholder="e.g. Laptop, Monitor"
                                />
                              )}
                            </form.Field>
                            <form.Field name="fault_code">
                              {(field) => (
                                <TextField
                                  field={field}
                                  label="Fault Code"
                                  placeholder="e.g. E012"
                                  maxLength={4}
                                />
                              )}
                            </form.Field>
                          </div>
                        )}

                        {requestType === "SOFTWARE_ISSUE" && (
                          <form.Field name="software_name">
                            {(field) => (
                              <TextField
                                field={field}
                                label="Software Name"
                                placeholder="e.g. Microsoft Outlook, Slack"
                              />
                            )}
                          </form.Field>
                        )}
                      </div>
                    )}
                  </>
                );
              }}
            </form.Subscribe>

            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
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
