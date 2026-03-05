import { cn } from "@/lib/utils";
import { AiBadge } from "./AiBadge";
import type { GeneratedOutfit } from "@/services/ai-service";

interface OutfitCardProps {
  outfit: GeneratedOutfit;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export function OutfitCard({ outfit, compact, onClick, className }: OutfitCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      {/* Item thumbnails grid */}
      <div className={cn("grid grid-cols-2 gap-px bg-border", compact ? "h-32" : "h-44")}>
        {outfit.items.slice(0, 4).map((item) => (
          <div key={item.id} className="flex items-center justify-center bg-muted/50 p-2">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full rounded object-cover"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: item.color }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-1.5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-caption uppercase text-muted-foreground">{outfit.occasion}</span>
          <AiBadge className="text-[10px]" />
        </div>
        <p className="text-body-sm font-medium text-foreground">
          {outfit.items.map((i) => i.name).join(" + ")}
        </p>
        {!compact && (
          <p className="line-clamp-2 text-body-sm text-muted-foreground">{outfit.stylingNotes}</p>
        )}
      </div>
    </button>
  );
}
