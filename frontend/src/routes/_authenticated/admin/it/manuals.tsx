import { fetchMyDocuments } from "@/api/documents";
import { DocumentsPage } from "@/components/page/DocumentsPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/it/manuals")({
  component: RouteComponent,
  loader: async () => {
    return await fetchMyDocuments();
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return <DocumentsPage columns={[]} data={data} title="IT Manuals" />;
}

