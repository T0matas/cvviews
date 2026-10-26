import { extractText, getDocumentProxy } from "unpdf";
import { PlanError } from "./plan.js";

// Groq and xAI both follow the OpenAI chat-completions format.
// Groq is used when GROQ_API_KEY is set, otherwise xAI.
const PROVIDER = process.env.GROQ_API_KEY
  ? { name: "Groq", env: "GROQ_API_KEY", baseUrl: "https://api.groq.com/openai/v1", model: process.env.GROQ_MODEL || "openai/gpt-oss-120b" }
  : { name: "xAI", env: "XAI_API_KEY", baseUrl: "https://api.x.ai/v1", model: process.env.XAI_MODEL || "grok-4" };
export const MODEL = PROVIDER.model;
// Reads photos of CVs. Only Groq is wired up for this.
export const VISION_MODEL = process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b";

// Writing rules for a CV that is not in Portuguese: the CV's own lines stay in its language.
export const CV_STYLE = (lang) => `Write in ${LANGUAGE_NAMES[lang] || "the CV's own language"}, as a native recruiter would: plain words, short sentences, concrete. No dashes (— or –), no buzzwords (leverage, synergy, dynamic, passionate, innovative, spearheaded), no exclamation marks, no emojis.`;

// Shared writing rules so every answer reads like a person wrote it, in European Portuguese.
export const HUMAN_STYLE = `Escreve sempre em português de Portugal (pt-PT), nunca em português do Brasil.
Trata a pessoa por "tu" e usa o vocabulário de Portugal: "equipa", "ficheiro", "ecrã", "telemóvel", "utilizador", "candidatura", "contacto", "facto", "programador" (não "desenvolvedor").
Escreve como um recrutador atento e simpático fala com alguém do outro lado da mesa: palavras simples, frases curtas, concreto sobre esta pessoa e nada genérico.
Nunca uses travessões (— ou –); usa vírgulas, pontos ou parênteses.
Prefere palavras portuguesas a anglicismos: "pontos" ou "linhas" e não "bullet points", "títulos" e não "headings" (nomes de ferramentas, cargos e siglas como ATS ficam como estão).
Evita estas palavras e outras parecidas: alavancar, potenciar, robusto, sinergia, dinâmico, apaixonado, disruptivo, inovador, jornada, crucial, fundamental, além disso, ademais, no mundo atual, desbloquear, elevar, mergulhar.
Sem pontos de exclamação, a não ser que seja mesmo uma boa notícia. Sem emojis.`;

