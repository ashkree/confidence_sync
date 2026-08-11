import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/page/ProfilePage";
import { fetchProfile } from "@/api/user";

export const Route = createFileRoute("/_authenticated/profile/")({
  loader: async () => fetchProfile(),
  component: ProfilePage,
});
