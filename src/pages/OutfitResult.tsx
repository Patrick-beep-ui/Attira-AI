import { useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { AiBadge } from "@/components/AiBadge";
import { Button } from "@/components/ui/button";
import { Bookmark, RefreshCw, Share2, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import type { GeneratedOutfit } from "@/services/ai-service";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { publishOutfit, unpublishOutfit, shareOutfit } from "@/services/outfit-service";

export default function OutfitResult() {

  const location = useLocation();
  const navigate = useNavigate();
  const { t, tValue } = useLanguage();
  const { user } = useAuth();
  const outfit = location.state?.outfit as GeneratedOutfit | undefined;
  console.log("🎬 OUTFIT RESULT:", outfit);
  
  const [saving, setSaving] = useState(false);
  const [currentOutfitId, setCurrentOutfitId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const compositionUrl = (outfit as any)?.compositionUrl ?? (outfit as any)?.composition_url ?? null;
  const weatherContext = outfit.weather?.context ?? null;

  if (!outfit) {
    return (
      <AppShell>
        <HeaderBar title={t("outfit_result.result")} showBack />
        <div className="flex h-64 items-center justify-center px-4">
          <p>{t("outfit_result.no_outfit_to_display")}</p>
        </div>
      </AppShell>
    );
  }

  const handleSave = async () => {

    if (!user) {
      toast.error(t("outfit_result.please_sign_in"));
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
          composition_url: compositionUrl,
          weather_temperature: outfit.weather?.temperature ?? null,
          weather_condition: outfit.weather?.condition ?? null,
          weather_context: outfit.weather?.context ?? null,
        })
        .select("id")
        .single();

      if (outfitError) throw outfitError;

      const outfitId = outfits.id;
      setCurrentOutfitId(outfitId);
      setIsPublic(false);

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

      toast.success(t("outfit_result.look_saved"));
      navigate("/saved");

    } catch (err) {

      console.error(err);
      toast.error(t("outfit_result.failed_to_save"));

    } finally {

      setSaving(false);

    }

  };

  return (
    
    <AppShell>
      { /*
      {compositionUrl && (
        <div className="mb-4">
          <img src={compositionUrl} alt="Outfit composition" style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 12 }} />
        </div>
      )}
      {compositionUrl ? (
        <div className="mb-4">
          <img src={compositionUrl} alt="Outfit composition" style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 12 }} />
        </div>
      ) : null}
      <HeaderBar
        title={t("outfit_result.your_look")}
        showBack
        right={<AiBadge label={`${Math.round(outfit.confidence * 100)}% match`} />}
      />
    */}

      <div className="space-y-6 px-4 pt-4 pb-8">

        {/*compositionUrl && (
          <div className="mb-4">
            <img
              src={compositionUrl}
              alt="Outfit composition"
              style={{
                width: "100%",
                maxHeight: 360,
                objectFit: "cover",
                borderRadius: 12
              }}
            />
          </div>
        )*/}

        {compositionUrl && (
          <div className="mb-4 w-full max-w-sm mx-auto" style={{ aspectRatio: "5 / 6", borderRadius: 12, overflow: "hidden", backgroundColor: "#DEDAD9" }}>
            <div
              className="w-full max-w-[350px] aspect-[5/6] mx-auto rounded-lg border svg-container"
              dangerouslySetInnerHTML={{
                __html: decodeURIComponent(
                  compositionUrl.replace("data:image/svg+xml;utf8,", "")
                )
              }}
            />
          </div>
        )}

        {weatherContext && (() => {
          const parts = weatherContext.split(" and ");
          const temp = parts[0] || "";
          const condition = parts[1] || "";
          return (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>{t("outfit_result.weather")} {temp}{condition && ` ${tValue("weather_conditions", condition)}`}</span>
            </div>
          );
        })()}

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
                  {item.category ? tValue("categories", item.category) : ""}
                </p>
              </div>

            </motion.div>

          ))}
        </div>

        <div className="rounded-lg border bg-primary/5 p-4">
          <div className="mb-2">
            <AiBadge label={t("outfit_result.styling_notes")} />
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
            {saving ? t("outfit_result.saving") : t("outfit_result.save_look")}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/generate")}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

        </div>

        {currentOutfitId && (
          <div className="flex gap-3">
            <Button
              variant={isPublic ? "default" : "outline"}
              onClick={async () => {
                if (!user) return;
                setPublishing(true);
                try {
                  if (isPublic) {
                    await unpublishOutfit(user.id, currentOutfitId);
                    setIsPublic(false);
                    toast.success(t("outfit_result.outfit_is_private"));
                  } else {
                    await publishOutfit(user.id, currentOutfitId);
                    setIsPublic(true);
                    toast.success(t("outfit_result.outfit_is_public"));
                  }
                } catch (err) {
                  toast.error(t("outfit_result.failed_to_update"));
                } finally {
                  setPublishing(false);
                }
              }}
              disabled={publishing}
              className="flex-1"
            >
              {isPublic ? (
                <>
                  <Lock className="h-4 w-4" />
                  {publishing ? "..." : t("outfit_result.make_private")}
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  {publishing ? "..." : t("outfit_result.publish")}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                await shareOutfit(compositionUrl ?? null, currentOutfitId ?? undefined);
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}

      </div>
    </AppShell>
  );
}
