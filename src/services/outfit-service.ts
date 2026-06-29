import { supabase } from "@/integrations/supabase/client";

const SHARE_MESSAGES: Record<string, { title: string; text: string }> = {
  en: {
    title: "My Attira Outfit",
    text: "Look at my outfit made with Attira 🤩",
  },
  es: {
    title: "Mi Outfit de Attira",
    text: "Mira mi outfit creado con Attira 🤩",
  },
};

const APP_URL = "https://app.attiraai.com";

export async function shareOutfit(compositionUrl: string | null, outfitId?: string, language?: string): Promise<boolean> {
  const lang = language === "es" ? "es" : "en";
  const messages = SHARE_MESSAGES[lang];
  const outfitLink = outfitId ? `${APP_URL}/outfit/${outfitId}` : APP_URL;
  const shareText = `${messages.text}\n\n${outfitLink}`;

  const shareData: ShareData = {
    title: messages.title,
    text: shareText,
    url: outfitLink,
  };

  if (outfitId) {
    try {
      const ogImageUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og?mode=image&outfit_id=${outfitId}`;
      const response = await fetch(ogImageUrl);
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], "outfit.png", { type: "image/png" });
        shareData.files = [file];
      }
    } catch (err) {
      console.log("Could not load image for sharing:", err);
    }
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (err: any) {
      if (err.name === "AbortError") return true;
      console.log("Share API error:", err);
    }
  }

  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch (err) {
      console.log("Clipboard failed:", err);
    }
  }

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

  window.open(`mailto:?subject=${encodeURIComponent(messages.title)}&body=${encodeURIComponent(shareText)}`);
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
    .select("*, outfit_likes(count), outfit_comments(count)")
    .eq("is_public", true)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !outfits) return { data: null, error };

  const userIds = [...new Set(outfits.map(o => o.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, username, first_name, last_name, profile_picture_url")
    .in("user_id", userIds);

  const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

  const data = outfits.map(o => ({
    ...o,
    profiles: profileMap.get(o.user_id) || null,
    like_count: o.outfit_likes?.[0]?.count || 0,
    comment_count: o.outfit_comments?.[0]?.count || 0
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

export interface OutfitComment {
  id: string;
  user_id: string;
  outfit_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export async function addComment(userId: string, outfitId: string, content: string) {
  const { data, error } = await supabase
    .from("outfit_comments")
    .insert({ user_id: userId, outfit_id: outfitId, content: content.trim() })
    .select("*, profiles:profiles(username, first_name, last_name)")
    .single();

  return { data: data as OutfitComment | null, error };
}

export async function deleteComment(commentId: string, userId: string) {
  const { error } = await supabase
    .from("outfit_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  return { error };
}

export async function deleteCommentAsOwner(commentId: string, outfitOwnerId: string) {
  const { data: comment, error: fetchError } = await supabase
    .from("outfit_comments")
    .select("outfit_id")
    .eq("id", commentId)
    .single();

  if (fetchError || !comment) return { error: fetchError };

  const { error } = await supabase
    .from("outfit_comments")
    .delete()
    .eq("id", commentId);

  return { error };
}

export async function getOutfitComments(outfitId: string) {
  const { data, error } = await supabase
    .from("outfit_comments")
    .select("*, profiles:profiles(username, first_name, last_name)")
    .eq("outfit_id", outfitId)
    .order("created_at", { ascending: true });

  return { data: data as OutfitComment[] | null, error };
}

export async function getCommentCount(outfitId: string) {
  const { count, error } = await supabase
    .from("outfit_comments")
    .select("*", { count: "exact" })
    .eq("outfit_id", outfitId);

  return { count: count || 0, error };
}