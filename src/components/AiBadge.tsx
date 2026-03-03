import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AiBadgeProps {
  className?: string;
  label?: string;
}

export function AiBadge({ className, label = "AI Styled" }: AiBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-caption font-medium text-primary",
        className
      )}
    >
      <Sparkles className="h-3 w-3" />
      {label}
    </span>
  );
}
