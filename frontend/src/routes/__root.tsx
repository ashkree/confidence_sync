import * as React from "react";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { AuthState } from "@/features/auth/types";
import { pageTitle } from "@/lib/page-title";

interface RouterContext {
  auth: AuthState;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({ meta: [{ title: pageTitle() }] }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <HeadContent />
      <Outlet />
    </React.Fragment>
  );
}
