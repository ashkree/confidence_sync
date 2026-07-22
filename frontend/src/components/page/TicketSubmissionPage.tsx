"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { getRouteApi } from "@tanstack/react-router";

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
} from "@/components/ui/field";

const routeApi = getRouteApi("/_authenticated/ticket/submit");

export function TicketSubmissionPage() {
  const search = routeApi.useSearch();

  const [department, setDepartment] = useState<string>(search.department || "");
  const [hrRequestType, setHrRequestType] = useState<string>(
    search.requestType || "",
  );
  const [itTicketType, setItTicketType] = useState<string>(
    search.ticketType || "",
  );

  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate and submit
    console.log("Form submitted");
  };

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
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field>
              <FieldLabel>Subject</FieldLabel>
              <FieldContent>
                <Input
                  required
                  placeholder="Brief summary of the issue or request"
                  name="subject"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Description</FieldLabel>
              <FieldContent>
                <Textarea
                  required
                  placeholder="Please provide details..."
                  name="description"
                  className="min-h-[100px]"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Department</FieldLabel>
              <FieldContent>
                <Select
                  required
                  value={department}
                  onValueChange={(val) => setDepartment(val ?? "")}
                  name="department"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">Human Resources (HR)</SelectItem>
                    <SelectItem value="it">
                      Information Technology (IT)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            {/* HR Specific Fields */}
            {department === "hr" && (
              <div className="space-y-6 p-4 border rounded-md bg-muted/20">
                <Field>
                  <FieldLabel>Request Type</FieldLabel>
                  <FieldContent>
                    <Select
                      required
                      value={hrRequestType}
                      onValueChange={(val) => setHrRequestType(val ?? "")}
                      name="request_type"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leave_request">
                          Leave Request
                        </SelectItem>
                        <SelectItem value="document_request">
                          Document Request
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                {hrRequestType === "leave_request" && (
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>From Date</FieldLabel>
                      <FieldContent>
                        <Popover>
                          {/* @ts-expect-error Base UI doesn't strongly type asChild */}
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !fromDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {fromDate ? (
                                format(fromDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={fromDate}
                              onSelect={setFromDate}
                            />
                          </PopoverContent>
                        </Popover>
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>To Date</FieldLabel>
                      <FieldContent>
                        <Popover>
                          {/* @ts-expect-error Base UI doesn't strongly type asChild */}
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !toDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {toDate ? (
                                format(toDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={toDate}
                              onSelect={setToDate}
                            />
                          </PopoverContent>
                        </Popover>
                      </FieldContent>
                    </Field>
                  </div>
                )}

                {hrRequestType === "document_request" && (
                  <Field>
                    <FieldLabel>Document Type</FieldLabel>
                    <FieldContent>
                      <Select required name="document_type">
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select document" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salary_certificate">
                            Salary Certificate
                          </SelectItem>
                          <SelectItem value="noc">
                            NOC (No Objection Certificate)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>
                )}
              </div>
            )}

            {/* IT Specific Fields */}
            {department === "it" && (
              <div className="space-y-6 p-4 border rounded-md bg-muted/20">
                <Field>
                  <FieldLabel>Ticket Type</FieldLabel>
                  <FieldContent>
                    <Select
                      required
                      value={itTicketType}
                      onValueChange={(val) => setItTicketType(val ?? "")}
                      name="it_ticket_type"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardware_issue">
                          Hardware Issue
                        </SelectItem>
                        <SelectItem value="software_issue">
                          Software Issue
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                {itTicketType === "hardware_issue" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Device Type</FieldLabel>
                      <FieldContent>
                        <Input
                          required
                          placeholder="e.g. Laptop, Monitor"
                          name="device_type"
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>Fault Code</FieldLabel>
                      <FieldContent>
                        <Input
                          required
                          placeholder="e.g. E012"
                          maxLength={4}
                          name="fault_code"
                        />
                      </FieldContent>
                    </Field>
                  </div>
                )}

                {itTicketType === "software_issue" && (
                  <Field>
                    <FieldLabel>Software Name</FieldLabel>
                    <FieldContent>
                      <Input
                        required
                        placeholder="e.g. Microsoft Outlook, Slack"
                        name="software_type"
                      />
                    </FieldContent>
                  </Field>
                )}
              </div>
            )}

            <Button type="submit" className="w-full sm:w-auto">
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
