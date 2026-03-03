import { cn } from "@/lib/utils";

interface TagChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TagChip({ label, active, onClick, className }: TagChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-3.5 py-1.5 text-body-sm font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        className
      )}
    >
      {label}
    </button>
  );
}
