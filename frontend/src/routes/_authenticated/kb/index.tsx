import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeBaseHubPage } from "@/features/knowledge-base/components/kb-hub-page";
import { fetchDocuments } from "@/features/knowledge-base/api";

export const Route = createFileRoute("/_authenticated/kb/")({
  loader: async () => {
    const [hrPolicies, itManuals] = await Promise.all([
      fetchDocuments("HR_POLICY"),
      fetchDocuments("IT_MANUAL"),
    ]);
    return {
      hrCount: hrPolicies?.length ?? 0,
      itCount: itManuals?.length ?? 0,
    };
  },
  component: KnowledgeBaseHubPage,
});
