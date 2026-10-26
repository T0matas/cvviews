import { gate } from "../lib/plan.js";
import { blankUnknownNumbers, langOf, replyIn, styleFor, cvTextBlocks, friendlyError, readCv, readJson, sendJson, structured } from "../lib/ai.js";
import { int, list, obj, oneOf, str } from "../lib/schema.js";

export const config = { maxDuration: 120 };

// The model answers with one-word keys, which always pass the strict schema check; people see the Portuguese names.
const TYPES = {
  behavioural: "Comportamental",
  technical: "Técnica",
  situational: "Situacional",
  motivation: "Motivação",
  cv: "Sobre o CV",
  culture: "Cultura",
};
const DIFFICULTY = { warmup: "Aquecimento", medium: "Média", hard: "Difícil" };
const TYPES_EN = { behavioural: "Behavioural", technical: "Technical", situational: "Situational", motivation: "Motivation", cv: "About your CV", culture: "Culture" };
const DIFFICULTY_EN = { warmup: "Warm-up", medium: "Medium", hard: "Hard" };

const QUESTIONS_SCHEMA = obj({
  title: str("A short title for this interview set, e.g. 'Senior Frontend Engineer - technical round'."),
  intro: str("One friendly sentence to the candidate (addressing them directly) on how to practise with this set."),
  questions: list(obj({
    question: str("The interview question, phrased exactly as an interviewer would ask it."),
    type: oneOf(Object.keys(TYPES), "Question type: behavioural, technical, situational, motivation, cv (probes something on the CV) or culture."),
    difficulty: oneOf(Object.keys(DIFFICULTY), "Difficulty: warmup, medium or hard."),
    why_asked: str("What the interviewer is really trying to find out, one sentence."),
    tips: list(str("Tip"), "2-3 short tips for a strong answer, tailored to this candidate's CV."),
    cv_link: str("The part of the CV this question probes, or empty string if generic."),
  }), "The questions, in the order an interview would flow."),
});

const FEEDBACK_SCHEMA = obj({
  score: int("Answer quality from 1 to 10."),
  verdict: str("A one-line verdict, max 10 words."),
  went_well: list(str("Point"), "1-3 things that worked."),
  improve: list(str("Point"), "1-3 specific improvements."),
  stronger_answer: str("A model answer in the candidate's voice and in the same language as their answer, using only facts from their CV or answer; use [placeholders] for unknown specifics. 90-160 words."),
});

const systemFor = (lang) => `You are the interview coach inside CVviews. You design realistic interview questions the way a seasoned hiring manager would,
grounded in the candidate's actual CV and the role they're targeting. Probe real claims on the CV, gaps and transitions, and the core skills of the role.
Be specific; avoid generic filler questions unless asked for warm-ups.
Write everything in ${replyIn(lang)}.
${styleFor(lang)}`;

const STYLES = ["Mixed", "Behavioural", "Technical", "Situational", "CV deep-dive"];
const LEVELS = ["Friendly", "Standard", "Tough"];

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Usa POST." });
  try {
    const body = await readJson(req);
    const lang = langOf(body);
    const SYSTEM = systemFor(lang);
    const cvText = body.cv ? await readCv(body.cv) : "";
    const cvContent = body.cv ? cvTextBlocks(cvText, body.cv.name) : [{ type: "text", text: lang === "en" ? "(No CV: base the questions on the role.)" : "(Sem CV: baseia as perguntas na vaga.)" }];
    const role = String(body.role || "").trim().slice(0, 4000);

    if (body.mode === "feedback") {
      await gate(req, { proOnly: "feedback" });
      const answer = String(body.answer || "").trim();
      if (answer.length < 15) return sendJson(res, 400, { error: "Escreve um pouco mais antes de pedir feedback." });
      const feedback = await structured({
        system: `${SYSTEM}\nNow you are giving feedback on a practice answer. Be honest, kind and concrete. Reward clear structure (e.g. STAR), specifics and measurable results.`,
        content: [
          ...cvContent,
          { type: "text", text: `Vaga: ${role || "não indicada"}\n\nPergunta: ${body.question}\n\nA minha resposta:\n<answer>\n${answer.slice(0, 6000)}\n</answer>\n\nDá-me feedback.` },
        ],
        schema: FEEDBACK_SCHEMA,
        maxTokens: 8000,
      });
      // The model answer only keeps figures from the CV, the answer or the question; the rest become blanks.
      feedback.stronger_answer = blankUnknownNumbers(feedback.stronger_answer, cvText, answer, String(body.question || ""), role);
      return sendJson(res, 200, { feedback });
    }

    if (!body.cv && !role) return sendJson(res, 400, { error: "Anexa um CV ou descreve primeiro a vaga." });
    const count = Math.min(Math.max(parseInt(body.count, 10) || 8, 3), 15);
    const style = STYLES.includes(body.style) ? body.style : "Mixed";
    const level = LEVELS.includes(body.level) ? body.level : "Standard";

    const interview = await structured({
      system: SYSTEM,
      content: [
        ...cvContent,
        { type: "text", text: `Cria exatamente ${count} perguntas de entrevista.\nVaga ou anúncio: ${role || "deduz a vaga mais provável a partir do meu CV"}\nFoco (focus): ${style}\nEstilo do entrevistador (interviewer style): ${level}` },
      ],
      schema: QUESTIONS_SCHEMA,
      maxTokens: 16000,
    });
    interview.questions = (interview.questions || []).map((q) => ({
      ...q,
      type: (lang === "en" ? TYPES_EN : TYPES)[q.type] || q.type,
      difficulty: (lang === "en" ? DIFFICULTY_EN : DIFFICULTY)[q.difficulty] || q.difficulty,
    }));
    sendJson(res, 200, { interview });
  } catch (error) {
    console.error("[interview]", error);
    const { status, message, code } = friendlyError(error);
    sendJson(res, status, { error: message, code });
  }
}
