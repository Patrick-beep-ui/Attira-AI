import { supabase } from "@/integrations/supabase/client";

export interface OutfitItem {
  id: string;
  name: string;
  category: string;
  color: string;
  imageUrl?: string;
}

export interface GeneratedOutfit {
  id: string;
  items: OutfitItem[];
  occasion: string;
  formality?: string;
  stylingNotes: string;
  confidence: number;
}

export async function generateOutfit(occasion: string, formality: string = "balanced"): Promise<GeneratedOutfit> {
  const { data, error } = await supabase.functions.invoke("generate-outfit", {
    body: { occasion, formality },
  });

  if (error) {
    console.error("Generate outfit error:", error);
    throw new Error(error.message || "Failed to generate outfit");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as GeneratedOutfit;
}

export async function classifyGarment(imageUrl: string): Promise<{ category: string; color: string; season: string }> {
  // TODO: Replace with real AI classification
  await new Promise((resolve) => setTimeout(resolve, 800));

  const categories = ["tops", "bottoms", "shoes", "accessories", "outerwear"];
  const colors = ["Black", "White", "Navy", "Beige", "Grey", "Blue"];
  const seasons = ["all-season", "summer", "winter", "spring-fall"];

  return {
    category: categories[Math.floor(Math.random() * categories.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    season: seasons[Math.floor(Math.random() * seasons.length)],
  };
}

// Fallback for homepage when user may not be authenticated yet
export function getTodaysLook(): GeneratedOutfit {
  return {
    id: "placeholder",
    items: [
      { id: "i1", name: "Tailored Navy Blazer", category: "outerwear", color: "#2C3442" },
      { id: "i2", name: "White Cotton Shirt", category: "tops", color: "#FAFAFA" },
      { id: "i3", name: "Charcoal Slim Trousers", category: "bottoms", color: "#3A3A3A" },
      { id: "i4", name: "Brown Leather Loafers", category: "shoes", color: "#8B6F47" },
    ],
    occasion: "work",
    stylingNotes: "Add items to your wardrobe and generate a personalized look!",
    confidence: 0,
  };
}
