import { gate } from "../lib/plan.js";
import { CV_STYLE, HUMAN_STYLE, LANGUAGE_NAMES, langOf, replyIn, styleFor, blankUnknownNumbers, intoLanguage, languageOf, cvTextBlocks, friendlyError, readCv, readJson, sendJson, structured } from "../lib/ai.js";
import { int, list, obj, oneOf, str } from "../lib/schema.js";

export const config = { maxDuration: 120 };

// The model answers with one-word keys, which always pass the strict schema check
// (written out, it sometimes types "palavras‑chave" with a non-breaking hyphen); people see the Portuguese names.
const CATEGORIES = {
  impact: "Impacto e resultados",
  clarity: "Clareza e estrutura",
  relevance: "Adequação à vaga",
  skills: "Competências e palavras-chave",
  format: "Formatação e ATS",
  language: "Linguagem e tom",
};
const SENIORITY = {
  student: "Estudante",
  entry: "Início de carreira",
  junior: "Júnior",
  mid: "Intermédio",
  senior: "Sénior",
  lead: "Líder / Principal",
  executive: "Executivo",
};

const CATEGORIES_EN = {
  impact: "Impact and results",
  clarity: "Clarity and structure",
  relevance: "Fit for the role",
  skills: "Skills and keywords",
  format: "Formatting and ATS",
  language: "Language and tone",
};
const SENIORITY_EN = { student: "Student", entry: "Entry level", junior: "Junior", mid: "Mid level", senior: "Senior", lead: "Lead / Principal", executive: "Executive" };

const SCHEMA = obj({
  is_cv: { type: "boolean", description: "True if the document is a CV or resume. False if it is something else (an invoice, an essay, a report, a random photo)." },
  not_cv_reason: str("If is_cv is false: one friendly sentence saying what the document seems to be. Otherwise an empty string."),
  overall_score: int("Overall CV quality from 0 to 100. Be calibrated: 85+ is genuinely excellent, 50 is average."),
  verdict: str("A short, warm one-line verdict, max 12 words."),
  summary: str("2-3 sentence plain-English overview of the CV and how it reads to a recruiter."),
  profile: obj({
    name: str("Candidate's name, or empty string if not found."),
    current_role: str("Most recent or target job title."),
    seniority: oneOf(Object.keys(SENIORITY), "Estimated seniority: student, entry (entry level), junior, mid (mid level), senior, lead (lead or principal) or executive."),
    years_experience: str("Estimated professional experience, in the language the review is written in, e.g. '3 a 4 anos' or '3 to 4 years'."),
  }),
  scores: list(obj({
    category: oneOf(Object.keys(CATEGORIES), "Scoring category: impact (impact and results), clarity (clarity and structure), relevance (fit for the target role), skills (skills and keywords), format (formatting and ATS) or language (language and tone)."),
    score: int("0 to 100."),
    note: str("One sentence explaining the score."),
  }), "Exactly one entry per category, in the listed order."),
  strengths: list(obj({
    title: str("Short label, 2-5 words."),
    detail: str("Why this works, 1-2 sentences."),
    evidence: str("A short quote from the CV that shows it, word for word in the CV's own language."),
  }), "3 to 5 genuine strengths."),
  weaknesses: list(obj({
    title: str("Short label, 2-5 words."),
    detail: str("What is wrong and why it hurts, 1-2 sentences."),
    fix: str("A concrete, specific action to fix it."),
    severity: oneOf(["high", "medium", "low"], "How much this hurts the CV."),
  }), "3 to 6 weaknesses, most severe first."),
  rewrites: list(obj({
    original: str("A weak line quoted word for word from the CV, in the CV's own language."),
    improved: str("A stronger rewrite in the CV's own language (an English CV gets an English line), so it can be pasted straight in. Keep it truthful; use [placeholders] for numbers the candidate must fill in."),
    short: str("The same improvement as a natural sentence in the CV's own language and tone (no abbreviations, no symbols like + or - for up and down), about as long as the original line (at most a third longer), to replace it in place on the page. Only facts already on that line: no new results, frequencies, timeframes or quality claims; a figure the candidate must add is a placeholder like [X]."),
    why: str("Why the rewrite is stronger, one sentence."),
  }), "3 to 6 before/after rewrites of the weakest lines (profile and bullets), weakest first."),
  ats: obj({
    score: int("Estimated applicant-tracking-system compatibility from 0 to 100."),
    missing_keywords: list(str("Keyword"), "Up to 8 keywords recruiters for this role would expect but are missing."),
    issues: list(str("Issue"), "Formatting problems that could trip an ATS. Empty if none."),
  }),
  next_steps: list(str("Action"), "3 to 5 prioritised next steps, each one short sentence."),
});

