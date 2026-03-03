import { cn } from "@/lib/utils";
import { Home, ShirtIcon, Sparkles, Bookmark, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/wardrobe", label: "Wardrobe", icon: ShirtIcon },
  { path: "/generate", label: "Generate", icon: Sparkles },
  { path: "/saved", label: "Saved", icon: Bookmark },
  { path: "/settings", label: "Profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors",
                active ? "text-primary" : "text-secondary"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="text-caption">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
