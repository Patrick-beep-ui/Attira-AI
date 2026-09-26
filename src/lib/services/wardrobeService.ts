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

export async function countWardrobeItems(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("wardrobe_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;

  return count ?? 0;
}