import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { occasion, formality } = await req.json();

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Fetch wardrobe
    const { data: wardrobeItems, error: wardrobeError } = await supabase
      .from("wardrobe_items")
      .select("id, name, category, color, season, fabric, image_url")
      .eq("user_id", user.id);

    if (wardrobeError) throw new Error("Failed to fetch wardrobe");

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("body_type, preferred_fit, climate, style_preferences")
      .eq("user_id", user.id)
      .maybeSingle();

    // Build prompt
    const wardrobeList = wardrobeItems?.length
      ? wardrobeItems
          .map(
            (item) =>
              `- ${item.name} (category: ${item.category}, color: ${item.color || "unknown"}, season: ${item.season || "all-season"}, fabric: ${item.fabric || "unknown"})`
          )
          .join("\n")
      : "No items in wardrobe yet.";

    const profileContext = profile
      ? `User profile: body type: ${profile.body_type || "not set"}, preferred fit: ${profile.preferred_fit || "not set"}, climate: ${profile.climate || "not set"}, style preferences: ${profile.style_preferences?.join(", ") || "none"}.`
      : "No profile information available.";

    const systemPrompt = `You are Dressly, an expert personal stylist AI. You create outfit recommendations from a user's actual wardrobe items.

Rules:
- ONLY suggest items that exist in the user's wardrobe listed below.
- If the wardrobe is empty or has too few items, suggest a minimal outfit and note what's missing.
- Consider the occasion, formality level, season compatibility, and color coordination.
- Provide brief, confident styling notes (2-3 sentences max).
- Rate your confidence from 0.0 to 1.0 based on how well the wardrobe supports this outfit.

${profileContext}

User's wardrobe:
${wardrobeList}`;

    const userPrompt = `Create an outfit for: ${occasion || "casual"} occasion, formality level: ${formality || "balanced"}.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_outfit",
                description:
                  "Create a styled outfit recommendation from the user's wardrobe.",
                parameters: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      description:
                        "Array of outfit items selected from the user's wardrobe",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            description: "The wardrobe item ID",
                          },
                          name: {
                            type: "string",
                            description: "The item name",
                          },
                          category: {
                            type: "string",
                            description:
                              "Item category (tops, bottoms, shoes, accessories, outerwear)",
                          },
                          color: {
                            type: "string",
                            description:
                              "Hex color code representing the item color",
                          },
                        },
                        required: ["id", "name", "category", "color"],
                        additionalProperties: false,
                      },
                    },
                    occasion: {
                      type: "string",
                      description: "The occasion this outfit is for",
                    },
                    stylingNotes: {
                      type: "string",
                      description:
                        "Brief styling advice and notes (2-3 sentences)",
                    },
                    confidence: {
                      type: "number",
                      description:
                        "Confidence score from 0.0 to 1.0 for how well this outfit works",
                    },
                  },
                  required: [
                    "items",
                    "occasion",
                    "stylingNotes",
                    "confidence",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "create_outfit" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return a valid outfit");
    }

    const outfit = JSON.parse(toolCall.function.arguments);
    outfit.id = crypto.randomUUID();

    // Enrich AI-returned items with image_url from actual wardrobe data
    // AI often invents IDs, so match by name (case-insensitive) as fallback
    if (outfit.items && wardrobeItems) {
      const wardrobeById = new Map(wardrobeItems.map((w: any) => [w.id, w]));
      const wardrobeByName = new Map(wardrobeItems.map((w: any) => [w.name.toLowerCase().trim(), w]));
      
      // Fuzzy match: find wardrobe item whose name is contained in AI name or vice versa
      const fuzzyMatch = (aiName: string) => {
        const lower = aiName.toLowerCase().trim();
        // Exact match first
        if (wardrobeByName.has(lower)) return wardrobeByName.get(lower);
        // Check if any wardrobe name is contained in AI name or AI name in wardrobe name
        for (const [wName, wItem] of wardrobeByName) {
          if (lower.includes(wName) || wName.includes(lower)) return wItem;
        }
        return null;
      };
      
      outfit.items = outfit.items.map((item: any) => {
        const real = wardrobeById.get(item.id) || fuzzyMatch(item.name || "");
        return {
          ...item,
          id: real?.id || item.id,
          imageUrl: real?.image_url || null,
          color: real?.color || item.color,
        };
      });
    }

    // Store the original occasion/formality for filtering
    outfit.occasion = occasion || "casual";
    outfit.formality = formality || "balanced";

    return new Response(JSON.stringify(outfit), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-outfit error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
