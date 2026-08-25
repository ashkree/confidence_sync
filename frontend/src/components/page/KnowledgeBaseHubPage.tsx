import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Laptop, ChevronRight } from "lucide-react";
import HeroSection from "@/components/sections/HeroSection";
import { Link, useLoaderData } from "@tanstack/react-router";

export function KnowledgeBaseHubPage() {
  const { hrCount = 0, itCount = 0 } = useLoaderData({
    from: "/_authenticated/kb/",
  });

  const categories = [
    {
      id: "hr-policies",
      title: "HR Policies",
      description:
        "Company policies, leave guidelines, code of conduct, and employee resources.",
      icon: Users,
      count: hrCount,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "it-manuals",
      title: "IT Manuals",
      description:
        "Setup guides, security protocols, software access, and hardware troubleshooting.",
      icon: Laptop,
      count: itCount,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <>
      <HeroSection
        title="Knowledge Base"
        subtitle="Find all important policies, guidelines, and manuals in one place."
      />
      <div className="container mx-auto p-6 max-w-5xl mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to="/kb/$category"
                params={{ category: cat.id }}
                className="block group"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group-hover:scale-[1.01]">
                  <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${cat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${cat.color}`} />
                      </div>
                      <Badge variant="secondary" className="font-semibold text-xs">
                        {cat.count} {cat.count === 1 ? "article" : "articles"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {cat.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                        {cat.description}
                      </p>
                    </div>

                    <div className="flex items-center text-sm font-medium text-primary pt-2">
                      <span>Browse articles</span>
                      <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
