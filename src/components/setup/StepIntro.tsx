import { useLanguage } from "@/contexts/LanguageContext";

export default function StepIntro({ onNext }: any) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className="text-display-2">
        {t("step_intro.title")}
      </h1>

      <p className="text-muted-foreground">
        {t("step_intro.subtitle")}
      </p>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl"
      >
        {t("step_intro.start")}
      </button>
    </div>
  );
}