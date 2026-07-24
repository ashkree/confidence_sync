import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/hr")({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.hasDepartment("hr")) {
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
