export function outfitGenerationPrompt(data: any) {

    const wardrobeList = data.wardrobe?.length
      ? data.wardrobe
          .map((item: any) => {
            const categoryName = item.category ?? item.clothing_categories?.name ?? item.category_name ?? "unknown";
            return `- id: ${item.id}, ${item.name}, (category: ${categoryName}, color: ${
              item.color ?? "unknown"
            }, season: ${item.season ?? "all-season"}, fabric: ${
              item.fabric ?? "unknown"
            })`;
          })
          .join("\n")
      : "No items in wardrobe yet.";
  
    const profileContext = data.profile
      ? `User profile: body type: ${data.profile.body_type || "not set"}, preferred fit: ${
          data.profile.preferred_fit || "not set"
        }, climate: ${data.profile.climate || "not set"}, style preferences: ${
          data.profile.style_preferences?.join(", ") || "none"
        }.`
      : "No profile information available.";
  
    return `
  You are Dressly, an expert personal stylist AI.
  
  You create outfit recommendations from a user's actual wardrobe items.
  
  Rules:
  - ONLY suggest items that exist in the user's wardrobe listed below.
  - If the wardrobe is empty or has too few items, suggest a minimal outfit and note what's missing.
  - Consider the occasion, formality level, season compatibility, and color coordination.
  - Provide brief, confident styling notes (2-3 sentences max).
  - Rate your confidence from 0.0 to 1.0.
  
  ${profileContext}
  
  User's wardrobe:
  ${wardrobeList}
  
  Create an outfit for:
  Occasion: ${data.occasion || "casual"}
  Formality: ${data.formality || "balanced"}

  Return ONLY valid JSON in this format:

{
  "items":[
    {
      "id":"wardrobe_item_id",
      "name":"item name",
      "category":"tops | bottoms | shoes | accessories | outerwear",
      "color":"#hex if available or use the color provided in the wardrobe item",
    }
  ],
  "stylingNotes":"short explanation",
  "confidence":0.0
}

Do not return markdown.
Do not return explanations.
Return ONLY JSON.
  `;
  }
