import { z } from "zod";
import { format } from "date-fns";
import { DateField } from "../fields";
import type { RequestTypeModule } from "../types";

const schema = z
  .object({
    from_date: z.date({ message: "Start date is required" }),
    to_date: z.date({ message: "End date is required" }),
  })
  .refine((v) => v.to_date >= v.from_date, {
    message: "End date must be on or after the start date",
    path: ["to_date"],
  });

type Extra = { from_date: Date | undefined; to_date: Date | undefined };

const leaveRequestModule: RequestTypeModule<Extra> = {
  defaults: { from_date: undefined, to_date: undefined },
  schema,
  Fields: ({ form }) => (
    <div className="grid md:grid-cols-2 gap-4">
      <form.Field name="from_date">
        {(f: any) => <DateField field={f} label="From Date" />}
      </form.Field>
      <form.Field name="to_date">
        {(f: any) => <DateField field={f} label="To Date" />}
      </form.Field>
    </div>
  ),
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
