import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TagChip } from "@/components/TagChip";
import { motion, AnimatePresence } from "framer-motion";

const bodyTypes = ["Slim", "Athletic", "Average", "Curvy", "Plus"];
const fitPreferences = ["Relaxed", "Regular", "Slim", "Tailored"];
const stylePreferences = ["Minimalist", "Classic", "Casual", "Smart Casual", "Formal", "Streetwear", "Bohemian", "Preppy"];
const climateOptions = ["Tropical", "Temperate", "Cold", "Dry/Arid", "Humid"];

export default function BodyProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    bodyType: "",
    fit: "",
    styles: [] as string[],
    climate: "",
  });

  const toggleStyle = (s: string) => {
    setProfile((p) => ({
      ...p,
      styles: p.styles.includes(s) ? p.styles.filter((x) => x !== s) : [...p.styles, s],
    }));
  };

  const canContinue = step === 0 ? profile.bodyType && profile.fit : step === 1 ? profile.styles.length > 0 : profile.climate;

  const next = () => {
    if (step < 2) setStep(step + 1);
    else navigate("/home");
  };

  const pages = [
    // Step 0: Body type + fit
    <div key="body" className="space-y-8">
      <div>
        <h2 className="font-display text-display-2 text-foreground">Your Body</h2>
        <p className="mt-1 text-body text-muted-foreground">Helps us recommend the best fits for you.</p>
      </div>
      <div className="space-y-3">
        <p className="text-body-sm font-medium text-foreground">Body Type</p>
        <div className="flex flex-wrap gap-2">
          {bodyTypes.map((t) => (
            <TagChip key={t} label={t} active={profile.bodyType === t} onClick={() => setProfile((p) => ({ ...p, bodyType: t }))} />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-body-sm font-medium text-foreground">Preferred Fit</p>
        <div className="flex flex-wrap gap-2">
          {fitPreferences.map((f) => (
            <TagChip key={f} label={f} active={profile.fit === f} onClick={() => setProfile((p) => ({ ...p, fit: f }))} />
          ))}
        </div>
      </div>
    </div>,
    // Step 1: Style preferences
    <div key="style" className="space-y-8">
      <div>
        <h2 className="font-display text-display-2 text-foreground">Your Style</h2>
        <p className="mt-1 text-body text-muted-foreground">Select all that resonate with you.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {stylePreferences.map((s) => (
          <TagChip key={s} label={s} active={profile.styles.includes(s)} onClick={() => toggleStyle(s)} />
        ))}
      </div>
    </div>,
    // Step 2: Climate
    <div key="climate" className="space-y-8">
      <div>
        <h2 className="font-display text-display-2 text-foreground">Your Climate</h2>
        <p className="mt-1 text-body text-muted-foreground">We'll optimize outfit choices for your weather.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {climateOptions.map((c) => (
          <TagChip key={c} label={c} active={profile.climate === c} onClick={() => setProfile((p) => ({ ...p, climate: c }))} />
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-6 pb-12 pt-16">
      {/* Progress */}
      <div className="mb-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            {pages[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3 pt-6">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-xl py-6">
            Back
          </Button>
        )}
        <Button onClick={next} disabled={!canContinue} className="flex-1 rounded-xl py-6 text-body font-medium">
          {step < 2 ? "Continue" : "Finish Setup"}
        </Button>
      </div>
    </div>
  );
}
