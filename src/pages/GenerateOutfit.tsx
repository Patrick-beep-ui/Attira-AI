import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { generateOutfit, type GeneratedOutfit } from "@/services/ai-service";
import { Skeleton } from "@/components/ui/skeleton";

const occasions = ["Work", "Casual", "Date Night", "Event"];
const formalities = ["Relaxed", "Balanced", "Polished"];

export default function GenerateOutfit() {
  const navigate = useNavigate();
  const [occasion, setOccasion] = useState("");
  const [formality, setFormality] = useState("Balanced");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!occasion) return;
    setLoading(true);
    const result = await generateOutfit(occasion.toLowerCase().replace(" ", "-"));
    setLoading(false);
    // Pass result via state
    navigate("/outfit-result", { state: { outfit: result } });
  };

  return (
    <AppShell>
      <HeaderBar title="Generate" showBack />

      <div className="space-y-8 px-4 pt-4">
        {/* Occasion */}
        <section className="animate-fade-slide-up space-y-3">
          <div>
            <h2 className="font-display text-display-2 text-foreground">What's the Occasion?</h2>
            <p className="mt-1 text-body text-muted-foreground">We'll style an outfit from your wardrobe.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {occasions.map((o) => (
              <TagChip key={o} label={o} active={occasion === o} onClick={() => setOccasion(o)} />
            ))}
          </div>
        </section>

        {/* Formality */}
        <section className="animate-fade-slide-up space-y-3" style={{ animationDelay: "100ms" }}>
          <p className="text-body-sm font-medium text-foreground">Formality Level</p>
          <div className="flex flex-wrap gap-2">
            {formalities.map((f) => (
              <TagChip key={f} label={f} active={formality === f} onClick={() => setFormality(f)} />
            ))}
          </div>
        </section>

        {loading ? (
          <div className="space-y-4 animate-fade-slide-up">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <p className="text-center text-body-sm text-muted-foreground">Styling your perfect look...</p>
          </div>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={!occasion}
            className="w-full gap-2 rounded-xl py-6 text-body font-medium animate-fade-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <Sparkles className="h-4 w-4" />
            Generate Outfit
          </Button>
        )}
      </div>
    </AppShell>
  );
}
