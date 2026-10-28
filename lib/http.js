// Small request and response helpers shared by every endpoint.

// Only the site's own pages may use the API. A browser always says which page a POST comes from (the Origin
// header); a request from another site, or from a script that hides where it comes from, is turned away.
// The page and the API share the same address, so no list of domains is needed.
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  try { return new URL(origin).host === host; } catch { return false; }
}

// Vercel parses JSON bodies for us; the local dev server does too, but be defensive.
export async function readJson(req) {
  if (!sameOrigin(req)) throw Object.assign(new Error("Pedido recusado."), { code: "origem", status: 403 });
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}
