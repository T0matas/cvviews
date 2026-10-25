import { gate } from "../lib/plan.js";
import { HUMAN_STYLE, cvTextBlocks, friendlyError, readCv, readJson, sendJson, structured } from "../lib/ai.js";
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
    years_experience: str("Estimated professional experience, in Portuguese, e.g. '3 a 4 anos'."),
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
    improved: str("A stronger rewrite in the CV's own language, so it can be pasted straight in. Keep it truthful; use [placeholders] for numbers the candidate must fill in."),
    why: str("Why the rewrite is stronger, one sentence."),
  }), "2 to 4 before/after bullet rewrites."),
  ats: obj({
    score: int("Estimated applicant-tracking-system compatibility from 0 to 100."),
    missing_keywords: list(str("Keyword"), "Up to 8 keywords recruiters for this role would expect but are missing."),
    issues: list(str("Issue"), "Formatting problems that could trip an ATS. Empty if none."),
  }),
  next_steps: list(str("Action"), "3 to 5 prioritised next steps, each one short sentence."),
});

const SYSTEM = `You are CVviews, an experienced recruiter and career coach who has screened thousands of CVs.
Review the candidate's CV honestly and kindly: celebrate what genuinely works and be specific about what doesn't.
Every point must be grounded in the actual CV - quote it where you can. Never invent experience the candidate does not have.
If a target role or job description is given, judge relevance against it; otherwise infer the most likely target from the CV.
If the document is not a CV, set is_cv to false, explain briefly in not_cv_reason, and keep every other field minimal (scores 0, empty lists, empty strings).
Write every field in European Portuguese (pt-PT), except quotes from the CV and rewritten lines, which stay in the CV's own language.
${HUMAN_STYLE}`;

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Usa POST." });
  try {
    const { cv, target } = await readJson(req);
    await gate(req, { count: "review" });
    const ask = target?.trim()
      ? `Vaga ou anúncio:\n<target>\n${target.trim().slice(0, 6000)}\n</target>\n\nRevê o meu CV para esta vaga.`
      : "Revê o meu CV.";
    const cvText = await readCv(cv);
    const review = await structured({
      system: SYSTEM,
      content: [...cvTextBlocks(cvText, cv.name), { type: "text", text: ask }],
      schema: SCHEMA,
    });
    if (review.profile) review.profile.seniority = SENIORITY[review.profile.seniority] || review.profile.seniority;
    review.scores = (review.scores || []).map((s) => ({ ...s, category: CATEGORIES[s.category] || s.category }));
    // The text goes back too, so the page can draw the CV marked up with this review.
    sendJson(res, 200, { review, cvText });
  } catch (error) {
    console.error("[analyze]", error);
    const { status, message, code } = friendlyError(error);
    sendJson(res, status, { error: message, code });
  }
}