// The model is told to leave a [placeholder] for figures only the candidate knows, and now and then
// writes one in anyway. Any number in `text` found in none of `sources` becomes a blank ([X], [Y]...),
// so no invented figure reaches a CV. Numbers glued to letters (B2B, C1) are left as they are.
export function blankUnknownNumbers(text, ...sources) {
  if (typeof text !== "string") return text;
  // a bare "X %" the model left is a blank too, written like the others
  const tidy = text.replace(/(?<![\p{L}\p{N}\[])([XYZWVNM])(?=\s?%)/gu, "[$1]");
  const known = new Set((sources.join(" ").match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(",", ".")));
  const taken = new Set([...tidy.matchAll(/\[([A-Z])(?:\s?%)?\]/g)].map((m) => m[1]));
  const free = ["X", "Y", "Z", "W", "V", "N", "M"].filter((l) => !taken.has(l));
  const blanks = new Map();
  return tidy.replace(/(?<![\p{L}\p{N}\[.,])\d+(?:[.,]\d+)?(?![\p{L}\p{N}\]])/gu, (n) => {
    const key = n.replace(",", ".");
    if (known.has(key)) return n;
    if (!blanks.has(key)) blanks.set(key, free[blanks.size % free.length] || "X");
    return `[${blanks.get(key)}]`;
  });
}

// Common short words of each language a CV is likely to be written in.
const STOPWORDS = {
  en: "the and of to in for with on at by from as an is are was were my our their this that have has during new into over per using including led managed developed improved team company",
  pt: "de da do das dos em no na nos nas para com por uma um os as que ao à é foi sou e geri desenvolvi melhorei equipa empresa",
  es: "de la el los las en para con por una un que y es fue soy del al gestioné desarrollé mejoré equipo empresa",
  fr: "de la le les des en pour avec par une un et est était je du au dans sur géré développé amélioré équipe entreprise",
  de: "der die das und mit für von im in auf ein eine ist war ich zu den dem des bei entwickelt verbessert team unternehmen",
  it: "di la il lo gli le in per con da una un che e è era sono del della al nella gestito sviluppato migliorato squadra azienda",
};
const STOPSETS = Object.fromEntries(Object.entries(STOPWORDS).map(([k, v]) => [k, new Set(v.split(" "))]));
export const LANGUAGE_NAMES = { en: "English", pt: "European Portuguese", es: "Spanish", fr: "French", de: "German", it: "Italian" };

// Guesses which language a text is written in from its common short words.
// Returns "" when there is too little text to tell.
export function languageOf(text) {
  const words = String(text || "").toLowerCase().match(/\p{L}+/gu) || [];
  const counts = Object.fromEntries(Object.keys(STOPSETS).map((k) => [k, 0]));
  for (const w of words) for (const k in STOPSETS) if (STOPSETS[k].has(w)) counts[k]++;
  // Portuguese letters settle the near ties with Spanish
  counts.pt += (String(text).match(/[ãõç]|ção|ções/gi) || []).length;
  const [best, second] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (best[1] < 2 || best[1] === second[1]) return "";
  return best[0];
}

const TRANSLATION = { type: "object", properties: { lines: { type: "array", items: { type: "string" } } }, required: ["lines"], additionalProperties: false };

// Puts every string that came back in another language into `lang`, leaving the rest alone.
// `strings` is a flat list; the result has the same length and order.
export async function intoLanguage(strings, lang) {
  if (!LANGUAGE_NAMES[lang]) return strings;
  const wrong = strings.map((s, i) => [s, i]).filter(([s]) => { const l = languageOf(s); return l && l !== lang; });
  if (!wrong.length) return strings;
  const out = [...strings];
  try {
    const { lines } = await structured({
      system: `Translate each line into ${LANGUAGE_NAMES[lang]}, the language of the candidate's CV. Keep the meaning and roughly the same length. Keep [placeholders] like [X], names, companies, tools, numbers and dates exactly as they are. Plain text, no markdown. Return the same number of lines, in order.`,
      content: [{ type: "text", text: JSON.stringify(wrong.map(([s]) => s)) }],
      schema: TRANSLATION,
      maxTokens: 4000,
    });
    wrong.forEach(([, i], n) => { if (lines?.[n]) out[i] = lines[n]; });
  } catch (error) {
    console.warn("[translate]", error.message);
  }
  return out;
}

// Swaps the typographic characters that make text look machine-written for plain ones.
export function humanize(value) {
  if (typeof value === "string") {
    return value
      .replace(/[\u2010\u2011\u2012]/g, "-")
      .replace(/^([ \t]*)[\u2013\u2014][ \t\u00a0\u202f]*/gm, "$1- ") // a dash that starts a line is a list bullet
      .replace(/(\d)[ \u00a0\u202f]*[\u2013\u2014][ \u00a0\u202f]*(\d)/g, "$1-$2")
      .replace(/[ \t\u00a0\u202f]*[\u2013\u2014][ \t\u00a0\u202f]*/g, ", ")
      .replace(/[\u00a0\u202f]/g, " ");
  }
  if (Array.isArray(value)) return value.map(humanize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, humanize(v)]));
  return value;
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Groq's free tier allows each model only so many tokens a minute (8000 for gpt-oss-120b), and every
// model has its own allowance. When the main model is full we ask a smaller one; if both are full and
// Groq says when to come back, we wait that long (if it's short) rather than show an error.
const FALLBACK_MODEL = PROVIDER.name === "Groq" ? process.env.GROQ_FALLBACK_MODEL || "openai/gpt-oss-20b" : null;
const MAX_WAIT_S = 25;
const isRateLimit = (error) => error instanceof ApiError && (error.status === 429 || error.status === 413 || /rate_limit_exceeded/.test(error.message));
// "Please try again in 21.8s" or "in 1m5.2s"; a request too big for the model can't be waited out.
function retryAfter(error) {
  if (/Request too large/i.test(error.message)) return null;
  const m = error.message.match(/try again in (?:(\d+)m)?([\d.]+)s/);
  return m ? Number(m[1] || 0) * 60 + Number(m[2]) : null;
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function send(body) {
  const key = process.env[PROVIDER.env];
  if (!key) throw new ApiError(0, "missing key");
  const response = await fetch(`${PROVIDER.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new ApiError(response.status, detail.slice(0, 500));
  }
  return response;
}

// Sends a chat-completions request and returns the raw fetch response.
// A request that names its own model (photos) only ever goes to that one.
export async function complete(body) {
  const models = body.model ? [body.model] : [MODEL, FALLBACK_MODEL].filter(Boolean);
  const waits = [];
  let lastError;
  for (const model of models) {
    try {
      return await send({ ...body, model });
    } catch (error) {
      if (!isRateLimit(error)) throw error;
      console.warn(`[${PROVIDER.name}] ${model} is at its limit`);
      lastError = error;
      const wait = retryAfter(error);
      if (wait != null) waits.push({ model, wait });
    }
  }
  // Every model is full: wait for the one that frees up first, if that's soon, and try it again.
  const soonest = waits.sort((a, b) => a.wait - b.wait)[0];
  if (!soonest || soonest.wait > MAX_WAIT_S) throw lastError;
  await sleep((soonest.wait + 0.5) * 1000);
  return send({ ...body, model: soonest.model });
}

export { readJson, sendJson } from "./http.js";

export function friendlyError(error) {
  if (error instanceof PlanError) return { status: error.status, message: error.message, code: error.code };
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return { status: 500, message: "Não há nenhuma chave de API de IA configurada. Acrescenta GROQ_API_KEY (ou XAI_API_KEY) ao ambiente." };
    }
    if (error.status === 403 && /credits|licenses/i.test(error.message)) {
      return { status: 500, message: "A conta da xAI ainda não tem créditos de API. Acrescenta créditos em console.x.ai." };
    }
    if (error.status === 401 || error.status === 403) {
      return { status: 500, message: `A chave de API da ${PROVIDER.name} no servidor está em falta ou é inválida. Verifica a ${PROVIDER.env}.` };
    }
    if (error.status === 429) {
      return { status: 429, message: "Estamos com muitos pedidos neste momento. Tenta de novo daqui a um minuto." };
    }
    if (isBadJson(error)) {
      return { status: 502, message: "A resposta veio baralhada. Tenta de novo." };
    }
    if (error.status === 400) {
      console.error(`[${PROVIDER.name} 400]`, error.message);
      return { status: 400, message: "Não foi possível tratar esse pedido. Experimenta um CV em PDF (até 3 MB), Word, texto ou fotografias." };
    }
    return { status: 502, message: `Erro na API da ${PROVIDER.name} (${error.status}). Tenta de novo.` };
  }
  return { status: 500, message: error?.message || "Algo correu mal." };
}

async function pdfText(base64) {
  const pdf = await getDocumentProxy(new Uint8Array(Buffer.from(base64, "base64")));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

// Reads the CV payload from the browser as plain text.
// cv = { kind: "pdf", data: base64, name } | { kind: "text", text, name }
export async function readCv(cv) {
  if (!cv) throw new Error("Não chegou nenhum CV.");
  let text;
  if (cv.kind === "pdf") {
    if (!cv.data) throw new Error("O PDF estava vazio.");
    text = await pdfText(cv.data).catch(() => "");
    if (text.trim().length < 40) throw new Error("Não foi possível ler texto desse PDF. Se for digitalizado, envia antes uma fotografia ou uma captura de ecrã.");
  } else {
    text = String(cv.text || "");
  }
  text = text.trim();
  if (text.length < 40) throw new Error("Esse CV parece curto demais para rever. Cola o texto completo ou anexa um ficheiro.");
  return text;
}

// The CV as text content parts for the model.
// The <cv> wrapper is ours, not part of the document, so the model must not judge it.
export function cvTextBlocks(text, name) {
  return [{ type: "text", text: `O CV está entre as etiquetas <cv> abaixo. Foi o CVviews que as acrescentou; não fazem parte do documento.\n<cv name="${(name || "CV").replace(/"/g, "'")}">\n${text}\n</cv>` }];
}