const systemFor = (lang) => `You are CVviews, an experienced recruiter and career coach who has screened thousands of CVs.
Review the candidate's CV honestly and kindly: celebrate what genuinely works and be specific about what doesn't.
Every point must be grounded in the actual CV - quote it where you can. Never invent experience the candidate does not have.
If a target role or job description is given, judge relevance against it; otherwise infer the most likely target from the CV.
If the document is not a CV, set is_cv to false, explain briefly in not_cv_reason, and keep every other field minimal (scores 0, empty lists, empty strings).
Write every field in ${replyIn(lang)}, except quotes from the CV and rewritten lines, which stay in the CV's own language: if the CV is in English, "original", "improved" and "short" are in English.
The writing rules below are for your comments only; they never change the language of "original", "improved" or "short".
${styleFor(lang)}`;

// The whole CV again, with the review applied: what goes is gone, what is weak is rewritten.
const FULL_SCHEMA = obj({
  name: str("The candidate's name, as on the CV."),
  headline: str("Their title or target role, one short line. Empty string if the CV has none."),
  contact: list(str("One contact detail (email, phone, city, link), exactly as on the CV."), "Contact details from the CV, in order. Empty if none."),
  sections: list(obj({
    title: str("Section title in the CV's own language, e.g. 'Professional experience' or 'Experiência profissional'."),
    entries: list(obj({
      title: str("Job title, degree or item name. Empty string for a plain paragraph (like a profile)."),
      subtitle: str("Company or school and place. Empty string if none."),
      dates: str("Dates exactly as on the CV. Empty string if none."),
      lines: list(str("One bullet point, or for a paragraph entry the paragraph itself."), "The lines of this entry."),
    }), "Entries in this section, in the CV's order."),
  }), "Every section of the CV, in its order, nothing left out except what the review said to cut."),
});

const FULL_SYSTEM = `You are CVviews. You get a CV and a review of it, and you write the whole CV again with the review applied.
Keep every true fact, section, job, date and contact detail. Apply the review: use its rewritten lines where they fit, drop what it said to cut, fix the weaknesses it found.
Every line the review rewrote must appear as the review's improved version, and clichés it flagged go. Lines the review did not touch can be tightened, never padded.
Work line by line. Every line you write comes from a line of the same job or section on the CV (or the review's rewrite of that line). Never move a line to another job, never write the same line twice.
Never add anything the CV does not say: no new duties, achievements, frequencies, skill levels, tools, jobs or results. Names, companies, places and dates stay exactly as written (do not add months or change the format), and no examples the CV does not name (sectors, clients, channels).
A placeholder like [X] or [X %] is only for a figure missing from a result the CV already mentions; do not add new results around placeholders.
Plain text only, no markdown.`;
// The writing rules follow the CV: a Portuguese CV gets the pt-PT rules, any other keeps its own language.
const fullSystem = (lang) => lang && lang !== "pt"
  ? `${FULL_SYSTEM}
The CV is in ${LANGUAGE_NAMES[lang]}. Every line you write, section titles included, stays in ${LANGUAGE_NAMES[lang]}; never translate it.
${CV_STYLE(lang)}`
  : `${FULL_SYSTEM}
Write in European Portuguese, as in Portugal: "geri" (not "gerenciei"), "orçamento" (not "budget"), "equipa", "desempenho".
${HUMAN_STYLE}`;
// Said in the request too, because the Portuguese rules pull the model towards Portuguese.
const languageNote = (lang) => lang ? `

O CV está em ${LANGUAGE_NAMES[lang]}. Os campos "original", "improved" e "short" ficam em ${LANGUAGE_NAMES[lang]} (the rewritten lines must be in ${LANGUAGE_NAMES[lang]}).` : "";

