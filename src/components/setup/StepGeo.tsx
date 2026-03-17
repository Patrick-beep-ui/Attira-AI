import { useState } from "react";

export default function StepGeo({ onNext, next, back }: any) {
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
        Use your current location?
      </h1>

      <p className="text-muted-foreground">
        This helps us generate weather-aware outfits.
      </p>

      <div className="flex gap-4">
        <button
          onClick={handleAllow}
          disabled={loading}
          className="flex-1 bg-primary text-white py-3 rounded-xl"
        >
          {loading ? "Getting location..." : "Allow Location"}
        </button>

        <button
          onClick={handleSkip}
          className="flex-1 border py-3 rounded-xl"
        >
          Skip
        </button>
      </div>
    </div>
  );
}