import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, FileX, Link as LinkIcon, ArrowLeft } from "lucide-react";
import HeroSection from "@/components/sections/HeroSection";
import { Link, useLoaderData } from "@tanstack/react-router";
import { viewDocument } from "@/api/documents";
import type { Document } from "@/types";

export function KnowledgeBaseDetailPage() {
  const { title, subtitle, documents } = useLoaderData({
    from: "/_authenticated/kb/$category",
  }) as { title: string; subtitle: string; documents: Document[] };

  const count = documents?.length ?? 0;

  return (
    <>
      <HeroSection title={title} subtitle={subtitle} />
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        {/* Back Link & Header info */}
        <div className="flex items-center justify-between">
          <Link
            to="/kb"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
          </Link>
          <Badge variant="secondary" className="font-semibold">
            {count} {count === 1 ? "article" : "articles"}
          </Badge>
        </div>

        {/* Documents List / Empty State */}
        {count === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <FileX className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-base font-medium">No {title.toLowerCase()} available</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                There are currently 0 articles uploaded in this category.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  <button
                    type="button"
                    className="flex items-center justify-between w-full outline-none cursor-pointer text-left"
                    onClick={() => viewDocument(doc.id)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {doc.file_name}
                      </span>
                    </div>
                    <LinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
