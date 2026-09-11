import type { AnyFieldApi } from "@tanstack/react-form";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

export function TextareaField({
  field,
  label,
  ...textareaProps
}: { field: AnyFieldApi; label: string } & React.ComponentProps<typeof Textarea>) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Textarea
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          {...textareaProps}
        />
      </FieldContent>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
