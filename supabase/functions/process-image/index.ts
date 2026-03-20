import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // ✅ 1. HANDLE PREFLIGHT (CRITICAL)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      throw new Error("Missing imageUrl");
    }

    // ✅ 2. CLEAN FETCH (NO CORS HEADERS HERE)
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": Deno.env.get("REMOVE_BG_API_KEY")!,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        image_file_b64: imageUrl.split(",")[1], // Extract base64 part
        size: "auto",
      }),
    });

    console.log(imageUrl.startsWith("data:image"));

    if (!response.ok) {
      const err = await response.text();
      console.error("remove.bg error:", err);
      throw new Error("Background removal failed");
    }

    const buffer = await response.arrayBuffer();

    // ✅ 3. RETURN WITH CORS HEADERS
    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
      },
    });

  } catch (e) {
    console.error("process-image error:", e);

    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});