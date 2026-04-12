import { supabase } from "@/integrations/supabase/client";

const PERSONAL_UPDATE_COOLDOWN_DAYS = 7;
const STYLE_UPDATE_COOLDOWN_HOURS = 24;

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

export interface PersonalDataUpdateResult {
  canUpdate: boolean;
  daysRemaining: number;
  lastUpdate: string | null;
}

export interface StyleUpdateResult {
  canUpdate: boolean;
  hoursRemaining: number;
  lastUpdate: string | null;
}

export async function canUpdatePersonalData(userId: string): Promise<PersonalDataUpdateResult> {
  const profile = await getProfile(userId);
  
  if (!profile) {
    return { canUpdate: false, daysRemaining: 0, lastUpdate: null };
  }
  
  const lastUpdate = profile.last_personal_update;
  
  if (!lastUpdate) {
    return { canUpdate: true, daysRemaining: 0, lastUpdate: null };
  }
  
  const lastUpdateDate = new Date(lastUpdate);
  const now = new Date();
  const diffMs = now.getTime() - lastUpdateDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysRemaining = PERSONAL_UPDATE_COOLDOWN_DAYS - diffDays;
  
  return {
    canUpdate: daysRemaining <= 0,
    daysRemaining: Math.max(0, daysRemaining),
    lastUpdate,
  };
}

export async function canUpdateStyleData(userId: string): Promise<StyleUpdateResult> {
  const profile = await getProfile(userId);
  
  if (!profile) {
    return { canUpdate: false, hoursRemaining: 0, lastUpdate: null };
  }
  
  const lastUpdate = profile.last_style_update;
  
  if (!lastUpdate) {
    return { canUpdate: true, hoursRemaining: 0, lastUpdate: null };
  }
  
  const lastUpdateDate = new Date(lastUpdate);
  const now = new Date();
  const diffMs = now.getTime() - lastUpdateDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const hoursRemaining = STYLE_UPDATE_COOLDOWN_HOURS - diffHours;
  
  return {
    canUpdate: hoursRemaining <= 0,
    hoursRemaining: Math.max(0, hoursRemaining),
    lastUpdate,
  };
}

interface UpdatePersonalDataDTO {
  height_cm?: number;
  weight_kg?: number;
  preferred_fit?: "tight" | "regular" | "relaxed" | "oversized";
  country_code?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  style_preferences?: string[];
}

export async function updatePersonalData(userId: string, dto: UpdatePersonalDataDTO) {
  const hasPersonalChanges = dto.height_cm !== undefined || dto.weight_kg !== undefined || dto.city !== undefined || dto.country_code !== undefined;
  const hasStyleChanges = dto.preferred_fit !== undefined || (dto.style_preferences && dto.style_preferences.length > 0);
  
  const payload: Record<string, unknown> = {};
  
  if (hasPersonalChanges) {
    const check = await canUpdatePersonalData(userId);
    if (!check.canUpdate) {
      return { error: { message: `Personal data can only be updated once per ${PERSONAL_UPDATE_COOLDOWN_DAYS} days. ${check.daysRemaining} days remaining.` } };
    }
    payload.last_personal_update = new Date().toISOString();
  }
  
  if (hasStyleChanges) {
    const check = await canUpdateStyleData(userId);
    if (!check.canUpdate) {
      return { error: { message: `Style preferences can only be updated once per ${STYLE_UPDATE_COOLDOWN_HOURS} hours. ${check.hoursRemaining} hours remaining.` } };
    }
    payload.last_style_update = new Date().toISOString();
  }
  
  if (dto.height_cm !== undefined) payload.height_cm = dto.height_cm;
  if (dto.weight_kg !== undefined) payload.weight_kg = dto.weight_kg;
  if (dto.preferred_fit) payload.preferred_fit = dto.preferred_fit.toLowerCase();
  if (dto.country_code) payload.country_code = dto.country_code.toUpperCase();
  if (dto.city !== undefined) payload.city = dto.city;
  if (dto.latitude !== undefined) payload.latitude = dto.latitude ?? null;
  if (dto.longitude !== undefined) payload.longitude = dto.longitude ?? null;
  if (dto.timezone) payload.timezone = dto.timezone;
  
  if (Object.keys(payload).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("user_id", userId);
    
    if (error) return { error };
  }
  
  if (dto.style_preferences) {
    const profile = await getProfile(userId);
    if (profile) {
      await saveStylePreferences(profile.id, dto.style_preferences);
    }
  }
  
  return { error: null };
}