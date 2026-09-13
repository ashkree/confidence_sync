import { useState } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

interface DateFieldProps {
  field: AnyFieldApi;
  label: string;
  disabled?: React.ComponentProps<typeof Calendar>["disabled"];
  triggerRef?: React.Ref<HTMLButtonElement>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectDate?: (date: Date | undefined) => void;
}

export function DateField({
  field,
  label,
  disabled,
  triggerRef,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSelectDate,
}: DateFieldProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel>{label}</FieldLabel>
      <FieldContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                ref={triggerRef}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.state.value && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.state.value ? (
                  format(field.state.value, "dd/MM/yyyy")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.state.value}
              onSelect={(date) => {
                field.handleChange(date);
                setOpen(false);
                onSelectDate?.(date);
              }}
              disabled={disabled}
            />
          </PopoverContent>
        </Popover>
      </FieldContent>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
