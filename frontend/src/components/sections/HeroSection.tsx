import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function HeroSection({
  title = "Hello, User",
  subtitle,
  actions,
  className,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border-b bg-card px-4 py-5 md:px-10 md:py-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] [background-size:22px_22px] [mask-image:linear-gradient(to_right,transparent,black_65%)]"
      />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-balance">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-prose text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
