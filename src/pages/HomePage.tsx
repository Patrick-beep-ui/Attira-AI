import { AppShell } from "@/components/AppShell";
import { AiBadge } from "@/components/AiBadge";
import { OutfitCard } from "@/components/OutfitCard";
import { Button } from "@/components/ui/button";
import { getTodaysLook } from "@/services/ai-service";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { useMemo } from "react";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const todaysLook = useMemo(() => getTodaysLook(), []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell>
      <div className="px-4 pt-14">
        {/* Greeting */}
        <div className="mb-8 animate-fade-slide-up">
          <p className="text-caption uppercase tracking-wider text-primary">Dressly</p>
          <h1 className="mt-1 font-display text-display-1 text-foreground">{greeting()}</h1>
          <p className="mt-1 text-body text-muted-foreground">{dateStr}</p>
        </div>

        {/* Today's Look */}
        <section className="mb-8 animate-fade-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-display-3 text-foreground">Today's Look</h2>
            <AiBadge />
          </div>
          <div
            onClick={() => navigate("/generate")}
            className="cursor-pointer overflow-hidden rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Color palette preview */}
            <div className="mb-3 flex gap-2">
              {todaysLook.items.map((item) => (
                <div key={item.id} className="flex flex-col items-center gap-1">
                  <div
                    className="h-12 w-12 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] text-muted-foreground">{item.category}</span>
                </div>
              ))}
            </div>
            <p className="text-body-sm text-muted-foreground">{todaysLook.stylingNotes}</p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8 flex gap-3 animate-fade-slide-up" style={{ animationDelay: "200ms" }}>
          <Button onClick={() => navigate("/generate")} className="flex-1 gap-2 rounded-xl py-6">
            <Sparkles className="h-4 w-4" />
            Generate Outfit
          </Button>
          <Button onClick={() => navigate("/wardrobe")} variant="outline" className="flex-1 gap-2 rounded-xl py-6">
            Browse Wardrobe
            <ArrowRight className="h-4 w-4" />
          </Button>
        </section>

        {/* Recent */}
        <section className="animate-fade-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-display-3 text-foreground">Recent Looks</h2>
            <button onClick={() => navigate("/saved")} className="text-body-sm font-medium text-primary">
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <OutfitCard outfit={todaysLook} compact onClick={() => navigate("/saved")} />
            <OutfitCard outfit={{ ...todaysLook, id: "2", occasion: "casual" }} compact onClick={() => navigate("/saved")} />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
