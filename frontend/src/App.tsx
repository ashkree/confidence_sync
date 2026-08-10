import { useAuth } from "./auth";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { routeTree } from "./routeTree.gen.ts";
import { createRouter, RouterProvider } from "@tanstack/react-router";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
  context: {
    auth: undefined!,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const auth = useAuth();

  // Don't mount the router (and its beforeLoad guards) until the
  // initial token validation/refresh has resolved — otherwise
  // _authenticated's beforeLoad sees a stale `user: null` and
  // redirects to /login before /me or /refresh ever responds.
  if (auth.isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <RouterProvider router={router} context={{ auth }} />
    </TooltipProvider>
  );
}
