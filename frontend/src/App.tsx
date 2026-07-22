import { useAuth } from "./auth";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { routeTree } from "./routeTree.gen.ts";
import { createRouter, RouterProvider } from "@tanstack/react-router";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
  context: {
    // auth will be passed down from App component
    auth: undefined!,
  },
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const auth = useAuth();
  return (
    <TooltipProvider>
      <RouterProvider router={router} context={{ auth }} />;
    </TooltipProvider>
  );
}
