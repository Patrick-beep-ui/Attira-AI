import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // ✅ 1. HANDLE PREFLIGHT
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    let removeBgResponse: Response;

    const contentType = req.headers.get("content-type") || "";

    console.log("📩 Incoming content-type:", contentType);

    // =========================================================
    // ✅ 2. HANDLE FILE UPLOAD (RECOMMENDED WAY)
    // =========================================================
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        throw new Error("No file provided");
      }

      console.log("📦 File received:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const body = new FormData();
      body.append("image_file", file);
      body.append("size", "auto");

      removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": Deno.env.get("REMOVE_BG_API_KEY")!,
        },
        body,
      });

    // =========================================================
    // ⚠️ 3. HANDLE BASE64 (LEGACY SUPPORT)
    // =========================================================
    } else {
      const { imageUrl } = await req.json();

      if (!imageUrl) {
        throw new Error("Missing imageUrl");
      }

      console.log("📦 Base64 received:", {
        length: imageUrl.length,
        startsWith: imageUrl.slice(0, 30),
      });

      if (!imageUrl.startsWith("data:image")) {
        throw new Error("Invalid base64 format (must start with data:image)");
      }

      const parts = imageUrl.split(",");
      if (parts.length < 2) {
        throw new Error("Malformed base64 string");
      }

      const base64 = parts[1];

      console.log("📦 Extracted base64 length:", base64.length);

      removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": Deno.env.get("REMOVE_BG_API_KEY")!,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          image_file_b64: base64,
          size: "auto",
        }),
      });
    }

    // =========================================================
    // ❌ HANDLE REMOVE.BG ERRORS
    // =========================================================
    if (!removeBgResponse.ok) {
      const err = await removeBgResponse.text();
      console.error("❌ remove.bg error:", err);
      throw new Error("Background removal failed");
    }

    // =========================================================
    // RETURN IMAGE
    // =========================================================
    const buffer = await removeBgResponse.arrayBuffer();

    console.log("✅ Background removed successfully");

    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
      },
    });

  } catch (e) {
    console.error("❌ process-image error:", e);

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