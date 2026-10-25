import { friendlyError, imageToText, readJson, sendJson } from "../lib/ai.js";

export const config = { maxDuration: 60 };

const TYPES = ["image/jpeg", "image/png", "image/webp"];

// Turns a photo of a CV into plain text once, so chat, review and interviews can all reuse it.
export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Usa POST." });
  try {
    const { image, mime } = await readJson(req);
    if (!image || !TYPES.includes(mime)) return sendJson(res, 400, { error: "Envia uma fotografia JPG, PNG ou WebP." });
    const text = await imageToText(`data:${mime};base64,${image}`);
    if (text.length < 40) {
      return sendJson(res, 422, { error: "Não conseguimos ler texto nessa fotografia. Tira uma mais nítida e bem iluminada, com a página inteira." });
    }
    sendJson(res, 200, { text });
  } catch (error) {
    console.error("[read]", error);
    const { status, message } = friendlyError(error);
    sendJson(res, status, { error: message });
  }
}
