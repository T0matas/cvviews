import { readJson, sameOrigin, sendJson } from "../lib/http.js";
import { FREE_LIMITS, PRICE_LABEL, PlanError, forgetPro, gate, limitsOn, paymentsOn, proStatus, stripe, usageOf, userFrom } from "../lib/plan.js";

// One endpoint for everything about the plan, by ?action=:
//   GET  status   which plan you're on, and whether payments are switched on
//   GET  usage    how much of each free allowance is left, and when it starts again
//   POST checkout a Stripe Checkout page for the Pro subscription (signed in only)
//   POST portal   Stripe's page to change card or cancel (Pro only)
//   POST visual   counts one corrected-CV image against the free allowance
const origin = (req) => process.env.SITE_URL || `${req.headers["x-forwarded-proto"] || "http"}://${req.headers["x-forwarded-host"] || req.headers.host}`;

export default async function handler(req, res) {
  const action = new URL(req.url, "http://localhost").searchParams.get("action");
  try {
    if (req.method === "GET" && action === "status") {
      const user = await userFrom(req);
      const status = await proStatus(user);
      return sendJson(res, 200, {
        plan: status.pro ? "pro" : "free",
        signedIn: !!user,
        renews: status.renews || null,
        cancelling: !!status.cancelling,
        manual: !!status.manual,
        price: PRICE_LABEL,
        limits: FREE_LIMITS,
        payments: paymentsOn(),
        counting: limitsOn(),
      });
    }
    if (req.method === "GET" && action === "usage") return sendJson(res, 200, await usageOf(req));
    if (req.method !== "POST") return sendJson(res, 405, { error: "Pedido inválido." });
    if (!sameOrigin(req)) return sendJson(res, 403, { error: "Pedido recusado." });
    await readJson(req).catch(() => ({}));

    if (action === "visual") {
      await gate(req, { count: "visual" });
      return sendJson(res, 200, { ok: true });
    }

    if (!paymentsOn()) return sendJson(res, 503, { error: "Os pagamentos ainda não estão ligados." });
    const user = await userFrom(req);
    if (!user) return sendJson(res, 401, { error: "Entra na tua conta primeiro.", code: "signin" });

    if (action === "checkout") {
      const status = await proStatus(user);
      if (status.pro) return sendJson(res, 409, { error: "Já tens o Pro." });
      const session = await stripe("checkout/sessions", {
        mode: "subscription",
        "line_items[0][price]": process.env.STRIPE_PRICE_ID,
        "line_items[0][quantity]": "1",
        success_url: `${origin(req)}/?pro=ok`,
        cancel_url: `${origin(req)}/#planos`,
        client_reference_id: user.uid,
        ...(status.customer ? { customer: status.customer } : { customer_email: user.email }),
        "subscription_data[metadata][uid]": user.uid,
        allow_promotion_codes: "true",
        locale: "pt",
      });
      forgetPro(user.uid);
      return sendJson(res, 200, { url: session.url });
    }

    if (action === "portal") {
      const status = await proStatus(user);
      if (!status.customer) return sendJson(res, 404, { error: "Ainda não tens nenhuma subscrição." });
      const portal = await stripe("billing_portal/sessions", { customer: status.customer, return_url: `${origin(req)}/entrar`, locale: "pt" });
      forgetPro(user.uid);
      return sendJson(res, 200, { url: portal.url });
    }

    return sendJson(res, 404, { error: "Pedido inválido." });
  } catch (error) {
    if (error instanceof PlanError) return sendJson(res, error.status, { error: error.message, code: error.code });
    console.error("[billing]", error);
    sendJson(res, 502, { error: "Os pagamentos não responderam. Tenta de novo daqui a pouco." });
  }
}
