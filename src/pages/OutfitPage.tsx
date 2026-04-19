import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { AiBadge } from "@/components/AiBadge";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getOutfitById, getOutfitItems, shareOutfit } from "@/services/outfit-service";
import { getProfile } from "@/services/profile-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { User, X, Heart, MessageCircle, Share2, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface OutfitData {
  id: string;
  user_id: string;
  occasion: string | null;
  formality: string | null;
  confidence: number | null;
  styling_notes: string | null;
  created_at: string;
  composition_url: string | null;
  is_public: boolean;
}

interface ProfileData {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  [key: string]: any;
}

interface OutfitItem {
  wardrobe_item_id: string;
  wardrobe_items: any;
}

function adjustSvg(svgString: string): string {
  const adjusted = svgString
    .replace(/width="500"/g, 'width="100%"')
    .replace(/height="600"/g, 'height="100%"');
  
  if (!adjusted.includes('style="background-color')) {
    return adjusted.replace('<svg', '<svg style="background-color: #DEDAD9"');
  }
  return adjusted;
}

export default function OutfitPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, tValue } = useLanguage();
  const [outfit, setOutfit] = useState<OutfitData | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<ProfileData | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchOutfit = async () => {
      setLoading(true);
      const { data, error } = await getOutfitById(id);

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setOutfit(data as OutfitData);

      const profile = await getProfile((data as OutfitData).user_id);
      setCreatorProfile(profile as unknown as ProfileData | null);

      const { data: itemsData } = await getOutfitItems(id);
      setItems(itemsData || []);
      
      const wardrobeItemsList = itemsData
        ?.filter((item) => item.wardrobe_item)
        .map((item) => item.wardrobe_item) || [];
      setWardrobeItems(wardrobeItemsList);

      setLoading(false);
    };

    fetchOutfit();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <HeaderBar title="Outfit" showBack />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-96 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (notFound || !outfit) {
    return (
      <AppShell>
        <HeaderBar title="Outfit" showBack />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-body text-muted-foreground">Outfit not found</p>
            <Button variant="outline" onClick={() => navigate("/")} className="mt-4">
              Go Home
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const compositionUrl = outfit.composition_url;
  const hasCanvas = !!compositionUrl;

  return (
    <AppShell>
      <HeaderBar title="Outfit" showBack />

      <div className="space-y-6 px-4 pb-8 pt-14">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-body font-medium text-foreground">
              {creatorProfile?.username || creatorProfile?.first_name || "Anonymous"}
            </p>
            <p className="text-caption text-muted-foreground">
              {new Date(outfit.created_at).toLocaleDateString()}
              {!outfit.is_public && " · Private"}
            </p>
          </div>
        </div>

        {/* Outfit Preview */}
        <div 
          className="aspect-[5/6] rounded-xl overflow-hidden bg-[#DEDAD9]"
        >
          {hasCanvas ? (
            <div
              className="w-full h-full overflow-hidden"
              dangerouslySetInnerHTML={{
                __html: adjustSvg(
                  decodeURIComponent(compositionUrl!.replace("data:image/svg+xml;utf8,", ""))
                )
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="grid grid-cols-2 gap-2">
                {items.slice(0, 4).map((item) => (
                  <div
                    key={item.wardrobe_item_id}
                    className="h-24 w-20 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: item.wardrobe_items?.color || "#eee" }}
                  >
                    {item.wardrobe_items?.image_url && (
                      <img
                        src={item.wardrobe_items.image_url}
                        alt={item.wardrobe_items.name}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Occasion & Formality */}
        <div className="flex flex-wrap gap-2">
          {outfit.occasion && <TagChip label={tValue("occasions", outfit.occasion)} active />}
          {outfit.formality && <TagChip label={tValue("formality", outfit.formality)} active={false} />}
        </div>

        {/* Confidence */}
        {outfit.confidence && (
          <AiBadge label={`${Math.round(outfit.confidence * 100)}% match`} />
        )}

        {/* Styling Notes */}
        {outfit.styling_notes && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <AiBadge label="Styling Notes" className="mb-2" />
            <p className="text-body text-foreground">{outfit.styling_notes}</p>
          </div>
        )}

        {/* Items */}
        <div className="space-y-3">
          <p className="text-caption font-medium uppercase text-muted-foreground">{t("outfit_page.items_in_outfit")}</p>
          {wardrobeItems.length > 0 ? (
            wardrobeItems.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg border border-border object-cover"
                  />
                ) : (
                  <div
                    className="h-12 w-12 rounded-lg border border-border"
                    style={{ backgroundColor: item.color || "#eee" }}
                  />
                )}
                <div>
                  <p className="text-body font-medium text-foreground">{item.name}</p>
                  <p className="text-caption uppercase text-muted-foreground">
                    {item.clothing_categories?.name ? tValue("categories", item.clothing_categories.name) : "Clothing"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-body-sm text-muted-foreground">{t("outfit_page.no_item_details")}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={async () => {
              await shareOutfit(compositionUrl, outfit.id);
            }}
          >
            <Share2 className="h-4 w-4" />
            {t("outfit.share")}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}