import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Your Intelligent\nPersonal Stylist",
    body: "Dressly combines fashion intelligence with your unique style to create outfits that feel distinctly you.",
  },
  {
    title: "Built Around\nYour Body & Life",
    body: "Climate-aware, body-conscious, occasion-ready. Every recommendation is tailored to how you live.",
  },
  {
    title: "Curated.\nNot Random.",
    body: "No algorithmic noise. Just calm, considered outfit combinations from your own wardrobe.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else navigate("/auth");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col justify-between bg-background px-6 pb-12 pt-20">
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <p className="text-caption uppercase tracking-widest text-primary">Dressly</p>
            <h1 className="whitespace-pre-line font-display text-display-1 text-foreground">
              {steps[step].title}
            </h1>
            <p className="max-w-xs text-body-lg text-muted-foreground">{steps[step].body}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        {/* Step indicators */}
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : "w-4 bg-muted"
              }`}
            />
          ))}
        </div>

        <Button onClick={next} className="w-full rounded-xl py-6 text-body font-medium">
          {step < steps.length - 1 ? "Continue" : "Get Started"}
        </Button>

        {step === 0 && (
          <button
            onClick={() => navigate("/auth")}
            className="w-full text-center text-body-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Already have an account? Sign in
          </button>
        )}
      </div>
    </div>
  );
}
