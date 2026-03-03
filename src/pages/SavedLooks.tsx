import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { OutfitCard } from "@/components/OutfitCard";
import { TagChip } from "@/components/TagChip";
import { getTodaysLook } from "@/services/ai-service";
import { useState, useMemo } from "react";

const filterOptions = ["All", "Work", "Casual", "Date Night", "Event"];

export default function SavedLooks() {
  const [filter, setFilter] = useState("All");

  // Mock saved looks
  const looks = useMemo(() => {
    const base = getTodaysLook();
    return [
      { ...base, id: "s1", occasion: "work" },
      { ...base, id: "s2", occasion: "casual" },
      { ...base, id: "s3", occasion: "date-night" },
      { ...base, id: "s4", occasion: "event" },
    ];
  }, []);

  const filtered = filter === "All" ? looks : looks.filter((l) => l.occasion === filter.toLowerCase().replace(" ", "-"));

  return (
    <AppShell>
      <HeaderBar title="Saved Looks" />

      <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-none">
        {filterOptions.map((f) => (
          <TagChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pb-24 pt-3">
        {filtered.map((look) => (
          <OutfitCard key={look.id} outfit={look} compact />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center">
            <p className="text-body text-muted-foreground">No saved looks yet.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
