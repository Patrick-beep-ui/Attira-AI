export default function StepReview({ data, onSubmit, back }: any) {
  const physical = data?.physical || {};
  const style = data?.style || {};
  const location = data?.location || {};
  const geo = data?.geo || {};

  const rows = [
    // Physical
    { section: "Physical", items: [
      { k: "Height", v: `${physical.height_cm ?? "-"} cm` },
      { k: "Weight", v: `${physical.weight_kg ?? "-"} kg` },
    ]},

    // Style
    { section: "Style", items: [
      { k: "Body Type", v: style.body_type ?? "-" },
      { k: "Fit", v: style.preferred_fit ?? "-" },
    ]},

    // Location
    { section: "Location", items: [
      { k: "Country", v: location.country_code ?? "-" },
      { k: "City", v: location.city ?? "-" },
      geo.timezone ? { k: "Timezone", v: geo.timezone } : null,
      //geo.latitude ? { k: "Latitude", v: String(geo.latitude) } : null,
      //geo.longitude ? { k: "Longitude", v: String(geo.longitude) } : null,
    ].filter(Boolean)},
  ];

  const handleConfirm = () => {
    onSubmit();
  };
  
  console.log("FULL PROFILE DATA:", data); 

  return (
    <div className="space-y-6">
      <h1 className="text-display-3">Review & Confirm</h1>

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
          Back
        </button>

        <button
          onClick={handleConfirm}
          className="px-4 py-2 rounded bg-primary text-white"
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
}