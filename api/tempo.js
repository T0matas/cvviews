import { sendJson } from "../lib/http.js";

// Where the visitor is, roughly, and the weather there right now, for the corner of the footer.
// Vercel tells us the country, city, time zone and coordinates of the visitor's connection in request headers;
// our server then asks Open-Meteo (free, no key) for the weather, so the browser never talks to anyone else.
// Without those headers (on a local server) it falls back to Lisbon. Nothing here is stored.

// Countries where Portuguese is spoken: the site stays in Portuguese there, and is in English everywhere else.
export const PORTUGUESE = new Set(["PT", "BR", "AO", "MZ", "CV", "GW", "ST", "TL", "MO", "GQ"]);
const LISBON = { country: "PT", city: "Lisboa", timezone: "Europe/Lisbon", lat: 38.72, lon: -9.14 };

function placeOf(req) {
  const h = req.headers;
  const country = String(h["x-vercel-ip-country"] || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) return LISBON;
  const decode = (v) => { try { return decodeURIComponent(String(v || "")); } catch { return String(v || ""); } };
  const lat = Number(h["x-vercel-ip-latitude"]);
  const lon = Number(h["x-vercel-ip-longitude"]);
  return {
    country,
    city: decode(h["x-vercel-ip-city"]),
    timezone: String(h["x-vercel-ip-timezone"] || ""),
    lat: Number.isFinite(lat) ? lat : null,
    lon: Number.isFinite(lon) ? lon : null,
  };
}

// Weather answers are shared between visitors of the same spot for a quarter of an hour.
const cache = new Map();
async function weatherAt(lat, lon) {
  const key = `${lat.toFixed(1)},${lon.toFixed(1)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 15 * 60_000) return hit.value;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&current=temperature_2m,weather_code,is_day&timezone=auto`;
  const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
  const { current, timezone } = await response.json();
  const value = { temp: Math.round(current.temperature_2m), code: current.weather_code, day: current.is_day === 1, timezone };
  cache.set(key, { at: Date.now(), value });
  return value;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Usa GET." });
  const place = placeOf(req);
  const lang = PORTUGUESE.has(place.country) ? "pt" : "en";
  // ?so=lugar: just the place and language, quickly, for choosing the site's language on a first visit
  const onlyPlace = new URL(req.url, "http://localhost").searchParams.get("so") === "lugar";
  // the answer depends on who asks, so no shared cache in between
  res.setHeader("Cache-Control", "private, max-age=900");
  if (onlyPlace || place.lat === null) return sendJson(res, 200, { ...place, lang, lat: undefined, lon: undefined });
  try {
    const w = await weatherAt(place.lat, place.lon);
    sendJson(res, 200, { country: place.country, city: place.city, timezone: place.timezone || w.timezone, lang, temp: w.temp, code: w.code, day: w.day });
  } catch (error) {
    console.error("[tempo]", error.message);
    sendJson(res, 200, { country: place.country, city: place.city, timezone: place.timezone, lang });
  }
}
