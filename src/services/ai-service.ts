// AI Service — Mock implementation for V1
// Structured for easy swap to real AI later

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
  stylingNotes: string;
  confidence: number;
}

const MOCK_OUTFITS: Record<string, GeneratedOutfit[]> = {
  work: [
    {
      id: "outfit-work-1",
      items: [
        { id: "i1", name: "Tailored Navy Blazer", category: "outerwear", color: "#2C3442" },
        { id: "i2", name: "White Cotton Shirt", category: "tops", color: "#FAFAFA" },
        { id: "i3", name: "Charcoal Slim Trousers", category: "bottoms", color: "#3A3A3A" },
        { id: "i4", name: "Brown Leather Loafers", category: "shoes", color: "#8B6F47" },
      ],
      occasion: "work",
      stylingNotes: "A classic professional combination. The navy blazer adds structure while the white shirt keeps it fresh. Brown loafers add warmth without being too casual.",
      confidence: 0.92,
    },
  ],
  casual: [
    {
      id: "outfit-casual-1",
      items: [
        { id: "i5", name: "Linen Button-Up", category: "tops", color: "#E8DDD0" },
        { id: "i6", name: "Relaxed Chinos", category: "bottoms", color: "#C4B5A0" },
        { id: "i7", name: "Canvas Sneakers", category: "shoes", color: "#F5F5F5" },
      ],
      occasion: "casual",
      stylingNotes: "Perfect for a relaxed weekend. The linen shirt breathes in warm climates, and the neutral palette keeps it effortlessly put together.",
      confidence: 0.88,
    },
  ],
  "date-night": [
    {
      id: "outfit-date-1",
      items: [
        { id: "i8", name: "Black Silk Blouse", category: "tops", color: "#1A1A1A" },
        { id: "i9", name: "High-Waisted Trousers", category: "bottoms", color: "#2C3442" },
        { id: "i10", name: "Statement Earrings", category: "accessories", color: "#C4A265" },
        { id: "i11", name: "Pointed Heels", category: "shoes", color: "#1A1A1A" },
      ],
      occasion: "date-night",
      stylingNotes: "Understated elegance. The silk blouse adds subtle luxury, while the gold earrings catch the light without overwhelming. Confidence-boosting and refined.",
      confidence: 0.95,
    },
  ],
  event: [
    {
      id: "outfit-event-1",
      items: [
        { id: "i12", name: "Structured Midi Dress", category: "tops", color: "#6E8CA6" },
        { id: "i13", name: "Minimalist Clutch", category: "accessories", color: "#2C3442" },
        { id: "i14", name: "Strappy Sandals", category: "shoes", color: "#C4A265" },
      ],
      occasion: "event",
      stylingNotes: "The accent blue dress makes a statement while remaining sophisticated. Gold sandals elevate the look, and the structured clutch ties the palette together.",
      confidence: 0.91,
    },
  ],
};

export async function generateOutfit(occasion: string): Promise<GeneratedOutfit> {
  // Simulate AI processing time
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  const outfits = MOCK_OUTFITS[occasion] || MOCK_OUTFITS.casual;
  return outfits[Math.floor(Math.random() * outfits.length)];
}

export async function classifyGarment(imageUrl: string): Promise<{ category: string; color: string; season: string }> {
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

export function getTodaysLook(): GeneratedOutfit {
  const occasions = Object.keys(MOCK_OUTFITS);
  const randomOccasion = occasions[Math.floor(Math.random() * occasions.length)];
  return MOCK_OUTFITS[randomOccasion][0];
}
