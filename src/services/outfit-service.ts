import { supabase } from "@/integrations/supabase/client";

const SHARE_MESSAGE = "Check out my new outfit generated with Attira 🤩";
const APP_URL = "https://dressly.app";

export async function shareOutfit(compositionUrl: string | null, outfitId?: string): Promise<boolean> {
  const outfitLink = outfitId ? `${APP_URL}/outfit/${outfitId}` : APP_URL;
  const shareText = `${SHARE_MESSAGE}\n\n${outfitLink}`;
  
  // Build share data
  const shareData: ShareData = {
    title: "My Attira Outfit",
    text: shareText,
    url: outfitLink,
  };
  
  // Try to add image if available
  if (compositionUrl) {
    try {
      const response = await fetch(compositionUrl);
      const blob = await response.blob();
      const file = new File([blob], "outfit.png", { type: "image/png" });
      shareData.files = [file];
    } catch (err) {
      console.log("Could not load image for sharing:", err);
    }
  }
  
  // Try Web Share API directly (works on iOS Safari, Chrome mobile even if canShare returns false)
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (err: any) {
      // User cancelled is not an error
      if (err.name === "AbortError") return true;
      console.log("Share API error:", err);
    }
  }
  
  // Fallback: clipboard
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch (err) {
      console.log("Clipboard failed:", err);
    }
  }
  
  // Last fallback: copy textarea
  const textarea = document.createElement("textarea");
  textarea.value = shareText;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  } catch (err) {
    document.body.removeChild(textarea);
  }
  
  // Last resort: email
  window.open(`mailto:?subject=Check out my outfit&body=${encodeURIComponent(shareText)}`);
  return true;
}

export async function publishOutfit(userId: string, outfitId: string) {
  const { error } = await supabase
    .from("outfits")
    .update({ 
      is_public: true, 
      published_at: new Date().toISOString() 
    })
    .eq("id", outfitId)
    .eq("user_id", userId);

  return { error };
}

export async function unpublishOutfit(userId: string, outfitId: string) {
  const { error } = await supabase
    .from("outfits")
    .update({ 
      is_public: false, 
      published_at: null 
    })
    .eq("id", outfitId)
    .eq("user_id", userId);

  return { error };
}

export async function getUserOutfits(userId: string) {
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getPublicOutfits(limit = 20, offset = 0) {
  const { data: outfits, error } = await supabase
    .from("outfits")
    .select("*, outfit_likes(count)")
    .eq("is_public", true)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !outfits) return { data: null, error };

  const userIds = [...new Set(outfits.map(o => o.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, username, first_name, last_name")
    .in("user_id", userIds);

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  const data = outfits.map(o => ({
    ...o,
    profiles: profileMap.get(o.user_id) || null
  }));

  return { data, error: null };
}

export async function toggleLike(userId: string, outfitId: string) {
  const { data: existing } = await supabase
    .from("outfit_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("outfit_id", outfitId)
    .single();

  if (existing) {
    await supabase
      .from("outfit_likes")
      .delete()
      .eq("user_id", userId)
      .eq("outfit_id", outfitId);
    return { liked: false };
  } else {
    await supabase
      .from("outfit_likes")
      .insert({ user_id: userId, outfit_id: outfitId });
    return { liked: true };
  }
}

export async function getLikeCount(outfitId: string) {
  const { count, error } = await supabase
    .from("outfit_likes")
    .select("*", { count: "exact" })
    .eq("outfit_id", outfitId);

  return { count: count || 0, error };
}

export async function getUserLikes(userId: string, outfitIds: string[]) {
  const { data } = await supabase
    .from("outfit_likes")
    .select("outfit_id")
    .eq("user_id", userId)
    .in("outfit_id", outfitIds);

  return data?.map((d) => d.outfit_id) || [];
}

export async function getOutfitById(outfitId: string) {
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("id", outfitId)
    .single();

  return { data, error };
}

export async function getOutfitItems(outfitId: string) {
  const { data: outfitItems, error } = await supabase
    .from("outfit_items")
    .select("wardrobe_item_id, layer_order")
    .eq("outfit_id", outfitId);

  if (error || !outfitItems) return { data: [], error };

  const wardrobeIds = outfitItems.map((item) => item.wardrobe_item_id);

  const { data: wardrobeItems } = await supabase
    .from("wardrobe_items")
    .select("*, clothing_categories(name)")
    .in("id", wardrobeIds);

  const itemsWithDetails = outfitItems.map((oi) => ({
    ...oi,
    wardrobe_item: wardrobeItems?.find((w) => w.id === oi.wardrobe_item_id) || null,
  }));

  return { data: itemsWithDetails, error: null };
}