import { z } from "zod";
import { SelectField } from "../fields";
import type { RequestTypeModule } from "../types";

const schema = z.object({
  document_type: z.enum(["SALARY_CERTIFICATE", "NOC"], {
    message: "Document type is required",
  }),
});

type Extra = { document_type: "SALARY_CERTIFICATE" | "NOC" | undefined };

const DOCUMENT_OPTIONS = [
  { value: "SALARY_CERTIFICATE", label: "Salary Certificate" },
  { value: "NOC", label: "NOC (No Objection Certificate)" },
];

const documentRequestModule: RequestTypeModule<Extra> = {
  defaults: { document_type: undefined },
  schema,
  Fields: ({ form }) => (
    <form.Field name="document_type">
      {(f: any) => (
        <SelectField
          field={f}
          label="Document Type"
          placeholder="Select document"
          options={DOCUMENT_OPTIONS}
        />
      )}
    </form.Field>
  ),
  toPayload: (v) => ({
    type: "HR_REQUEST",
    subject: v.subject,
    description: v.description,
    request_type: "DOCUMENT_REQUEST",
    document_type: v.document_type as "SALARY_CERTIFICATE" | "NOC",
  }),
};

export default documentRequestModule;
