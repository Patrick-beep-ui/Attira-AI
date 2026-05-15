import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Palette, Calendar } from "lucide-react";
import { generateOutfit } from "@/services/ai-service";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
const occasions = ["work", "casual", "date-night", "event"];
const formalities = ["relaxed", "balanced", "polished"];
const colorOptions = [
  { name: "Azul", hex: "#2563EB" },
  { name: "Negro", hex: "#1F2937" },
  { name: "Blanco", hex: "#F9FAFB" },
  { name: "Navy", hex: "#1E3A5F" },
  { name: "Beige", hex: "#D4B896" },
  { name: "Gris", hex: "#6B7280" },
  { name: "Verde", hex: "#059669" },
  { name: "Cafe", hex: "#92400E" },
];
export default function GenerateOutfit() {
  const navigate = useNavigate();
  const { t, tValue, tValueReverse } = useLanguage();
  const [occasion, setOccasion] = useState("");
  const [formality, setFormality] = useState("balanced");
  const [preferredColor, setPreferredColor] = useState<string | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const handleGenerate = async () => {
    if (!occasion) return;
    setLoading(true);
    try {
      const result = await generateOutfit(
        occasion.toLowerCase().replace(" ", "-"),
        formality.toLowerCase(),
        {
          preferredColor: preferredColor || undefined,
          eventTitle: showEventDetails && eventTitle ? eventTitle : undefined,
          eventDescription: showEventDetails && eventDescription ? eventDescription : undefined,
        }
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
  const handleColorClick = (colorName: string) => {
    setPreferredColor(prev => prev === colorName ? null : colorName);
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
        {/* Color Preference */}
        <section className="animate-fade-slide-up space-y-3" style={{ animationDelay: "150ms" }}>
          <div>
            <p className="text-body-sm font-medium text-foreground">{t("generate.color_preference")}</p>
            <p className="mt-1 text-body-sm text-muted-foreground">{t("generate.color_preference_subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TagChip
              label={t("generate.no_color")}
              active={preferredColor === null}
              onClick={() => setPreferredColor(null)}
            />
            {colorOptions.map((c) => (
              <TagChip 
                key={c.name} 
                label={c.name} 
                active={preferredColor === c.name}
                onClick={() => handleColorClick(c.name)}
                className={preferredColor === c.name ? "border-2" : ""}
                style={preferredColor === c.name ? { borderColor: c.hex } : undefined}
              />
            ))}
          </div>
        </section>
        {/* Event Details Toggle */}
        <section className="animate-fade-slide-up space-y-3" style={{ animationDelay: "200ms" }}>
          <button
            type="button"
            onClick={() => setShowEventDetails(!showEventDetails)}
            className="flex items-center gap-2 text-body-sm font-medium text-foreground"
          >
            <Calendar className="h-4 w-4" />
            {t("generate.event_context")}
          </button>
          
          {showEventDetails && (
            <div className="space-y-3 pl-6">
              <Input
                placeholder={t("generate.event_title_placeholder")}
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="rounded-xl"
              />
              <Textarea
                placeholder={t("generate.event_description_placeholder")}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>
          )}
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
            style={{ animationDelay: "250ms" }}
          >
            <Sparkles className="h-4 w-4" />
            {t("generate.generate")} {t("outfit.outfit")}
          </Button>
        )}
      </div>
    </AppShell>
  );
}