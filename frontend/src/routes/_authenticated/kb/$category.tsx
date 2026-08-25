import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeBaseDetailPage } from "@/components/page/KnowledgeBaseDetailPage";
import { fetchDocuments } from "@/api/documents";

const CATEGORY_CONFIG: Record<
  string,
  { category: string; title: string; subtitle: string }
> = {
  "hr-policies": {
    category: "HR_POLICY",
    title: "HR Policies",
    subtitle: "Employee policies, code of conduct, and organizational guidelines.",
  },
  HR_POLICY: {
    category: "HR_POLICY",
    title: "HR Policies",
    subtitle: "Employee policies, code of conduct, and organizational guidelines.",
  },
  "it-manuals": {
    category: "IT_MANUAL",
    title: "IT Manuals",
    subtitle: "Technical manuals, device setup guides, and troubleshooting steps.",
  },
  IT_MANUAL: {
    category: "IT_MANUAL",
    title: "IT Manuals",
    subtitle: "Technical manuals, device setup guides, and troubleshooting steps.",
  },
};

export const Route = createFileRoute("/_authenticated/kb/$category")({
  loader: async ({ params }) => {
    const config = CATEGORY_CONFIG[params.category] || {
      category: params.category.toUpperCase().replace(/-/g, "_"),
      title: params.category
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      subtitle: "Browse and view documents.",
    };

    const documents = await fetchDocuments(config.category);
    return {
      categoryKey: params.category,
      category: config.category,
      title: config.title,
      subtitle: config.subtitle,
      documents: documents ?? [],
    };
  },
  component: KnowledgeBaseDetailPage,
});
