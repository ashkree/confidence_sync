import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import * as z from "zod";
import { useForm } from "@tanstack/react-form";

import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/auth";
import { MOCK_USERS } from "@/api/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/employee",
  }),
  beforeLoad: ({ context, search }) => {
    // Redirect if already authenticated
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect });
    }
  },
  component: LoginComponent,
});

const loginSchema = z.object({
  email: z.email("Invalid email").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

const useMock = import.meta.env.VITE_USE_MOCK === "true";

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

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await login(value.email, value.password);
      navigate({ to: "/employee" });
    },
  });

  const handleQuickLogin = async (email: string | null) => {
    if (!email) return;
    await login(email, "mock");
    navigate({ to: "/employee" });
  };

  const { employees, hrAdmins, itAdmins } = getMockUsersByRole();

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        {useMock && MOCK_USERS && (
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
        )}

        <form.Field name="email">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="m@example.com"
                  autoComplete="email"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <div className="flex items-center">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  autoComplete="current-password"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <Field>
          <Button type="submit">Login</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

function LoginComponent() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
