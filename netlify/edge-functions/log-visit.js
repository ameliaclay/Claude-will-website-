// Logs every HTML page load to the Netlify Blobs store "visits".
// Runs before the page is served, so it catches visits even when the page's JS never runs.
import { getStore } from "@netlify/blobs";

const BOT = /bot|crawl|spider|slurp|preview|headless|facebookexternalhit|whatsapp|telegram|discord|slack|curl|wget|python|go-http|monitor|lighthouse|vercel|netlify/i;

export default async (request, context) => {
  const response = await context.next();
  try {
    const url = new URL(request.url);
    const type = response.headers.get("content-type") || "";
    if (request.method !== "GET" || !type.includes("text/html")) return response;
    const ua = request.headers.get("user-agent") || "";
    const cookie = request.headers.get("cookie") || "";
    const tag = (cookie.match(/(?:^|;\s*)saWho=([^;]+)/) || [])[1] || "";
    const geo = context.geo || {};
    const now = new Date();
    const entry = {
      at: now.toISOString(),
      ip: context.ip || "",
      city: geo.city || "",
      region: (geo.subdivision && geo.subdivision.code) || "",
      country: (geo.country && geo.country.code) || "",
      ua,
      referrer: request.headers.get("referer") || "",
      host: url.host,
      path: url.pathname + url.search,
      tag: decodeURIComponent(tag),
      bot: BOT.test(ua) || url.host.includes("--"),
    };
    const key = now.toISOString() + "-" + Math.random().toString(36).slice(2, 8);
    context.waitUntil(getStore("visits").setJSON(key, entry));
  } catch (e) {}
  return response;
};

export const config = {
  path: "/*",
  excludedPath: ["/visits", "/*.png", "/*.jpg", "/*.ico", "/*.txt", "/*.svg", "/*.js", "/*.css"],
};
