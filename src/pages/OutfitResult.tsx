import { useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { AiBadge } from "@/components/AiBadge";
import { Button } from "@/components/ui/button";
import { Bookmark, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { GeneratedOutfit } from "@/services/ai-service";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function OutfitResult() {

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const outfit = location.state?.outfit as GeneratedOutfit | undefined;
  const [saving, setSaving] = useState(false);

  if (!outfit) {
    return (
      <AppShell>
        <HeaderBar title="Result" showBack />
        <div className="flex h-64 items-center justify-center px-4">
          <p>No outfit to display.</p>
        </div>
      </AppShell>
    );
  }

  const handleSave = async () => {

    if (!user) {
      toast.error("Please sign in to save looks.");
      return;
    }

    setSaving(true);

    try {

      /*
      Save outfit
      */

      const { data: outfits, error: outfitError } = await supabase
        .from("outfits")
        .insert({
          user_id: user.id,
          occasion: outfit.occasion,
          formality: outfit.formality || "balanced",
          styling_notes: outfit.stylingNotes,
          confidence: outfit.confidence,
        })
        .select("id")
        .single();

      if (outfitError) throw outfitError;

      const outfitId = outfits.id;

      /*
      Save outfit items
      */

      const itemsInserts = outfit.items.map((it: any, idx: number) => ({
        outfit_id: outfitId,
        wardrobe_item_id: it.id,
        layer_order: idx,
      }));

      const { error: itemsError } = await supabase
        .from("outfit_items")
        .insert(itemsInserts);

      if (itemsError) throw itemsError;

      /*
      Update generation -> accepted
      */

      if (outfit.generationId) {

        const { error: genError } = await supabase
          .from("outfit_generations")
          .update({ accepted: true })
          .eq("id", outfit.generationId);

        if (genError) {
          console.error("Generation update failed:", genError);
        }

      }

      toast.success("Look saved!");
      navigate("/saved");

    } catch (err) {

      console.error(err);
      toast.error("Failed to save look.");

    } finally {

      setSaving(false);

    }

  };

  return (
    <AppShell>
      <HeaderBar
        title="Your Look"
        showBack
        right={<AiBadge label={`${Math.round(outfit.confidence * 100)}% match`} />}
      />

      <div className="space-y-6 px-4 pt-4 pb-8">

        <div className="space-y-3">
          {outfit.items?.map((item, i) => (

            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 rounded-lg border bg-card p-4"
            >

              {item.imageUrl ? (

                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-12 w-12 rounded-full object-cover"
                />

              ) : (

                <div
                  className="h-12 w-12 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

              )}

              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm uppercase text-muted-foreground">
                  {item.category}
                </p>
              </div>

            </motion.div>

          ))}
        </div>

        <div className="rounded-lg border bg-primary/5 p-4">
          <div className="mb-2">
            <AiBadge label="Styling Notes" />
          </div>
          <p>{outfit.stylingNotes}</p>
        </div>

        <div className="flex gap-3">

          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            <Bookmark className="h-4 w-4" />
            {saving ? "Saving..." : "Save Look"}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/generate")}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => toast.info("Sharing coming soon")}
          >
            <Share2 className="h-4 w-4" />
          </Button>

        </div>

      </div>
    </AppShell>
  );
}