import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "@/components/sections/HeroSection";
import QuickActions from "@/components/sections/QuickActions";
import PendingRequestsSection from "@/components/sections/PendingRequestsSection";
import TopicSection from "@/components/sections/TopicsSection";

export const Route = createFileRoute("/_authenticated/employee/")({
  component: Component,
});

function Component() {
  return (
    <>
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
    </>
  );
}
