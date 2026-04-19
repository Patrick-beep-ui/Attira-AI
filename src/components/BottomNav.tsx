import { cn } from "@/lib/utils";
import { Home, ShirtIcon, Sparkles, Bookmark, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const tabs = [
  { path: "/home", labelKey: "nav.home", icon: Home },
  { path: "/wardrobe", labelKey: "nav.wardrobe", icon: ShirtIcon },
  { path: "/generate", labelKey: "nav.generate", icon: Sparkles },
  { path: "/saved", labelKey: "nav.saved", icon: Bookmark },
  { path: "/settings", labelKey: "nav.profile", icon: User },
];

export function BottomNav() {
  const { t } = useLanguage();
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
              <span className="text-caption">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
