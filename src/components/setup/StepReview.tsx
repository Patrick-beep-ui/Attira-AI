import { useLanguage } from "@/contexts/LanguageContext";

export default function StepReview({ data, onSubmit, back }: any) {
  const { t, tValue } = useLanguage();
  const physical = data?.physical || {};
  const style = data?.style || {};
  const location = data?.location || {};
  const geo = data?.geo || {};

  const rows = [
    // Physical
    { section: t("step_review.physical"), items: [
      { k: t("step_review.height"), v: `${physical.height_cm ?? "-"} cm` },
      { k: t("step_review.weight"), v: `${physical.weight_kg ?? "-"} kg` },
    ]},

    // Style
    { section: t("step_review.style"), items: [
      { k: t("step_review.body_type"), v: style.body_type ? tValue("body_type_names", style.body_type) : "-" },
      { k: t("step_review.fit"), v: style.preferred_fit ? tValue("fits", style.preferred_fit) : "-" },
    ]},

    // Location
    { section: t("step_review.location"), items: [
      { k: t("step_review.country"), v: location.country_code ?? "-" },
      { k: t("step_review.city"), v: location.city ?? "-" },
      geo.timezone ? { k: t("step_review.timezone"), v: geo.timezone } : null,
    ].filter(Boolean)},
  ];

  const handleConfirm = () => {
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-display-3">{t("step_review.title")}</h1>

      <div className="space-y-4">
        {rows.map((section) => (
          <div key={section.section} className="border rounded-xl bg-card p-4">
            <h2 className="text-sm font-semibold mb-2 text-muted-foreground">
              {section.section}
            </h2>

            <div className="space-y-1">
              {section.items.map((item: any) => (
                <div key={item.k} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {item.k}
                  </span>
                  <span className="text-sm font-medium">
                    {item.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={back} className="px-4 py-2 rounded">
          {t("step_review.back")}
        </button>

        <button
          onClick={handleConfirm}
          className="px-4 py-2 rounded bg-primary text-white"
        >
          {t("step_review.confirm_continue")}
        </button>
      </div>
    </div>
  );
}