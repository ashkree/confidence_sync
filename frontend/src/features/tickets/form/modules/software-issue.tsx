import { z } from "zod";
import { TextField } from "../fields";
import type { RequestTypeModule } from "../types";

const schema = z.object({
  software_name: z.string().min(1, "Software name is required"),
});

type Extra = { software_name: string | undefined };

const softwareIssueModule: RequestTypeModule<Extra> = {
  defaults: { software_name: undefined },
  schema,
  Fields: ({ form }) => (
    <form.Field name="software_name">
      {(f: any) => (
        <TextField
          field={f}
          label="Software Name"
          placeholder="e.g. Microsoft Outlook, Slack"
        />
      )}
    </form.Field>
  ),
  toPayload: (v) => ({
    type: "IT_TICKET",
    subject: v.subject,
    description: v.description,
    request_type: "SOFTWARE_ISSUE",
    software_name: v.software_name || undefined,
  }),
};

export default softwareIssueModule;
