import type { AnyFieldApi } from "@tanstack/react-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

export function SelectField({
  field,
  label,
  placeholder = "Select...",
  options,
}: {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Select
          value={field.state.value ?? ""}
          onValueChange={(val) => field.handleChange(val || undefined)}
        >
          <SelectTrigger className="w-full" aria-invalid={isInvalid}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldContent>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
