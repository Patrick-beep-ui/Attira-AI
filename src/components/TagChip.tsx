import React from "react";
import { cn } from "@/lib/utils";

interface TagChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function TagChip({ label, active, onClick, className, style }: TagChipProps) {
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
      style={style}
    >
      {label}
    </button>
  );
}
