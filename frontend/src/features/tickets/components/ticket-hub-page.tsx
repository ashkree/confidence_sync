import { Link } from "@tanstack/react-router";
import { ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/sections/HeroSection";
import { CATALOG, type RequestTypeSlug } from "../catalog";

const groups = [
  {
    department: "HR" as const,
    label: "Human Resources",
    slugs: ["leave-request", "document-request"] as RequestTypeSlug[],
  },
  {
    department: "IT" as const,
    label: "Information Technology",
    slugs: ["hardware-issue", "software-issue"] as RequestTypeSlug[],
  },
];

export function TicketHubPage() {
  return (
    <>
      <HeroSection
        title="Submit a Request"
        subtitle="Choose the type of request you'd like to submit."
      />
      <div className="container mx-auto p-6 max-w-5xl mt-6 space-y-10">
        {groups.map((group) => (
          <section key={group.department}>
            <h2 className="text-lg font-semibold mb-4">{group.label}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {group.slugs.map((slug) => {
                const entry = CATALOG[slug];
                const Icon = entry.icon;
                return (
                  <Link
                    key={slug}
                    to="/ticket/submit/$requestType"
                    params={{ requestType: slug }}
                    className="block group"
                  >
                    <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group-hover:scale-[1.01]">
                      <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                        <div className="p-3 rounded-lg bg-primary/10 w-fit">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                            {entry.label}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                            {entry.description}
                          </p>
                        </div>
                        <div className="flex items-center text-sm font-medium text-primary pt-2">
                          <span>Start request</span>
                          <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* KB deflection */}
        <div className="border rounded-lg p-4 bg-muted/30 flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Before you submit</strong> — your answer might already be in the knowledge base.
            </p>
            <div className="flex gap-4">
              <Link
                to="/kb/$category"
                params={{ category: "hr-policies" }}
                className="text-primary hover:underline"
              >
                HR Policies
              </Link>
              <Link
                to="/kb/$category"
                params={{ category: "it-manuals" }}
                className="text-primary hover:underline"
              >
                IT Manuals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
