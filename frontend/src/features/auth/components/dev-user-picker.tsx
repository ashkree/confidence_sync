import { Field, FieldLabel } from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { MOCK_USERS } from "@/features/auth/api";
import { SHOW_DEV_TOOLS } from "@/lib/env";
import { useAppEnv } from "@/contexts/app-env";

function getMockUsersByRole() {
  if (!MOCK_USERS) return { employees: [], hrAdmins: [], itAdmins: [] };
  const entries = Object.entries(MOCK_USERS);
  return {
    employees: entries.filter(([, u]) => u.role === "EMPLOYEE"),
    hrAdmins: entries.filter(
      ([, u]) => u.role === "ADMIN" && u.department === "HR",
    ),
    itAdmins: entries.filter(
      ([, u]) => u.role === "ADMIN" && u.department === "IT",
    ),
  };
}

export function DevUserPicker({
  onSelect,
}: {
  onSelect: (email: string, password: string) => void;
}) {
  const { appEnv } = useAppEnv();

  if (!SHOW_DEV_TOOLS || appEnv === "prod" || !MOCK_USERS) return null;

  const handleQuickLogin = async (email: string | null) => {
    if (!email) return;
    onSelect(email, `${email.split("@")[0]}123!`);
  };

  const { employees, hrAdmins, itAdmins } = getMockUsersByRole();

  return (
    <Field>
      <FieldLabel>Quick Login (Mock)</FieldLabel>
      <Select onValueChange={handleQuickLogin}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a mock user..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Employees</SelectLabel>
            {employees.map(([email, user]) => (
              <SelectItem key={email} value={email}>
                {user.name} — {email}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>HR Admins</SelectLabel>
            {hrAdmins.map(([email, user]) => (
              <SelectItem key={email} value={email}>
                {user.name} — {email}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>IT Admins</SelectLabel>
            {itAdmins.map(([email, user]) => (
              <SelectItem key={email} value={email}>
                {user.name} — {email}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
