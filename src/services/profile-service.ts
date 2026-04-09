import { supabase } from "@/integrations/supabase/client";

export type CreateUserProfileDTO = {
  height_cm: number;
  weight_kg: number;

  body_type: "ectomorph" | "mesomorph" | "endomorph" | "athletic" | "average";
  preferred_fit: "tight" | "regular" | "relaxed" | "oversized";

  country_code: string;
  city: string;

  latitude?: number;
  longitude?: number;

  timezone: string;
  
  style_preferences?: string[];
};

const styleNameToId: Record<string, number> = {
  "Minimalist": 1,
  "Streetwear": 2,
  "Business Casual": 3,
  "Elegant": 4,
  "Sporty": 5,
};

export async function updateUserProfile(userId: string, dto: CreateUserProfileDTO) {
  const payload = {
    height_cm: dto.height_cm,
    weight_kg: dto.weight_kg,

    body_type: dto.body_type.toLowerCase(),
    preferred_fit: dto.preferred_fit.toLowerCase(),

    country_code: dto.country_code.toUpperCase(),
    city: dto.city,

    latitude: dto.latitude ?? null,
    longitude: dto.longitude ?? null,

    timezone: dto.timezone,
  };

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId);

  if (error) return { error };

  if (dto.style_preferences && dto.style_preferences.length > 0) {
    const profileId = await getProfileId(userId);
    if (profileId) {
      await saveStylePreferences(profileId, dto.style_preferences);
    }
  }

  return { error: null };
}

async function getProfileId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();
  return data?.id ?? null;
}

async function saveStylePreferences(profileId: string, styles: string[]) {
  await supabase
    .from("profile_style_preferences")
    .delete()
    .eq("profile_id", profileId);

  const inserts = styles
    .filter((s) => styleNameToId[s])
    .map((s) => ({
      profile_id: profileId,
      style_category_id: styleNameToId[s],
    }));

  if (inserts.length > 0) {
    await supabase
      .from("profile_style_preferences")
      .insert(inserts);
  }
}

export async function getProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data;
}

export async function getStylePreferences(profileId: string) {
  const { data } = await supabase
    .from("profile_style_preferences")
    .select("style_categories(name)")
    .eq("profile_id", profileId);
  
  return data?.map((d: any) => d.style_categories?.name) ?? [];
}