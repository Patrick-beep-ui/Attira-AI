export const config = {
  matcher: "/outfit/:path*",
};

const CRAWLER = /Twitterbot|facebookexternalhit|Facebot|LinkedInBot|WhatsApp|Discordbot|Pinterestbot|TelegramBot|Applebot|Googlebot|Bingbot/i;

const OG_URL = "https://hpmcnchtqancomrlgxpu.supabase.co/functions/v1/og";

export default async function middleware(request: Request): Promise<Response | void> {
  const ua = request.headers.get("user-agent") || "";
  if (!CRAWLER.test(ua)) return;

  const outfitId = new URL(request.url).pathname.replace("/outfit/", "");
  const response = await fetch(`${OG_URL}?outfit_id=${outfitId}`);
  const html = await response.text();

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
