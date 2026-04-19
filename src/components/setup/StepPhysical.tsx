import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StepPhysical({ data, onNext, next }: any) {
  const { t } = useLanguage();
  const [height, setHeight] = useState(data.height_cm || "");
  const [weight, setWeight] = useState(data.weight_kg || "");

  const handle = () => {
    const h = Number(height);
    const w = Number(weight);

    if (Number.isNaN(h) || h < 120 || h > 220) return;
    if (Number.isNaN(w) || w < 35 || w > 200) return;

    onNext("physical", { height_cm: h, weight_kg: w });
    next();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-display-3">{t("step_physical.title")}</h1>
      <p className="text-muted-foreground text-sm">
        {t("step_physical.subtitle")}
      </p>

      <input
        className="rounded-xl border border-border bg-card w-full py-3 px-3"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        placeholder={t("step_physical.height_placeholder")}
        type="number"
      />

      <input
        className="rounded-xl border border-border bg-card w-full py-3 px-3"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder={t("step_physical.weight_placeholder")}
        type="number"
      />

      <Button onClick={handle} className="w-full">
        {t("step_physical.continue")}
      </Button>
    </div>
  );
}