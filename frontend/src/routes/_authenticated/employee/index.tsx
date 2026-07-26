import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "@/components/sections/HeroSection";
import QuickActions from "@/components/sections/QuickActions";
import PendingRequestsSection from "@/components/sections/PendingRequestsSection";
import TopicSection from "@/components/sections/TopicsSection";
import { useAuth } from "@/auth";
import { fetchTickets } from "@/api/tickets";
import type { Ticket } from "@/types";

export const Route = createFileRoute("/_authenticated/employee/")({
  component: Component,
  loader: async () => {
    const hr = await fetchTickets("hr");
    const it = await fetchTickets("it");
    return [...hr, ...it];
  },
});

function Component() {
  const { user } = useAuth();
  const allTickets = Route.useLoaderData() as Ticket[];
  // Filter to show only the current user's tickets
  const myTickets = allTickets.filter((t) => t.poster_id === user?.id);

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
