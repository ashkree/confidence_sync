import { H1, H2 } from "@/utils/typography";

export default function HeroSection({ 
  title = "Hello, User", 
  subtitle
}: { 
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b bg-background px-6 py-4">
      <H1 text={title} />
      {subtitle && <H2 text={subtitle} />}
    </div>
  );
}
