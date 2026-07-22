import { createFileRoute, Outlet } from "@tanstack/react-router";
import EmployeeSidebar from "./-components/EmployeeSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated/employee")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <SidebarProvider>
        <EmployeeSidebar />
        <SidebarInset>
          <main>
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
