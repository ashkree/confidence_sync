import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeBasePage } from "@/components/page/KnowledgeBasePage";

export const Route = createFileRoute("/_authenticated/kb/")({
  component: KnowledgeBasePage,
});
