import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { generateOutfit } from "@/services/ai-service";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const occasions = ["work", "casual", "date-night", "event"];
const formalities = ["relaxed", "balanced", "polished"];

export default function GenerateOutfit() {
  const navigate = useNavigate();
  const { t, tValue, tValueReverse } = useLanguage();
  const [occasion, setOccasion] = useState("");
  const [formality, setFormality] = useState("Balanced");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!occasion) return;
    setLoading(true);
    try {
      const result = await generateOutfit(
        occasion.toLowerCase().replace(" ", "-"),
        formality.toLowerCase()
      );
      navigate("/outfit-result", { state: { outfit: result } });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate outfit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOccasionClick = (engValue: string) => {
    setOccasion(engValue);
  };

  const handleFormalityClick = (engValue: string) => {
    setFormality(engValue);
  };

  return (
    <AppShell>
      <HeaderBar title={t("generate.generate")} showBack />

      <div className="space-y-8 px-4 pt-4">
        {/* Occasion */}
        <section className="animate-fade-slide-up space-y-3">
          <div>
            <h2 className="font-display text-display-2 text-foreground">{t("generate.occasion")}</h2>
            <p className="mt-1 text-body text-muted-foreground">{t("generate.occasion_subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {occasions.map((o) => (
              <TagChip 
                key={o} 
                label={tValue("occasions", o)} 
                active={occasion === o} 
                onClick={() => handleOccasionClick(o)} 
              />
            ))}
          </div>
        </section>

        {/* Formality */}
        <section className="animate-fade-slide-up space-y-3" style={{ animationDelay: "100ms" }}>
          <p className="text-body-sm font-medium text-foreground">{t("generate.formality")}</p>
          <div className="flex flex-wrap gap-2">
            {formalities.map((f) => (
              <TagChip 
                key={f} 
                label={tValue("formality", f)} 
                active={formality === f} 
                onClick={() => handleFormalityClick(f)} 
              />
            ))}
          </div>
        </section>

        {loading ? (
          <div className="space-y-4 animate-fade-slide-up">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <p className="text-center text-body-sm text-muted-foreground">{t("generate.generating")}</p>
          </div>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={!occasion}
            className="w-full gap-2 rounded-xl py-6 font-medium animate-fade-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <Sparkles className="h-4 w-4" />
            {t("generate.generate")} {t("outfit.outfit")}
          </Button>
        )}
      </div>
    </AppShell>
  );
}
