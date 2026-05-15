import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const stepsKeys = [
  { titleKey: "onboarding.step1_title", bodyKey: "onboarding.step1_body" },
  { titleKey: "onboarding.step2_title", bodyKey: "onboarding.step2_body" },
  { titleKey: "onboarding.step3_title", bodyKey: "onboarding.step3_body" },
];

export default function Onboarding() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (step < stepsKeys.length - 1) setStep(step + 1);
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
            <p className="text-caption uppercase tracking-widest text-primary">Attira</p>
            <h1 className="whitespace-pre-line font-display text-display-1 text-foreground">
              {t(stepsKeys[step].titleKey)}
            </h1>
            <p className="max-w-xs text-body-lg text-muted-foreground">{t(stepsKeys[step].bodyKey)}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        {/* Step indicators */}
        <div className="flex gap-2">
          {stepsKeys.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : "w-4 bg-muted"
              }`}
            />
          ))}
        </div>

        <Button onClick={next} className="w-full rounded-xl py-6 text-body font-medium">
          {step < stepsKeys.length - 1 ? t("onboarding.continue") : t("onboarding.get_started")}
        </Button>

        {step === 0 && (
          <button
            onClick={() => navigate("/auth")}
            className="w-full text-center text-body-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("onboarding.already_account")}
          </button>
        )}
      </div>
    </div>
  );
}
