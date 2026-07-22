import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/page/ProfilePage";

export const Route = createFileRoute("/_authenticated/profile/")({
  component: ProfilePage,
});