// Translates whatever the model wrote outside the CV's language back into it, in place.
async function keepLanguage(full, lang) {
  const slots = [];
  const take = (o, k) => slots.push([o, k]);
  if (full.headline) take(full, "headline");
  for (const s of full.sections || []) {
    take(s, "title");
    for (const e of s.entries || []) {
      if (e.title) take(e, "title");
      e.lines.forEach((_, i) => take(e.lines, i));
    }
  }
  const said = await intoLanguage(slots.map(([o, k]) => o[k]), lang);
  slots.forEach(([o, k], i) => { o[k] = said[i]; });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Usa POST." });
  try {
    const body = await readJson(req);
    const { cv, target, mode, review: given } = body;
    const lang = langOf(body);
    if (mode === "full") {
      // Part of a review already counted, so it counts nothing itself.
      await gate(req, {});
      const cvText = await readCv(cv);
      const cvLang = languageOf(cvText);
      const full = await structured({
        system: fullSystem(cvLang),
        content: [...cvTextBlocks(cvText, cv.name), { type: "text", text: `A revisão (JSON):\n${JSON.stringify(given || {}).slice(0, 20000)}\n\n${target?.trim() ? `Vaga: ${target.trim().slice(0, 2000)}\n\n` : ""}Escreve o CV todo, já corrigido.` }],
        schema: FULL_SCHEMA,
        maxTokens: 16000,
      });
      // Every line the review rewrote goes in as the review wrote it, even if the model left the old one.
      const wordsOf = (s) => new Set(String(s).toLowerCase().match(/[\p{L}\p{N}]+/gu) || []);
      const alike = (a, b) => { const x = wordsOf(a), y = wordsOf(b); let both = 0; for (const w of x) if (y.has(w)) both++; return both / Math.max(1, Math.min(x.size, y.size)); };
      const rewrites = (given?.rewrites || []).filter((w) => w.original && w.improved);
      const applied = (line) => rewrites.find((w) => alike(line, w.original) >= 0.75)?.improved ?? line;
      const fix = (s) => blankUnknownNumbers(applied(s), cvText, target || "");
      full.sections = (full.sections || []).map((s) => ({ ...s, entries: (s.entries || []).map((e) => ({ ...e, dates: String(e.dates || "").replace(/(\d{4}),\s*/g, "$1 - "), lines: (e.lines || []).map(fix) })) }));
      await keepLanguage(full, cvLang);
      return sendJson(res, 200, { full });
    }
    await gate(req, { count: "review" });
    const ask = lang === "en"
      ? (target?.trim() ? `Role or job ad:
<target>
${target.trim().slice(0, 6000)}
</target>

Review my CV for this role.` : "Review my CV.")
      : target?.trim()
      ? `Vaga ou anúncio:\n<target>\n${target.trim().slice(0, 6000)}\n</target>\n\nRevê o meu CV para esta vaga.`
      : "Revê o meu CV.";
    const cvText = await readCv(cv);
    const cvLang = languageOf(cvText);
    const review = await structured({
      system: systemFor(lang),
      content: [...cvTextBlocks(cvText, cv.name), { type: "text", text: ask + languageNote(cvLang) }],
      schema: SCHEMA,
    });
    if (review.profile) review.profile.seniority = (lang === "en" ? SENIORITY_EN : SENIORITY)[review.profile.seniority] || review.profile.seniority;
    review.scores = (review.scores || []).map((s) => ({ ...s, category: (lang === "en" ? CATEGORIES_EN : CATEGORIES)[s.category] || s.category }));
    // A rewritten line only keeps the figures that are on the CV (or in the job ad); the rest become blanks to fill in.
    review.rewrites = (review.rewrites || []).map((w) => ({ ...w, improved: blankUnknownNumbers(w.improved, cvText, target || ""), short: blankUnknownNumbers(w.short, cvText, target || "") }));
    // Any rewrite that still came back in another language is translated into the CV's.
    const said = await intoLanguage(review.rewrites.flatMap((w) => [w.improved, w.short]), cvLang);
    review.rewrites.forEach((w, i) => { w.improved = said[i * 2]; w.short = said[i * 2 + 1]; });
    // The text goes back too, so the page can draw the CV marked up with this review.
    sendJson(res, 200, { review, cvText });
  } catch (error) {
    console.error("[analyze]", error);
    const { status, message, code } = friendlyError(error);
    sendJson(res, status, { error: message, code });
  }
}
