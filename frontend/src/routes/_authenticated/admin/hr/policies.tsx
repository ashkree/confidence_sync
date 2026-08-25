import { fetchDocuments } from "@/api/documents";
import { DocumentsPage } from "@/components/page/DocumentsPage";
import { createFileRoute } from "@tanstack/react-router";

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
