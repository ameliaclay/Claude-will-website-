// Private visit log viewer: /visits?key=YOUR_VISITS_KEY  (add &bots=1 to include bots)
import { getStore } from "@netlify/blobs";

const MINE = /^187\.14\.24[89]\./; // Milli's home network
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function device(ua) {
  const ios = ua.match(/iPhone OS (\d+)_(\d+)/);
  const safariVer = ua.match(/Version\/(\d+(?:\.\d+)*)/);
  let os = "";
  if (ios) os = "iPhone iOS " + (ios[1] === "18" && safariVer && +safariVer[1] >= 26 ? safariVer[1] : ios[1] + "." + ios[2]);
  else if (/iPad/.test(ua)) os = "iPad";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac OS X/.test(ua)) os = "Mac";
  else if (/Windows/.test(ua)) os = "Windows";
  else if (/Linux/.test(ua)) os = "Linux";
  const br = /CriOS|Chrome/.test(ua) ? "Chrome" : /FxiOS|Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "";
  return [os, br].filter(Boolean).join(", ") || ua.slice(0, 60);
}

export default async (request) => {
  const url = new URL(request.url);
  const secret = Netlify.env.get("VISITS_KEY");
  if (!secret || url.searchParams.get("key") !== secret) return new Response("Not found", { status: 404 });
  const showBots = url.searchParams.get("bots") === "1";
  const store = getStore("visits");
  const { blobs } = await store.list();
  const keys = blobs.map((b) => b.key).sort().reverse().slice(0, 400);
  const rows = (await Promise.all(keys.map((k) => store.get(k, { type: "json" })))).filter(Boolean);
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" });
  const shown = rows.filter((r) => showBots || !r.bot);
  const tr = shown.map((r) => {
    const who = MINE.test(r.ip) || r.tag === "milli" ? "you" : r.tag === "will" ? "Will (tagged)" : r.bot ? "bot" : "";
    return `<tr class="${who === "you" ? "me" : r.bot ? "bot" : ""}"><td>${esc(fmt.format(new Date(r.at)))}</td><td><b>${esc(who)}</b></td><td>${esc(r.ip)}</td><td>${esc([r.city, r.region, r.country].filter(Boolean).join(", "))}</td><td title="${esc(r.ua)}">${esc(device(r.ua))}</td><td>${esc(r.referrer || "direct")}</td><td>${esc(r.path)}</td></tr>`;
  }).join("");
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Visits</title>
<style>body{font:13px/1.4 -apple-system,system-ui,sans-serif;margin:16px;color:#222}table{border-collapse:collapse;width:100%}td,th{padding:6px 8px;border-bottom:1px solid #eee;text-align:left;vertical-align:top}th{position:sticky;top:0;background:#fff}tr.me{color:#999}tr.bot{color:#bbb}.wrap{overflow-x:auto}</style>
<h2>Visits (Austin time)</h2><p>${shown.length} shown of ${rows.length} logged. ${showBots ? `<a href="?key=${esc(secret)}">Hide bots</a>` : `<a href="?key=${esc(secret)}&bots=1">Show bots</a>`}. Tap a device to see the full user agent.</p>
<div class="wrap"><table><tr><th>Time</th><th>Who</th><th>IP</th><th>Where</th><th>Device</th><th>Came from</th><th>Page</th></tr>${tr}</table></div>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
};

export const config = { path: "/visits" };
