import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin")({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasRole("ADMIN")) {
      throw redirect({
        to: "/unauthorized",
        search: {
          redirect: location.href,
          reason: "insufficient_role",
        },
      });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
