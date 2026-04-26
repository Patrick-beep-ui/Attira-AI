import { supabase } from "@/integrations/supabase/client";

export async function fetchWardrobeItems(userId: string) {
  const { data, error } = await supabase
    .from("wardrobe_items")
    .select(`
      id,
      name,
      color,
      fabric,
      size,
      brand,
      image_url,
      category_id,
      clothing_categories(name),
      is_available
    `)
    .eq("user_id", userId);

  if (error) throw error;

  return data.map((item) => ({
    ...item,
    category_name: item.clothing_categories?.name ?? null
  }));
}