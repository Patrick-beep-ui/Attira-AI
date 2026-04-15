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
        }${data.profile.height_cm ? `, height: ${data.profile.height_cm}cm` : ""}${data.profile.weight_kg ? `, weight: ${data.profile.weight_kg}kg` : ""}.`
      : "No profile information available.";
  
    const stylePreferencesContext = data.stylePreferences?.length
      ? `User's style preferences: ${data.stylePreferences.join(", ")}.`
      : "";
  
    const weatherContext = data.weather?.context
      ? `Current weather: ${data.weather.context}. Consider: ${
          data.weather.temperature !== null && data.weather.temperature > 25
            ? "lightweight, breathable fabrics; avoid heavy layers"
            : data.weather.temperature !== null && data.weather.temperature < 15
            ? "layering options and warmer fabrics"
            : "comfortable, versatile pieces"
        }${data.weather.condition?.includes("rain") ? "; prioritize rain-friendly or quick-dry items" : ""}.`
      : "";
  
    const historyContext = data.generationHistory?.length
      ? `User's recent outfit generation history (for learning preferences):
${data.generationHistory
    .map((gen: any) => {
      const itemsStr = gen.generated_items?.map((i: any) => i.name).join(", ") || "unknown";
      const status = gen.accepted ? "ACCEPTED" : "REJECTED/REGENERATED";
      return `- [${status}] Occasion: ${gen.occasion || "unknown"}, Formality: ${gen.formality || "unknown"}, Items: ${itemsStr}, Confidence: ${gen.confidence || "N/A"}`;
    })
    .join("\n")}`
      : "";

    const preferenceHints = () => {
      if (!data.generationHistory?.length) return "";
      
      const accepted = data.generationHistory.filter((g: any) => g.accepted);
      const rejected = data.generationHistory.filter((g: any) => !g.accepted);
      
      const hints: string[] = [];
      
      if (accepted.length > 0) {
        const acceptedItems = accepted.flatMap((g: any) => g.generated_items || []);
        const itemCounts: Record<string, number> = {};
        acceptedItems.forEach((item: any) => {
          const key = item.name || item.category || "unknown";
          itemCounts[key] = (itemCounts[key] || 0) + 1;
        });
        
        const popularItems = Object.entries(itemCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name);
        
        if (popularItems.length > 0) {
          hints.push(`The user tends to accept outfits with items like: ${popularItems.join(", ")}`);
        }
      }
      
      if (rejected.length > 0) {
        hints.push("The user has rejected some previous suggestions - avoid repeating similar combinations.");
      }
      
      return hints.length > 0 ? `\nPreference hints: ${hints.join(". ")}` : "";
    };
  
    return `
You are Dressly, an expert personal stylist AI.

You create outfit recommendations from a user's actual wardrobe items.

Rules:
  - ONLY suggest items that exist in the user's wardrobe listed below.
  - If the wardrobe is empty or has too few items, suggest a minimal outfit and note what's missing.
  - Consider the occasion, formality level, season compatibility, weather appropriateness, and color coordination.
  - Respect the user's style preferences if provided.
  - Consider the user's history: if they consistently reject certain styles, avoid similar combinations.
  - Provide brief, confident styling notes (2-3 sentences max).
  - Rate your confidence from 0.0 to 1.0.

${profileContext}

${stylePreferencesContext}

${weatherContext}

${historyContext}
${preferenceHints()}

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
