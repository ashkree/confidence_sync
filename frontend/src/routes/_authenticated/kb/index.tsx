import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeBasePage } from "@/components/page/KnowledgeBasePage";
import { fetchDocuments } from "@/api/documents";

export const Route = createFileRoute("/_authenticated/kb/")({
  loader: async () => {
    const [hrPolicies, itManuals] = await Promise.all([
      fetchDocuments("HR_POLICY"),
      fetchDocuments("IT_MANUAL"),
    ]);
    return { hrPolicies, itManuals };
  },
  component: KnowledgeBasePage,
});
