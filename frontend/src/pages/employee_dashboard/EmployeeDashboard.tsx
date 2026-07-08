import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import HeroSection from "./sections/HeroSection";
import QuickActions from "./sections/QuickActions";
import PendingRequestsSection from "./sections/PendingRequestsSection";
import TopicSection from "./sections/TopicsSection";

export default function EmployeeDashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main>
          <HeroSection />
          <div className="flex flex-1 flex-col gap-4 px-32 py-8">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-4 col-span-2">
                <QuickActions />
                <TopicSection />
              </div>
              <div className="flex flex-col gap-4 col-span-1">
                <PendingRequestsSection />
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
