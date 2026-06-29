import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initWasm, Resvg } from "npm:@resvg/resvg-wasm@2.6.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://app.attiraai.com";

const DEFAULT_TITLE = "Attira — Your Intelligent Personal Stylist";
const DEFAULT_DESC =
  "AI-powered personal styling. Get outfit recommendations tailored to your body, style, and occasion.";

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2C3442"/>
      <stop offset="100%" stop-color="#1A1F2E"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="50%" y="45%" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">Attira</text>
  <text x="50%" y="55%" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)" text-anchor="middle" dominant-baseline="middle">Your Intelligent Personal Stylist</text>
</svg>`;

let wasmReady: Promise<void> | null = null;

async function ensureWasm(): Promise<void> {
  if (!wasmReady) {
    wasmReady = (async () => {
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm",
      );
      await initWasm(await res.arrayBuffer());
    })();
  }
  return wasmReady;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildHtml(title: string, desc: string, image: string, url: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}"/>
  <meta property="og:title" content="${escapeHtml(title)}"/>
  <meta property="og:description" content="${escapeHtml(desc)}"/>
  <meta property="og:image" content="${escapeHtml(image)}"/>
  <meta property="og:url" content="${escapeHtml(url)}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="Attira"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${escapeHtml(title)}"/>
  <meta name="twitter:description" content="${escapeHtml(desc)}"/>
  <link rel="canonical" href="${escapeHtml(url)}"/>
</head>
<body>
</body>
</html>`;
}

function genericHtml(): Response {
  return new Response(
    buildHtml(DEFAULT_TITLE, DEFAULT_DESC, `${SITE_URL}/og-image.png`, SITE_URL),
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function fallbackImage(): Response {
  return new Response(FALLBACK_SVG, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function buildDescription(outfit: Record<string, unknown>, itemCount: number): string {
  const parts: string[] = [];
  if (outfit.occasion) parts.push(String(outfit.occasion));
  if (outfit.formality) parts.push(String(outfit.formality));
  if (itemCount > 0) parts.push(`${itemCount} items`);
  if (outfit.styling_notes) {
    parts.push(String(outfit.styling_notes).slice(0, 120));
  }
  return parts.join(" · ") || "Check out this outfit on Attira";
}

function extractSvg(raw: string): string | null {
  const prefixes = [
    "data:image/svg+xml;utf8,",
    "data:image/svg+xml,",
  ];
  for (const prefix of prefixes) {
    if (raw.startsWith(prefix)) {
      try {
        return decodeURIComponent(raw.slice(prefix.length));
      } catch {
        return raw.slice(prefix.length);
      }
    }
  }
  if (raw.startsWith("<svg")) return raw;
  return null;
}

async function svgToPng(svg: string): Promise<Uint8Array | null> {
  try {
    await ensureWasm();
    const resvg = new Resvg(svg, {
      background: "#DEDAD9",
    });
    return resvg.render().asPng();
  } catch (e) {
    console.error("svgToPng error:", e);
    return null;
  }
}

async function embedImages(svg: string): Promise<string> {
  const urlMap = new Map<string, string>();
  const hrefRegex = /(?:href|xlink:href)="([^"]+)"/g;
  let m: RegExpExecArray | null;

  while ((m = hrefRegex.exec(svg)) !== null) {
    const url = m[1];
    if (!url.startsWith("data:") && !urlMap.has(url)) {
      try {
        const resp = await fetch(url);
        const buf = await resp.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.length; i += 8192) {
          binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
        }
        const ext = url.split(".").pop()?.toLowerCase() || "jpg";
        const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
        urlMap.set(url, `data:${mime};base64,${btoa(binary)}`);
      } catch (e) {
        console.error(`embedImages: failed to fetch ${url}:`, e);
        urlMap.set(url, url);
      }
    }
  }

  if (urlMap.size === 0) return svg;

  let result = svg;
  for (const [original, replacement] of urlMap) {
    result = result.replaceAll(original, replacement);
  }
  return result;
}

function wrapForOgCard(svg: string): string {
  const inner = svg
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<svg[^>]*>/i, "")
    .replace(/<\/svg>/i, "")
    .trim();

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="100%" height="100%" fill="#2C3442"/>
  <svg x="350" y="15" width="500" height="600" viewBox="0 0 500 600">
    ${inner}
  </svg>
</svg>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const outfitId = url.searchParams.get("outfit_id");
    const mode = url.searchParams.get("mode") || "html";

    if (!outfitId) {
      return mode === "image" ? fallbackImage() : genericHtml();
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: outfit, error } = await supabase
      .from("outfits")
      .select("id, user_id, occasion, formality, styling_notes, composition_url, confidence, created_at")
      .eq("id", outfitId)
      .eq("is_public", true)
      .maybeSingle();

    if (error || !outfit) {
      return mode === "image" ? fallbackImage() : genericHtml();
    }

    if (mode === "image") {
      const raw = outfit.composition_url as string | null;
      if (!raw) return fallbackImage();

      let svg = extractSvg(raw);
      if (!svg) return fallbackImage();

      svg = await embedImages(svg);
      svg = wrapForOgCard(svg);

      const png = await svgToPng(svg);
      if (png) {
        return new Response(png, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=86400",
            ...corsHeaders,
          },
        });
      }

      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400",
          ...corsHeaders,
        },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, first_name")
      .eq("user_id", outfit.user_id)
      .maybeSingle();

    const { count: itemCount } = await supabase
      .from("outfit_items")
      .select("*", { count: "exact", head: true })
      .eq("outfit_id", outfit.id);

    const username = profile?.username || profile?.first_name || "someone";
    const title = `Outfit by @${username} — Attira`;
    const desc = buildDescription(outfit, itemCount ?? 0);
    const imageUrl = `${Deno.env.get("SUPABASE_URL") ?? ""}/functions/v1/og?mode=image&outfit_id=${outfit.id}`;
    const pageUrl = `${SITE_URL}/outfit/${outfit.id}`;

    return new Response(buildHtml(title, desc, imageUrl, pageUrl), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    console.error("og error:", e);
    return genericHtml();
  }
});
