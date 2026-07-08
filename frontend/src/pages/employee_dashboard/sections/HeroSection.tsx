import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { H1, H2 } from "@/utils/typography";

export default function HeroSection() {
  return (
    <div className="bg-primary text-primary-foreground px-8 py-4 md:px-64 md:py-32">
      <div className="flex flex-col space-y-4">
        <span>
          <H1 text="Hello, User" />
          <H2 text="How can we help you today?" />
        </span>
        <FieldSet>
          <FieldGroup>
            <Field>
              <Input
                className="bg-primary-foreground"
                id="name"
                autoComplete="off"
                placeholder="Try 'How many sick days do I have left' "
              />
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>
    </div>
  );
}
