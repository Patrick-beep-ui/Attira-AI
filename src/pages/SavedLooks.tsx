import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { OutfitCard } from "@/components/OutfitCard";
import { TagChip } from "@/components/TagChip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AiBadge } from "@/components/AiBadge";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { GeneratedOutfit } from "@/services/ai-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const filterOptions = ["All", "Work", "Casual", "Date Night", "Event"];

interface SavedLook extends GeneratedOutfit {
  formality?: string;
  createdAt?: string;
  compositionUrl?: string;
  composition_url?: string;
}

export default function SavedLooks() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLook, setSelectedLook] = useState<SavedLook | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchLooks = async () => {
      setLoading(true);
      // 1) Fetch outfits from the new schema
      const { data: outfits, error: outfitsError } = await supabase
        .from("outfits")
        .select("id, occasion, formality, styling_notes, confidence, created_at, composition_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (outfitsError) {
        console.error("Failed to fetch outfits:", outfitsError);
        setLoading(false);
        return;
      }

      // 2) For each outfit, fetch its items from outfit_items joined to wardrobe_items
      const outfitsWithItems = await Promise.all(
        outfits.map(async (o: any) => {
          const { data: itemRows, error: itemsError } = await supabase
            .from("outfit_items")
            .select("wardrobe_item_id, wardrobe_items(id, name, color, image_url, category_id, clothing_categories(name)))")
            .eq("outfit_id", o.id);
          if (itemsError) {
            console.error("Failed to fetch items for outfit", o.id, itemsError);
            return { ...o, items: [] };
          }
          const items = (itemRows ?? []).map((r: any) => {
            const w = r.wardrobe_items ?? {};
            const categoryName = w.clothing_categories?.name ?? "";
            const categoryValue = (categoryName || "").toLowerCase();
            return {
              id: w.id ?? r.wardrobe_item_id,
              name: w.name ?? "",
              category: categoryValue,
              color: w.color ?? null,
              imageUrl: w.image_url ?? null
            };
          });
          return { id: o.id, occasion: o.occasion, formality: o.formality ?? "balanced", stylingNotes: o.styling_notes ?? "", confidence: o.confidence ?? 0, createdAt: o.created_at, composition_url: o.composition_url, items };
        })
      );

      // 3) Normalize to SavedLook shape
      setLooks(
        outfitsWithItems.map((o: any) => ({
          id: o.id,
          occasion: o.occasion,
          formality: o.formality,
          items: o.items,
          stylingNotes: o.stylingNotes,
          confidence: o.confidence,
          createdAt: o.createdAt,
          compositionUrl: o.composition_url,
          composition_url: o.composition_url,
        }))
      );
      setLoading(false);
    };
    fetchLooks();
  }, [user]);

  const filtered =
    filter === "All"
      ? looks
      : looks.filter((l) => l.occasion.toLowerCase().replace(/\s+/g, "-") === filter.toLowerCase().replace(/\s+/g, "-"));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    // Delete from new outfits table (and cascading items if configured)
    const { error } = await (supabase as any).from("outfits").delete().eq("id", deleteTarget);
    if (error) {
      toast.error("Failed to delete look.");
    } else {
      setLooks((prev) => prev.filter((l) => l.id !== deleteTarget));
      if (selectedLook?.id === deleteTarget) setSelectedLook(null);
      toast.success("Look deleted.");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <AppShell>
      <HeaderBar title="Saved Looks" />

      <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-none">
        {filterOptions.map((f) => (
          <TagChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 px-4 pt-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-4 pb-24 pt-3">
          {filtered.map((look) => (
            <OutfitCard key={look.id} outfit={look} compact onClick={() => setSelectedLook(look)} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 py-16 text-center">
              <p className="text-body text-muted-foreground">No saved looks yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Sheet */}
      <AnimatePresence>
        {selectedLook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setSelectedLook(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-display-2 text-foreground">Look Details</h2>
                <button onClick={() => setSelectedLook(null)} className="rounded-full p-1.5 hover:bg-muted">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Occasion & Formality */}
              <div className="mb-4 flex flex-wrap gap-2">
                <TagChip label={selectedLook.occasion} active />
                {selectedLook.formality && (
                  <TagChip label={selectedLook.formality} active={false} />
                )}
                <AiBadge label={`${Math.round(selectedLook.confidence * 100)}% match`} />
              </div>

              {/* Items */}
              <div className="mb-4 space-y-3">
                <p className="text-caption font-medium uppercase text-muted-foreground">Outfit Items</p>
                {selectedLook.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-lg border border-border object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg border border-border" style={{ backgroundColor: item.color }} />
                    )}
                    <div>
                      <p className="text-body font-medium text-foreground">{item.name}</p>
                      <p className="text-caption uppercase text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Styling Notes */}
              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <AiBadge label="Styling Notes" className="mb-2" />
                <p className="text-body text-foreground">{selectedLook.stylingNotes}</p>
              </div>

              {/* Suggestion */}
              <div className="mb-6 rounded-lg border border-accent/30 bg-accent/10 p-4">
                <p className="mb-1 text-caption font-medium uppercase text-muted-foreground">Tip</p>
                <p className="text-body-sm text-foreground">
                  {selectedLook.confidence >= 0.8
                    ? "This is a strong match! Consider adding complementary accessories to elevate the look further."
                    : "Try adding more items to your wardrobe in complementary colors for better outfit variety."}
                </p>
              </div>

              {/* Delete */}
              <Button
                variant="destructive"
                className="w-full gap-2 rounded-xl"
                onClick={() => setDeleteTarget(selectedLook.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Look
              </Button>
              <div className="h-20" aria-hidden="true" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this look?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
