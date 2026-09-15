import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/features/profile/components/profile-page";
import { fetchProfile } from "@/features/profile/api";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/_authenticated/profile/")({
  head: () => ({ meta: [{ title: pageTitle("Profile") }] }),
  loader: async () => fetchProfile(),
  component: ProfilePage,
});