export async function cvBlocks(cv) {
  return cvTextBlocks(await readCv(cv), cv.name);
}

// The model sometimes writes JSON that fails the provider's own schema check.
// It's a fluke more than a fault, so one more try almost always succeeds.
const isBadJson = (error) => error instanceof ApiError && error.status === 400 && /json_validate_failed/.test(error.message);

// gpt-oss thinks before it answers, and the thinking counts against the per-minute allowance.
// A light think is plenty for reviewing a CV, and leaves room for more people at once.
export const REASONING = PROVIDER.name === "Groq" ? { reasoning_effort: process.env.GROQ_REASONING || "low" } : {};

// Runs a request that must return JSON matching `schema`, and parses it.
export async function structured(request) {
  try {
    return await structuredOnce(request);
  } catch (error) {
    if (!isBadJson(error)) throw error;
    console.warn(`[${PROVIDER.name}] JSON failed the schema check, trying once more`);
    return await structuredOnce(request);
  }
}

async function structuredOnce({ system, content, schema, maxTokens = 12000 }) {
  const response = await complete({
    max_tokens: maxTokens,
    ...REASONING,
    response_format: { type: "json_schema", json_schema: { name: "result", schema, strict: true } },
    messages: [
      { role: "system", content: system },
      { role: "user", content },
    ],
  });
  const data = await response.json();
  const choice = data.choices?.[0];
  if (choice?.finish_reason === "length") {
    throw new Error("A resposta ficou cortada. Experimenta um CV mais curto ou menos perguntas.");
  }
  if (choice?.message?.refusal) {
    throw new Error("A IA não conseguiu ajudar com este pedido. Experimenta outro CV ou outras palavras.");
  }
  return humanize(JSON.parse(choice?.message?.content || "{}"));
}

// Copies the text out of a photo of a CV, so the rest of the app can treat it like any other CV.
export async function imageToText(dataUrl) {
  if (PROVIDER.name !== "Groq") throw new Error("Para ler fotografias é preciso configurar a GROQ_API_KEY.");
  const response = await complete({
    model: VISION_MODEL,
    max_tokens: 6000,
    temperature: 0,
    reasoning_format: "hidden",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Transcribe all the text in this image exactly as written, keeping the line breaks and section order. Output only the text, nothing else. If the image has no readable text, output NO_TEXT." },
        { type: "image_url", image_url: { url: dataUrl } },
      ],
    }],
  });
  const data = await response.json();
  const text = String(data.choices?.[0]?.message?.content || "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  return text === "NO_TEXT" ? "" : text;
}
