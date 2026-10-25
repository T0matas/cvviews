import { sendJson } from "../lib/http.js";

// The weather in Lisbon right now, for the corner of the footer. Our server asks Open-Meteo (free, no key),
// so visitors' browsers never talk to anyone else; the answer is cached for a quarter of an hour.
const LISBOA = "https://api.open-meteo.com/v1/forecast?latitude=38.72&longitude=-9.14&current=temperature_2m,weather_code,is_day&timezone=Europe%2FLisbon";

export default async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { error: "Usa GET." });
  try {
    const response = await fetch(LISBOA, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
    const { current } = await response.json();
    res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
    sendJson(res, 200, { temp: Math.round(current.temperature_2m), code: current.weather_code, day: current.is_day === 1 });
  } catch (error) {
    console.error("[tempo]", error.message);
    res.setHeader("Cache-Control", "no-store");
    sendJson(res, 503, { error: "O tempo não está disponível agora." });
  }
}
