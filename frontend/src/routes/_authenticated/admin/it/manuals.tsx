import { fetchDocuments } from "@/features/knowledge-base/api";
import { DocumentsPage } from "@/features/knowledge-base/components/kb-documents-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/it/manuals")({
  component: RouteComponent,
  loader: async () => {
    return await fetchDocuments("IT_MANUAL");
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return <DocumentsPage columns={[]} data={data} title="IT Manuals" />;
}
