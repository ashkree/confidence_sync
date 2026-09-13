import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPriorityColor, getStatusColor } from "../lib/ticket-colors";

export function StatusBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium capitalize", getStatusColor(value), className)}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {value.toLowerCase().replace(/_/g, " ")}
    </Badge>
  );
}

export function PriorityBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium capitalize", getPriorityColor(value), className)}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {value.toLowerCase()}
    </Badge>
  );
}
