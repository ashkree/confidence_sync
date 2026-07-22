import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { BookOpenIcon, LayoutDashboard, Plus, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

const links = [
  {
    title: "Overview",
    url: "/employee",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Submit a request",
    url: "/ticket/submit",
    icon: Plus,
  },
  {
    title: "Knowledge Base",
    url: "/kb",
    icon: BookOpenIcon,
  },
  {
    title: "My Profile",
    url: "/profile",
    icon: User,
  },
];

function RouteComponent() {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar links={links} />
        <SidebarInset>
          <main>
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
