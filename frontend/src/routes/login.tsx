import { GalleryVerticalEnd } from "lucide-react";

import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth/components/login-form";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: pageTitle("Sign in") }] }),
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

function LoginComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-2 font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Confidence Sync
        </div>

        <div className="rounded-xl border bg-background p-6 shadow-sm md:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
