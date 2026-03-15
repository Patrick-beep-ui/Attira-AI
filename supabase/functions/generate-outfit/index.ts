import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { outfitModule } from "../ai/index.ts";
import { extractJSON } from "../ai/helpers/cleanJSON.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    const { occasion, formality } = await req.json();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) throw new Error("Unauthorized");

    /*
    Fetch wardrobe
    */

    const { data: wardrobeItems, error: wardrobeError } = await supabase
      .from("wardrobe_items")
      .select("id, name, color, image_url, fabric, season, category_id, clothing_categories(name)")
      .eq("user_id", user.id);
    
    if (wardrobeError) throw new Error("Failed to fetch wardrobe");

    // Map to a simple shape for the AI prompt, deriving a readable category name from the refactored schema
    const wardrobeMapped = wardrobeItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.clothing_categories?.name ?? null,
      color: item.color ?? null,
      image_url: item.image_url ?? null,
      fabric: item.fabric ?? null,
      season: item.season ?? null,
    }));

    console.log("Wardrobe items:", wardrobeMapped);

    /*
    Fetch profile
    */

    const { data: profile } = await supabase
      .from("profiles")
      .select("body_type, preferred_fit, climate, style_preferences")
      .eq("user_id", user.id)
      .maybeSingle();

    /*
    Call your AI module
    */

    const aiResponse = await outfitModule.generateOutfit({
      wardrobe: wardrobeMapped,
      profile,
      occasion,
      formality,
      climate: profile?.climate
    });

    let parsed;

    try {
      const cleaned = extractJSON(aiResponse.text);

      if (!cleaned) {
        throw new Error("AI returned empty response");
      }

      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("AI returned invalid JSON:", aiResponse.text);
      throw new Error("AI returned invalid response");
    }

    const wardrobeMap = new Map(
      wardrobeItems.map((item) => [item.id, item])
    );
    
    const items = (parsed.items || [])
      .map((aiItem: any) => wardrobeMap.get(aiItem.id))
      .filter(Boolean)
      .map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category.toLowerCase(),
        color: item.color,
        imageUrl: item.image_url
      }));

      console.log("Matched items:", items);
    
    const outfit = {
      id: crypto.randomUUID(),
      items: items,
      occasion,
      formality,
      stylingNotes: parsed.stylingNotes || "",
      confidence: parsed.confidence || 0.5
    };

    /*
    return new Response(
      JSON.stringify(aiResponse),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    */

    return new Response(
      JSON.stringify(outfit),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (e) {

    console.error("generate-outfit error:", e);

    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

});
