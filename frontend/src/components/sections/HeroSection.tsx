import { H1, H2 } from "@/utils/typography";

export default function HeroSection({ 
  title = "Hello, User", 
  subtitle = "How can we help you today?" 
}: { 
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-primary text-primary-foreground px-8 py-4 md:px-64 md:py-32">
      <div className="flex flex-col space-y-4">
        <span>
          <H1 text={title} />
          <H2 text={subtitle} />
        </span>
      </div>
    </div>
  );
}
