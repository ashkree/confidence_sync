import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { fetchProfile } from "@/features/profile/api";

export const Route = createFileRoute("/_authenticated/profile/")({
  loader: async () => fetchProfile(),
  component: ProfilePage,
});
