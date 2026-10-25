// Plans: free and Pro.
// Who you are comes from your Firebase sign-in (checked here against Google's public keys), whether you
// pay comes from Stripe, and how much of the free plan you've used is counted by this server in Firestore.
// Each part switches itself off when its keys aren't set, so the site keeps working while it's set up:
// without Stripe nobody is charged, without the Firebase service account nothing is counted.
import { createHash, createSign, webcrypto } from "node:crypto";

const PROJECT = process.env.FIREBASE_PROJECT_ID || "cvviews-26241";
export const PRICE_LABEL = "4,99 € por mês";

// What the free plan includes, per person (or per connection, without an account).
export const FREE_LIMITS = {
  review: { limit: 3, per: "month" },
  chat: { limit: 10, per: "day" },
  visual: { limit: 3, per: "month" },
};

const MESSAGES = {
  review: "Já fizeste as 3 revisões grátis deste mês. Com o Pro tens revisões ilimitadas.",
  chat: "Já trocaste as 10 mensagens grátis de hoje com o Leo. Com o Pro não há limite.",
  visual: "Já usaste as 3 correções em imagem grátis deste mês. Com o Pro são ilimitadas.",
  images: "Mostrar imagens ao Leo é do plano Pro.",
  feedback: "O feedback às tuas respostas de entrevista é do plano Pro.",
};

export class PlanError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/* ---------------- Who is asking ---------------- */
const GOOGLE_KEYS = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
let keyCache = { at: 0, keys: [] };
async function googleKeys() {
  if (Date.now() - keyCache.at < 3600_000 && keyCache.keys.length) return keyCache.keys;
  const res = await fetch(GOOGLE_KEYS);
  keyCache = { at: Date.now(), keys: (await res.json()).keys || [] };
  return keyCache.keys;
}

// The signed-in person, from the Firebase ID token the page sends, or null.
export async function userFrom(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const [h, p, s] = token.split(".");
    const header = JSON.parse(Buffer.from(h, "base64url"));
    const claims = JSON.parse(Buffer.from(p, "base64url"));
    const jwk = (await googleKeys()).find((k) => k.kid === header.kid);
    if (!jwk || header.alg !== "RS256") return null;
    const key = await webcrypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const ok = await webcrypto.subtle.verify("RSASSA-PKCS1-v1_5", key, Buffer.from(s, "base64url"), Buffer.from(`${h}.${p}`));
    const now = Date.now() / 1000;
    if (!ok || claims.aud !== PROJECT || claims.iss !== `https://securetoken.google.com/${PROJECT}` || claims.exp < now || !claims.sub) return null;
    return { uid: claims.sub, email: claims.email || "" };
  } catch {
    return null;
  }
}

const ipOf = (req) => String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();

/* ---------------- Whether they pay (Stripe) ---------------- */
export const paymentsOn = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);

export async function stripe(path, form) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: form ? "POST" : "GET",
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    body: form ? new URLSearchParams(form) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Stripe ${res.status}: ${data.error?.message || "erro"}`);
  return data;
}

// The subscription is tagged with the Firebase uid at checkout, so it can be found again by it.
const proCache = new Map();
export async function proStatus(user) {
  if (!user || !process.env.STRIPE_SECRET_KEY) return { pro: false };
  const hit = proCache.get(user.uid);
  if (hit && Date.now() - hit.at < 60_000) return hit.status;
  let status = { pro: false };
  try {
    const subs = await stripe(`subscriptions/search?query=${encodeURIComponent(`metadata['uid']:'${user.uid}'`)}`);
    const active = (subs.data || []).find((s) => ["active", "trialing", "past_due"].includes(s.status));
    status = active ? { pro: true, customer: active.customer, renews: active.current_period_end, cancelling: active.cancel_at_period_end } : { pro: false, customer: subs.data?.[0]?.customer };
  } catch (error) {
    console.error("[plano]", error.message);
  }
  proCache.set(user.uid, { at: Date.now(), status });
  return status;
}
export const forgetPro = (uid) => proCache.delete(uid);

/* ---------------- How much of the free plan they've used (Firestore, server only) ---------------- */
let adminCache = { at: 0, token: "" };
async function adminToken() {
  let account;
  try { account = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || ""); } catch { return ""; }
  if (!account?.private_key || !account.client_email) return "";
  if (Date.now() - adminCache.at < 50 * 60_000) return adminCache.token;
  const now = Math.floor(Date.now() / 1000);
  const part = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${part({ alg: "RS256", typ: "JWT" })}.${part({ iss: account.client_email, scope: "https://www.googleapis.com/auth/datastore", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const assertion = `${unsigned}.${createSign("RSA-SHA256").update(unsigned).sign(account.private_key, "base64url")}`;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Firebase service account refused");
  adminCache = { at: Date.now(), token: data.access_token };
  return data.access_token;
}
export const limitsOn = () => Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);

const period = (per) => new Date().toISOString().slice(0, per === "month" ? 7 : 10);
const DOCS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

// Counts one use, or refuses when the free allowance is spent. The counter's id is a hash, so the
// collection holds no emails or IP addresses.
async function charge(who, kind) {
  const rule = FREE_LIMITS[kind];
  const token = await adminToken();
  if (!token) return;
  const id = createHash("sha256").update(`${who}|${kind}|${period(rule.per)}`).digest("hex").slice(0, 40);
  const auth = { Authorization: `Bearer ${token}` };
  const got = await fetch(`${DOCS}/usage/${id}`, { headers: auth });
  const used = got.ok ? Number((await got.json()).fields?.count?.integerValue || 0) : 0;
  if (used >= rule.limit) throw new PlanError(402, "limit", MESSAGES[kind]);
  await fetch(`${DOCS}:commit`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ writes: [{ transform: {
      document: `projects/${PROJECT}/databases/(default)/documents/usage/${id}`,
      fieldTransforms: [{ fieldPath: "count", increment: { integerValue: "1" } }],
    } }] }),
  });
}

/* ---------------- The gate every AI endpoint goes through ---------------- */
// count: which free allowance this request uses. proOnly: which Pro feature it needs, if any.
export async function gate(req, { count, proOnly } = {}) {
  const user = await userFrom(req);
  const { pro } = await proStatus(user);
  if (pro) return { user, pro };
  if (proOnly) throw new PlanError(402, "pro", MESSAGES[proOnly]);
  if (count) {
    try {
      await charge(user?.uid || `ip:${ipOf(req)}`, count);
    } catch (error) {
      if (error instanceof PlanError) throw error;
      console.error("[limites]", error.message); // counting failed: let the request through rather than block people
    }
  }
  return { user, pro };
}
