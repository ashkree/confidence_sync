import { fetchDocuments } from "@/features/knowledge-base/api";
import { createFileRoute } from "@tanstack/react-router";
import { DocumentsPage } from "@/features/knowledge-base/components/kb-documents-page";

export const Route = createFileRoute("/_authenticated/admin/hr/policies")({
  component: RouteComponent,
  loader: async () => {
    return await fetchDocuments("HR_POLICY");
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return <DocumentsPage columns={[]} data={data} title="HR Policies" />;
}
