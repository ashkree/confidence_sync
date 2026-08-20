import { Card, CardContent } from "@/components/ui/card";
import { FileText, Link as LinkIcon } from "lucide-react";
import HeroSection from "@/components/sections/HeroSection";
import { useLoaderData } from "@tanstack/react-router";
import { viewDocument } from "@/api/documents";

export function KnowledgeBasePage() {
  const { hrPolicies, itManuals } = useLoaderData({
    from: "/_authenticated/kb/",
  });
  return (
    <>
      <HeroSection 
        title="Knowledge Base" 
        subtitle="Find all important policies, guidelines, and manuals in one place." 
      />
      <div className="container mx-auto p-6 max-w-5xl mt-8">

      <div className="grid md:grid-cols-2 gap-8">
        {/* HR Policies Column */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            HR Policies
          </h2>
          <div className="flex flex-col gap-3">
            {hrPolicies.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  <button
                    type="button"
                    className="flex items-center justify-between w-full outline-none cursor-pointer text-left"
                    onClick={() => viewDocument(doc.id)}
                  >
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {doc.file_name}
                    </span>
                    <LinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* IT Manuals Column */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            IT Manuals
          </h2>
          <div className="flex flex-col gap-3">
            {itManuals.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  <button
                    type="button"
                    className="flex items-center justify-between w-full outline-none cursor-pointer text-left"
                    onClick={() => viewDocument(doc.id)}
                  >
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {doc.file_name}
                    </span>
                    <LinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

