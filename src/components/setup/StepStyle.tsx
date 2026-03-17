import { useState } from "react";

type BodyType = "ectomorph" | "mesomorph" | "endomorph" | "athletic" | "average";
type FitType = "tight" | "regular" | "relaxed" | "oversized";

const bodyTypes: BodyType[] = ["ectomorph","mesomorph","endomorph","athletic","average"];
const fits: FitType[] = ["tight","regular","relaxed","oversized"];

const bodyTypeInfo = {
  ectomorph: "Slim, lean build",
  mesomorph: "Naturally muscular",
  endomorph: "Broader, softer build",
  athletic: "Active, balanced physique",
  average: "Standard body proportions",
};

export default function StepStyle({ onNext, next, back }: any) {
  const [body, setBody] = useState<BodyType | "">("");
  const [fit, setFit] = useState<FitType | "">("");

  const handle = () => {
    if (!body || !fit) return;
    onNext("style", { body_type: body, preferred_fit: fit });
    next();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-display-3">Your Style</h1>

      {/* Body Type */}
      <div>
        <p className="text-sm font-medium mb-2">Body Type</p>
        <div className="grid grid-cols-2 gap-3">
          {bodyTypes.map((b) => (
            <div
              key={b}
              onClick={() => setBody(b)}
              className={`p-3 rounded-xl border cursor-pointer transition ${
                body === b ? "bg-primary text-white" : "bg-card"
              }`}
            >
              <p className="font-medium capitalize">{b}</p>
              <p className="text-xs opacity-80">{bodyTypeInfo[b]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fit */}
      <div>
        <p className="text-sm font-medium mb-2">Fit Preference</p>
        <div className="flex gap-2 flex-wrap">
          {fits.map((f) => (
            <button
              key={f}
              onClick={() => setFit(f)}
              className={`px-3 py-2 rounded-xl border ${
                fit === f ? "bg-primary text-white" : "bg-card"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={back}>Back</button>
        <button onClick={handle} className="bg-primary text-white px-4 py-2 rounded">
          Continue
        </button>
      </div>
    </div>
  );
}
