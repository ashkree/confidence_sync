import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeBaseHubPage } from "@/components/page/KnowledgeBaseHubPage";
import { fetchDocuments } from "@/api/documents";

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

