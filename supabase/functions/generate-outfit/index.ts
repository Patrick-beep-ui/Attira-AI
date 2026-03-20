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
  CATEGORY NORMALIZER
*/
const normalizeCategory = (cat: string | null) => {
  if (!cat) return null;

  const c = cat.toLowerCase();

  if (["top", "tops"].includes(c)) return "tops";
  if (["bottom", "bottoms"].includes(c)) return "bottoms";
  if (["shoe", "shoes"].includes(c)) return "shoes";
  if (["accessory", "accessories"].includes(c)) return "accessories";
  if (c === "outerwear") return "outerwear";

  return c;
};

const getMainCategory = (item: any) => {
  const sub = item.clothing_categories;
  const parent = sub?.parent;

  const categoryName = parent?.name || sub?.name;

  return normalizeCategory(categoryName);
};

/*
  IMAGE RESOLVER 
*/
const resolveImageUrl = (supabase: any, item: any): string | null => {
  const imageToUse =
    item.processed_image_url &&
    item.processing_status === "done"
      ? item.processed_image_url
      : item.image_url;

  if (!imageToUse) return null;

  if (imageToUse.startsWith("http")) return imageToUse;

  try {
    const { data } = supabase
      .storage
      .from("wardrobe-images")
      .getPublicUrl(imageToUse);

    return data?.publicUrl ?? null;
  } catch (e) {
    console.error("URL conversion failed:", imageToUse, e);
    return null;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    /*
      REQUEST
    */
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

    /*
      AUTH
    */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) throw new Error("Unauthorized");

    /*
      FETCH WARDROBE
    */
    const { data: wardrobeItems, error: wardrobeError } = await supabase
      .from("wardrobe_items")
      .select(`
        id,
        name,
        color,
        image_url,
        processed_image_url,
        processing_status,
        fabric,
        category_id,
        brand,
        size,
        clothing_categories(name, parent_category_id, parent:parent_category_id(name))
      `)
      .eq("user_id", user.id);

    if (wardrobeError) {
      console.error("Wardrobe fetch failed:", wardrobeError);
      throw new Error("Failed to fetch wardrobe");
    }

    /*
      MAP WARDROBE 
    */
    const wardrobeMapped = (wardrobeItems || []).map((item: any) => {
      const publicUrl = resolveImageUrl(supabase, item);

      console.log({
        sub: item.clothing_categories?.name,
        parent: item.clothing_categories?.parent?.name,
        final: getMainCategory(item)
      });

      return {
        id: item.id,
        name: item.name,
        category: getMainCategory(item),
        color: item.color ?? null,
        image_url: publicUrl,
        fabric: item.fabric ?? null,
      };
    });
    

    /*
      FETCH PROFILE
    */
    const { data: profile } = await supabase
      .from("profiles")
      .select("body_type, preferred_fit, climate, style_preferences")
      .eq("user_id", user.id)
      .maybeSingle();

    /*
      AI CALL
    */
    const aiResponse = await outfitModule.generateOutfit({
      wardrobe: wardrobeMapped,
      profile,
      occasion,
      formality,
      climate: profile?.climate,
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
      MAP AI → REAL ITEMS
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
        category: normalizeCategory(item.category),
        color: item.color,
        imageUrl: item.image_url,
      }));

    /*
      COMPOSITION
    */
    let compositionUrl: string | null = null;

    try {
      if (items.length > 0) {
        const { layers, width, height } = buildOutfitLayout(items);

        console.log("LAYERS:", layers);
        console.log("ITEMS:", items);

        compositionUrl = composeOutfitSVG(layers, width, height);
      }
    } catch (e) {
      console.error("Composition failed:", e);
    }

    /*
      SAVE GENERATION
    */
    const { data: generation } = await supabase
      .from("outfit_generations")
      .insert({
        user_id: user.id,
        occasion,
        formality,
        weather_temperature: null,
        weather_condition: profile?.climate ?? null,
        generated_items: items,
        confidence: parsed.confidence || 0.5,
        accepted: false,
        composition_url: compositionUrl,
      })
      .select("id")
      .single();

    /*
      RESPONSE
    */
    return new Response(
      JSON.stringify({
        items,
        occasion,
        formality,
        stylingNotes: parsed.stylingNotes || "",
        confidence: parsed.confidence || 0.5,
        generationId: generation?.id,
        compositionUrl,
      }),
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