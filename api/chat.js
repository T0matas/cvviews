import { gate } from "../lib/plan.js";
import { HUMAN_STYLE, REASONING, VISION_MODEL, complete, cvBlocks, friendlyError, humanize, readJson, sendJson } from "../lib/ai.js";

export const config = { maxDuration: 120 };

const SYSTEM = `You are Leo, the assistant inside CVviews. Talk like a normal, friendly person.
If someone says hello or asks how you are, answer naturally and briefly, the way a friend would, and don't launch into CV advice unprompted.
You can chat about anything they bring up. Your speciality is CVs, job hunting, interviews and careers: when their CV (attached to the first message) or its review is relevant, use it; when it isn't, leave it out.
When they ask you to fix, correct, rewrite or improve something ("corrige", "melhora isto", "reescreve"), just do it: give the corrected text ready to copy, then a line or two on what changed. If they ask you to correct the whole CV, give the full corrected version, section by section.
If they send images, look at them carefully and use what you see (a CV, a job ad, a screenshot of a message).
Answers are as long as they need to be and no longer: short paragraphs, lists only when they help.
Rewritten CV lines stay truthful, use [placeholders] for numbers only they know, and are written in the CV's own language.
Reply in European Portuguese (pt-PT).
${HUMAN_STYLE}`;

const WINDOW = 30;

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Usa POST." });
  let started = false;
  const begin = () => {
    if (started) return;
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    started = true;
  };

  try {
    const { cv, review, messages } = await readJson(req);
    if (!Array.isArray(messages) || messages.length === 0 || messages[0].role !== "user") {
      return sendJson(res, 400, { error: "Envia pelo menos uma mensagem." });
    }

    const context = cv
      ? await cvBlocks(cv)
      : [{ type: "text", text: "(A pessoa ainda não anexou um CV.)" }];
    if (review) context.push({ type: "text", text: `<previous_review>\n${JSON.stringify(review).slice(0, 12000)}\n</previous_review>` });

    // Keep the first turn, plus the most recent window.
    // Images (data URLs from the page, at most a few) go with the message they were sent in.
    const imagesOf = (m) => (Array.isArray(m.images) ? m.images : [])
      .filter((src) => typeof src === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(src) && src.length < 3_000_000)
      .slice(0, 3);
    let turns = messages.map((m) => {
      const role = m.role === "assistant" ? "assistant" : "user";
      const images = role === "user" ? imagesOf(m) : [];
      const text = String(m.content || "");
      return images.length
        ? { role, content: [{ type: "text", text: text || "(imagem)" }, ...images.map((url) => ({ type: "image_url", image_url: { url } }))] }
        : { role, content: text };
    });
    const withImages = turns.some((t) => Array.isArray(t.content));
    await gate(req, withImages ? { proOnly: "images", count: "chat" } : { count: "chat" });
    if (turns.length > WINDOW) {
      let recent = turns.slice(-WINDOW + 2);
      if (recent[0].role === "assistant") recent = recent.slice(1);
      turns = [turns[0], { role: "assistant", content: "Percebido. Pergunta o que quiseres." }, ...recent];
    }
    // The CV and its review are background, not a message: kept apart, so "1+1" is answered as "1+1".
    const background = `Material de referência (não é uma mensagem da pessoa):\n${context.map((c) => c.text).join("\n\n")}`;

    const response = await complete({
      max_tokens: 8000,
      // Images need the model that can see; it thinks out loud unless told to keep that hidden.
      ...(withImages ? { model: VISION_MODEL, reasoning_format: "hidden" } : REASONING),
      stream: true,
      messages: [{ role: "system", content: SYSTEM }, { role: "system", content: background }, ...turns],
    });

    // Text goes out a word behind the model, so humanize() sees a dash together with the spaces
    // and digits around it, even when they arrive in different chunks.
    let pending = "";
    const send = (final) => {
      const cut = final ? pending.length : pending.search(/\S*[\s–—]*$/);
      const ready = pending.slice(0, cut);
      pending = pending.slice(cut);
      if (ready) { begin(); res.write(humanize(ready)); }
    };

    // Server-sent events: one "data: {json}" line per chunk, ending with "data: [DONE]".
    const decoder = new TextDecoder();
    let buffer = "";
    for await (const chunk of response.body) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        const data = line.trim().replace(/^data:\s*/, "");
        if (!line.trim().startsWith("data:") || data === "[DONE]") continue;
        const text = JSON.parse(data).choices?.[0]?.delta?.content;
        if (text) {
          pending += text;
          send(false);
        }
      }
    }
    send(true);
    begin();
    res.end();
  } catch (error) {
    console.error("[chat]", error);
    const { status, message, code } = friendlyError(error);
    if (started) res.end(`\n\n_(A ligação falhou: ${message})_`);
    else sendJson(res, status, { error: message, code });
  }
}
