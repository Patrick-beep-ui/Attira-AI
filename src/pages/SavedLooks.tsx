import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { OutfitCard } from "@/components/OutfitCard";
import { TagChip } from "@/components/TagChip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { GeneratedOutfit } from "@/services/ai-service";

const filterOptions = ["All", "Work", "Casual", "Date Night", "Event"];

export default function SavedLooks() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [looks, setLooks] = useState<GeneratedOutfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchLooks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("saved_outfits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLooks(
          data.map((row) => ({
            id: row.id,
            occasion: row.occasion,
            items: (row.items as any[]) || [],
            stylingNotes: row.styling_notes || "",
            confidence: row.confidence ?? 0,
          }))
        );
      }
      setLoading(false);
    };
    fetchLooks();
  }, [user]);

  const filtered = filter === "All" ? looks : looks.filter((l) => l.occasion === filter.toLowerCase().replace(" ", "-"));

  return (
    <AppShell>
      <HeaderBar title="Saved Looks" />

      <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-none">
        {filterOptions.map((f) => (
          <TagChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 px-4 pt-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : (
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
      )}
    </AppShell>
  );
}
