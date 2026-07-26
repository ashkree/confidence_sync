"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { createTicket } from "@/api/tickets";
import type { Ticket } from "@/types";

const routeApi = getRouteApi("/_authenticated/ticket/submit");

const schema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  department: z.enum(["hr", "it"], { message: "Department is required" }),
  priority: z.string(),
  request_type: z.string(),
  document_type: z.string(),
  from_date: z.date().optional(),
  to_date: z.date().optional(),
  device_type: z.string(),
  fault_code: z.string(),
  software_name: z.string(),
});

export function TicketSubmissionPage() {
  const search = routeApi.useSearch();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      subject: "",
      description: "",
      department: search.department || "",
      priority: "medium",
      request_type: search.requestType || search.ticketType || "",
      document_type: "",
      from_date: undefined as Date | undefined,
      to_date: undefined as Date | undefined,
      device_type: "",
      fault_code: "",
      software_name: "",
    },
    validators: {
      // @ts-expect-error Zod optional properties mismatch with required properties in defaultValues
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      const newTicket = await createTicket({
        ...value,
        type: value.department === "hr" ? "hr_request" : "it_ticket",
        priority: value.priority as "low" | "medium" | "high" | "critical",
      } as unknown as Partial<Ticket>);
      navigate({ to: `/ticket/${newTicket.id}` });
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
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Subject</FieldLabel>
                    <FieldContent>
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Brief summary of the issue or request"
                      />
                    </FieldContent>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="description">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Description</FieldLabel>
                    <FieldContent>
                      <Textarea
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Please provide details..."
                        className="min-h-[100px]"
                      />
                    </FieldContent>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="department">
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel>Department</FieldLabel>
                    <FieldContent>
                      <Select
                        value={field.state.value}
                        onValueChange={(val) => field.handleChange(val || "")}
                      >
                        <SelectTrigger className="w-full" aria-invalid={isInvalid}>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hr">Human Resources (HR)</SelectItem>
                          <SelectItem value="it">Information Technology (IT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Subscribe selector={(state) => state.values}>
              {(values) => {
                const department = values.department;
                const requestType = values.request_type;

                return (
                  <>
                    {/* HR Specific Fields */}
                    {department === "hr" && (
                      <div className="space-y-6 p-4 border rounded-md bg-muted/20">
                        <form.Field name="request_type">
                          {(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel>Request Type</FieldLabel>
                                <FieldContent>
                                  <Select
                                    value={field.state.value}
                                    onValueChange={(val) => field.handleChange(val || "")}
                                  >
                                    <SelectTrigger className="w-full" aria-invalid={isInvalid}>
                                      <SelectValue placeholder="Select request type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="leave_request">Leave Request</SelectItem>
                                      <SelectItem value="document_request">Document Request</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FieldContent>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        {requestType === "leave_request" && (
                          <div className="grid grid-cols-2 gap-4">
                            <form.Field name="from_date">
                              {(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel>From Date</FieldLabel>
                                    <FieldContent>
                                      <Popover>
                                        {/* @ts-expect-error Base UI doesn't strongly type asChild */}
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant={"outline"}
                                            className={cn(
                                              "w-full justify-start text-left font-normal",
                                              !field.state.value && "text-muted-foreground",
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.state.value ? (
                                              format(field.state.value, "PPP")
                                            ) : (
                                              <span>Pick a date</span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                            mode="single"
                                            selected={field.state.value}
                                            onSelect={(date) => field.handleChange(date)}
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </FieldContent>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                  </Field>
                                );
                              }}
                            </form.Field>
                            <form.Field name="to_date">
                              {(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel>To Date</FieldLabel>
                                    <FieldContent>
                                      <Popover>
                                        {/* @ts-expect-error Base UI doesn't strongly type asChild */}
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant={"outline"}
                                            className={cn(
                                              "w-full justify-start text-left font-normal",
                                              !field.state.value && "text-muted-foreground",
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.state.value ? (
                                              format(field.state.value, "PPP")
                                            ) : (
                                              <span>Pick a date</span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                            mode="single"
                                            selected={field.state.value}
                                            onSelect={(date) => field.handleChange(date)}
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </FieldContent>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                  </Field>
                                );
                              }}
                            </form.Field>
                          </div>
                        )}

                        {requestType === "document_request" && (
                          <form.Field name="document_type">
                            {(field) => {
                              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel>Document Type</FieldLabel>
                                  <FieldContent>
                                    <Select
                                      value={field.state.value}
                                      onValueChange={(val) => field.handleChange(val || "")}
                                    >
                                      <SelectTrigger className="w-full" aria-invalid={isInvalid}>
                                        <SelectValue placeholder="Select document" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="salary_certificate">Salary Certificate</SelectItem>
                                        <SelectItem value="noc">NOC (No Objection Certificate)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FieldContent>
                                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                              );
                            }}
                          </form.Field>
                        )}
                      </div>
                    )}

                    {/* IT Specific Fields */}
                    {department === "it" && (
                      <div className="space-y-6 p-4 border rounded-md bg-muted/20">
                        <form.Field name="request_type">
                          {(field) => {
                            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel>Ticket Type</FieldLabel>
                                <FieldContent>
                                  <Select
                                    value={field.state.value}
                                    onValueChange={(val) => field.handleChange(val || "")}
                                  >
                                    <SelectTrigger className="w-full" aria-invalid={isInvalid}>
                                      <SelectValue placeholder="Select ticket type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="hardware_issue">Hardware Issue</SelectItem>
                                      <SelectItem value="software_issue">Software Issue</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FieldContent>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                              </Field>
                            );
                          }}
                        </form.Field>

                        {requestType === "hardware_issue" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <form.Field name="device_type">
                              {(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel>Device Type</FieldLabel>
                                    <FieldContent>
                                      <Input
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        placeholder="e.g. Laptop, Monitor"
                                      />
                                    </FieldContent>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                  </Field>
                                );
                              }}
                            </form.Field>
                            <form.Field name="fault_code">
                              {(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel>Fault Code</FieldLabel>
                                    <FieldContent>
                                      <Input
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        placeholder="e.g. E012"
                                        maxLength={4}
                                      />
                                    </FieldContent>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                  </Field>
                                );
                              }}
                            </form.Field>
                          </div>
                        )}

                        {requestType === "software_issue" && (
                          <form.Field name="software_name">
                            {(field) => {
                              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel>Software Name</FieldLabel>
                                  <FieldContent>
                                    <Input
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(e) => field.handleChange(e.target.value)}
                                      aria-invalid={isInvalid}
                                      placeholder="e.g. Microsoft Outlook, Slack"
                                    />
                                  </FieldContent>
                                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </Field>
                              );
                            }}
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
                <Button type="submit" disabled={!canSubmit} className="w-full sm:w-auto">
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
