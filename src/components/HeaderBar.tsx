import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderBarProps {
  title?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  className?: string;
}

export function HeaderBar({ title, showBack, right, className }: HeaderBarProps) {
  const navigate = useNavigate();

  return (
    <header className={cn("sticky top-0 z-40 flex h-14 items-center justify-between bg-background/80 px-4 backdrop-blur-md", className)}>
      <div className="flex items-center gap-2">
        {showBack && (
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        {title && <h1 className="font-display text-display-3">{title}</h1>}
      </div>
      {right && <div>{right}</div>}
    </header>
  );
}
