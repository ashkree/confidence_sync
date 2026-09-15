import { fetchDocuments } from "@/features/knowledge-base/api";
import { DocumentsPage } from "@/features/knowledge-base/components/kb-documents-page";
import { createFileRoute } from "@tanstack/react-router";
import { pageTitle } from "@/lib/page-title";

export const Route = createFileRoute("/_authenticated/admin/it/manuals")({
  head: () => ({ meta: [{ title: pageTitle("IT Manuals") }] }),
  component: RouteComponent,
  loader: async () => {
    return await fetchDocuments("IT_MANUAL");
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return <DocumentsPage columns={[]} data={data} title="IT Manuals" />;
}
