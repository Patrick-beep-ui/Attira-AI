import { cn } from "@/lib/utils";
import { AiBadge } from "./AiBadge";
import type { GeneratedOutfit } from "@/services/ai-service";

interface OutfitCardProps {
  outfit: GeneratedOutfit;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

function adjustSvgForCard(svgString: string): string {
  const adjusted = svgString
    .replace(/width="500"/g, 'width="100%"')
    .replace(/height="600"/g, 'height="100%"');
  
  if (!adjusted.includes('style="background-color')) {
    return adjusted.replace('<svg', '<svg style="background-color: #DEDAD9"');
  }
  return adjusted;
}

export function OutfitCard({ outfit, compact, onClick, className }: OutfitCardProps) {
  const compositionUrl = outfit.compositionUrl ?? outfit.composition_url ?? null;
  const hasCanvas = !!compositionUrl;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      {hasCanvas ? (
        <div
          className={cn("overflow-hidden", compact ? "h-56" : "h-72")}
          dangerouslySetInnerHTML={{
            __html: adjustSvgForCard(
              decodeURIComponent(compositionUrl!.replace("data:image/svg+xml;utf8,", ""))
            )
          }}
        />
      ) : (
        <div className={cn("grid grid-cols-2 gap-px bg-border overflow-hidden -mt-2.5",
          compact ? "h-56" : "h-72")}>
          {outfit.items.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center justify-center bg-muted/50 p-2 aspect-square mx-auto w-20 rounded-full">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover rounded-full"
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
      )}
    </button>
  );
}
