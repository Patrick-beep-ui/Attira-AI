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

  return { error };
}

export async function getProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  return data;
}