import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import {
  BookOpenIcon,
  LayoutDashboard,
  Plus,
  Tickets,
  User,
} from "lucide-react";
import { useAuth } from "@/auth";

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

const employee_group = {
  name: "App",
  items: [
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
      items: {
        title: "test",
        url: "#",
      },
    },
  ],
};

const it_group = {
  name: "Admin",
  items: [
    {
      title: "Tickets",
      url: "/admin/it/tickets",
      icon: Tickets,
    },
    {
      title: "Manuals",
      url: "/admin/it/manuals",
      icon: BookOpenIcon,
    },
  ],
};

const hr_group = {
  name: "Admin",
  items: [
    {
      title: "Requests",
      url: "/admin/hr/requests",
      icon: Tickets,
    },
    {
      title: "Policies",
      url: "/admin/hr/policies",
      icon: BookOpenIcon,
    },
  ],
};
function RouteComponent() {
  const { hasRole, hasDepartment } = useAuth();

  const getGroup = () => {
    if (hasRole("EMPLOYEE")) {
      return [employee_group];
    }

    if (hasDepartment("IT")) {
      return [employee_group, it_group];
    } else {
      return [employee_group, hr_group];
    }
  };
  return (
    <div>
      <SidebarProvider>
        <AppSidebar groups={getGroup()} />
        <SidebarInset>
          <main>
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
