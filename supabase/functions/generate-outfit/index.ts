import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { outfitModule } from "../ai/index.ts";
import { extractJSON } from "../ai/helpers/cleanJSON.ts";
import { composeOutfitSVG } from "../ai/modules/CanvasComposer.ts";
import { buildOutfitLayout } from "../ai/modules/OutfitLayout.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/*
   CATEGORY NORMALIZER (single source of truth)
*/
const normalizeCategory = (cat: string | null) => {
  if (!cat) return null;

  const c = cat.toLowerCase();

  if (c === "top" || c === "tops") return "tops";
  if (c === "bottom" || c === "bottoms") return "bottoms";
  if (c === "shoe" || c === "shoes") return "shoes";
  if (c === "accessory" || c === "accessories") return "accessories";
  if (c === "outerwear") return "outerwear";

  return c;
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
      .select(`
        id,
        name,
        color,
        image_url,
        fabric,
        category_id,
        brand,
        size,
        clothing_categories(name)
      `)
      .eq("user_id", user.id);

    if (wardrobeError) {
      console.error("Wardrobe fetch failed:", wardrobeError);
      throw new Error(`Failed to fetch wardrobe`);
    }

    /*
    🔁 UPDATED: normalize category here
    */

    const wardrobeMapped = wardrobeItems.map((item: any) => {

      let publicUrl: string | null = null;

      if (!item.image_url) {
        return {
          ...item,
          image_url: null
        };
      }

      if (item.image_url.startsWith("http")) {
        publicUrl = item.image_url;
      } else {
        try {
          const { data } = supabase
            .storage
            .from("wardrobe-images")
            .getPublicUrl(item.image_url);

          publicUrl = data?.publicUrl ?? null;
        } catch (e) {
          console.error("URL conversion failed:", item.image_url, e);
        }
      }

      return {
        id: item.id,
        name: item.name,

        // 🔥 FIX APPLIED HERE
        category: normalizeCategory(item.clothing_categories?.name),

        color: item.color ?? null,
        image_url: publicUrl,
        fabric: item.fabric ?? null,
      };
    });

    /*
    Fetch profile
    */

    const { data: profile } = await supabase
      .from("profiles")
      .select("body_type, preferred_fit, climate, style_preferences")
      .eq("user_id", user.id)
      .maybeSingle();

    /*
    Call AI
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
      if (!cleaned) throw new Error("AI returned empty response");
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("AI returned invalid JSON:", aiResponse.text);
      throw new Error("AI returned invalid response");
    }

    /*
    🔁 UPDATED: normalize AGAIN here for safety
    */

    const wardrobeMap = new Map(
      wardrobeMapped.map((item: any) => [item.id, item])
    );

    const items = (parsed.items || [])
      .map((aiItem: any) => wardrobeMap.get(aiItem.id))
      .filter(Boolean)
      .map((item: any) => ({
        id: item.id,
        name: item.name,

        // 🔥 FIX APPLIED HERE
        category: normalizeCategory(item.category),

        color: item.color,
        imageUrl: item.image_url
      }));

    /*
    Compose
    */

    let compositionUrl: string | null = null;

    try {
      if (items.length > 0) {

        const { layers, width, height } = buildOutfitLayout(items);

        console.log("LAYERS FOR COMPOSITION:", layers);
        console.log("Items used for composition:", items);

        compositionUrl = composeOutfitSVG(layers, width, height);
      }
    } catch (e) {
      console.error("Composition failed:", e);
      compositionUrl = null;
    }

    const outfit = {
      items,
      occasion,
      formality,
      stylingNotes: parsed.stylingNotes || "",
      confidence: parsed.confidence || 0.5
    };

    const { data: generation } = await supabase
      .from("outfit_generations")
      .insert({
        user_id: user.id,
        occasion,
        formality,
        weather_temperature: null,
        weather_condition: profile?.climate ?? null,
        generated_items: items,
        confidence: outfit.confidence,
        accepted: false,
        composition_url: compositionUrl
      })
      .select("id")
      .single();

    const response = {
      ...outfit,
      generationId: generation?.id,
      compositionUrl
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

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