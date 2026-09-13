import { useRef, useState } from "react";
import { z } from "zod";
import { format, startOfDay } from "date-fns";
import { DateField } from "../fields";
import type { RequestTypeModule } from "../types";

const schema = z
  .object({
    from_date: z
      .date({ message: "Start date is required" })
      .refine((d) => startOfDay(d) > startOfDay(new Date()), {
        message: "Start date must be after today",
      }),
    to_date: z.date({ message: "End date is required" }),
  })
  .refine((v) => startOfDay(v.to_date) > startOfDay(v.from_date), {
    message: "End date must be after the start date",
    path: ["to_date"],
  });

type Extra = { from_date: Date | undefined; to_date: Date | undefined };

function LeaveRequestFields({ form }: { form: any }) {
  const toDateTriggerRef = useRef<HTMLButtonElement>(null);
  const [toOpen, setToOpen] = useState(false);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <form.Field name="from_date">
        {(fromField: any) => (
          <DateField
            field={fromField}
            label="From Date"
            disabled={(date) => startOfDay(date) <= startOfDay(new Date())}
            onSelectDate={(selectedFromDate) => {
              if (selectedFromDate) {
                const currentToDate = form.getFieldValue("to_date");
                if (
                  currentToDate &&
                  startOfDay(currentToDate) <= startOfDay(selectedFromDate)
                ) {
                  form.setFieldValue("to_date", undefined);
                }
                setTimeout(() => {
                  toDateTriggerRef.current?.focus();
                  setToOpen(true);
                }, 0);
              }
            }}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state: any) => state.values.from_date}>
        {(fromDate: Date | undefined) => (
          <form.Field name="to_date">
            {(toField: any) => (
              <DateField
                field={toField}
                label="To Date"
                triggerRef={toDateTriggerRef}
                open={toOpen}
                onOpenChange={setToOpen}
                disabled={(date) => {
                  const minDate = fromDate
                    ? startOfDay(fromDate)
                    : startOfDay(new Date());
                  return startOfDay(date) <= minDate;
                }}
              />
            )}
          </form.Field>
        )}
      </form.Subscribe>
    </div>
  );
}

const leaveRequestModule: RequestTypeModule<Extra> = {
  defaults: { from_date: undefined, to_date: undefined },
  schema,
  Fields: LeaveRequestFields,
  toPayload: (v) => ({
    type: "HR_REQUEST",
    subject: v.subject,
    description: v.description,
    request_type: "LEAVE_REQUEST",
    from_date: v.from_date ? format(v.from_date, "dd/MM/yyyy") : undefined,
    to_date: v.to_date ? format(v.to_date, "dd/MM/yyyy") : undefined,
  }),
};

export default leaveRequestModule;
