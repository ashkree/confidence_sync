import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "@/components/sections/HeroSection";
import QuickActions from "@/components/sections/QuickActions";
import PendingRequestsSection from "@/components/sections/PendingRequestsSection";
import TopicSection from "@/components/sections/TopicsSection";
import { useAuth } from "@/auth";
import type { Ticket } from "@/types";
import { fetchMyTickets } from "@/api/tickets";
export const Route = createFileRoute("/_authenticated/employee/")({
  component: Component,
  loader: async () => {
    return await fetchMyTickets();
  },
});

function Component() {
  const { user } = useAuth();
  const myTickets = Route.useLoaderData() as Ticket[];

  return (
    <>
      <HeroSection title={`Hello, ${user?.name}`} />
      <div className="flex flex-1 flex-col gap-4 px-32 py-8">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-4 col-span-2">
            <QuickActions />
            <TopicSection />
          </div>
          <div className="flex flex-col gap-4 col-span-1">
            <PendingRequestsSection tickets={myTickets} />
          </div>
        </div>
      </div>
    </>
  );
}
