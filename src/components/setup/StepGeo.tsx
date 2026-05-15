import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StepGeo({ onNext, next, back }: any) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleAllow = () => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        onNext("geo", {
          latitude,
          longitude,
          timezone,
        });

        setLoading(false);
        next();
      },
      () => {
        // fallback if denied
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        onNext("geo", { timezone });

        setLoading(false);
        next();
      }
    );
  };

  const handleSkip = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    onNext("geo", { timezone });
    next();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">
        {t("step_geo.title")}
      </h1>

      <p className="text-muted-foreground">
        {t("step_geo.subtitle")}
      </p>

      <div className="flex gap-4">
        <button
          onClick={handleAllow}
          disabled={loading}
          className="flex-1 bg-primary text-white py-3 rounded-xl"
        >
          {loading ? t("step_geo.getting_location") : t("step_geo.allow_location")}
        </button>

        <button
          onClick={handleSkip}
          className="flex-1 border py-3 rounded-xl"
        >
          {t("step_geo.skip")}
        </button>
      </div>
    </div>
  );
}