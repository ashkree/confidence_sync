import { z } from "zod";
import { TextField } from "../fields";
import type { RequestTypeModule } from "../types";

const schema = z.object({
  device_type: z.string().min(1, "Device type is required"),
  fault_code: z
    .string()
    .max(4, "Fault code must be at most 4 characters")
    .optional(),
});

type Extra = {
  device_type: string | undefined;
  fault_code: string | undefined;
};

const hardwareIssueModule: RequestTypeModule<Extra> = {
  defaults: { device_type: undefined, fault_code: undefined },
  schema,
  Fields: ({ form }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <form.Field name="device_type">
        {(f: any) => (
          <TextField
            field={f}
            label="Device Type"
            placeholder="e.g. Laptop, Monitor"
          />
        )}
      </form.Field>
      <form.Field name="fault_code">
        {(f: any) => (
          <TextField
            field={f}
            label="Fault Code"
            placeholder="e.g. E012"
            maxLength={4}
          />
        )}
      </form.Field>
    </div>
  ),
  toPayload: (v) => ({
    type: "IT_TICKET",
    subject: v.subject,
    description: v.description,
    request_type: "HARDWARE_ISSUE",
    device_type: v.device_type || undefined,
    fault_code: v.fault_code || undefined,
  }),
};

export default hardwareIssueModule;
