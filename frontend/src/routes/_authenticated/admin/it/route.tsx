import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/it")({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasRole("admin") || !context.auth.hasDepartment("it")) {
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
