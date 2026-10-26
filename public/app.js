// CVviews, the home page: the composer and the conversation it turns into.
// The CV lives only in memory in this tab.
import { lang, t } from "/i18n.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// A PDF travels as base64, a third bigger, and Vercel takes request bodies up to 4.5 MB.
const MAX_PDF_BYTES = 3 * 1024 * 1024;
const MAX_PHOTO_BYTES = 40 * 1024 * 1024; // phones with big sensors take 25-30 MB photos
const MAX_PHOTOS = 4;
const MAMMOTH_URL = "vendor/mammoth.browser.min.js";
const HEIC_URL = "vendor/heic2any.min.js"; // iPhone photos; only loaded when one is attached
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  mode: "review",
  cv: null,        // { kind: "pdf", data, name, size } | { kind: "text", text, name, source }
  pending: null,   // a file still being read: { name, icon, meta }
  review: null,
  role: "",        // the job the latest review or interview was aimed at
  chat: [],        // Ask Leo turns only: [{ role, content, images? }]
  shots: [],       // images waiting to go with the next message to Leo: [{ name, src }]
  busy: false,
  controller: null,
};

// Made-up CVs for trying the site. Names and companies are invented.
const SAMPLES = {
  designer: {
    name: "Exemplo: designer de produto",
    target: "Designer de Produto Sénior numa empresa de saúde digital",
    text: `MARTA OLIVEIRA
Designer de Produto · Lisboa · marta.oliveira@email.pt · linkedin.com/in/martaoliveira

PERFIL
Designer trabalhadora e apaixonada que adora criar experiências bonitas. Boa a trabalhar em equipa e com ótima comunicação.

EXPERIÊNCIA
Designer de Produto, Lumena Saúde (2022 - atual)
- Responsável pelo design da aplicação para doentes
- Trabalhei no redesenho do processo de registo, que melhorou a conclusão
- Ajudei com o sistema de design
- Fiz entrevistas a doentes e médicos

Designer UX Júnior, Estúdio Nove (2020 - 2022)
- Desenhei sites para vários clientes
- Criei wireframes e protótipos no Figma
- Participei em reuniões com clientes

FORMAÇÃO
Licenciatura em Design de Comunicação, Universidade de Lisboa (2016 - 2019)

COMPETÊNCIAS
Figma, Sketch, Adobe CC, prototipagem, investigação com utilizadores, HTML/CSS básico, Microsoft Office`,
  },
  engenheiro: {
    name: "Exemplo: engenheiro de backend",
    target: "Engenheiro de Backend Sénior (Go)",
    text: `TIAGO FERREIRA
Engenheiro de Software | tiago.ferreira@email.pt | github.com/tferreira | Porto

RESUMO
Engenheiro de backend com 4 anos de experiência a construir APIs em Python e Go.

EXPERIÊNCIA
Engenheiro de Backend, Parcelo Logística, março 2022 até hoje
• Criei um serviço de otimização de rotas em Go que reduziu o tempo médio de entrega em 18%
• Migrei endpoints do monólito para microsserviços
• Escalas de prevenção, correção de bugs, revisão de código
• Orientei 2 estagiários

Programador, Banco Litoral, julho 2020 a fevereiro 2022
• Mantive aplicações internas em Django
• Escrevi testes unitários
• Trabalhei numa equipa ágil

2019 - 2020: Viagens e trabalho como freelancer

FORMAÇÃO
Mestrado em Engenharia Informática, Universidade do Porto, 2019

TECNOLOGIAS
Python, Go, Django, FastAPI, PostgreSQL, Redis, Docker, Kubernetes, AWS, Git, Linux`,
  },
  "recem-licenciada": {
    name: "Exemplo: recém-licenciada",
    target: "Analista de Dados Júnior",
    text: `INÊS CARVALHO
Coimbra · ines.carvalho@email.pt · linkedin.com/in/inescarvalho

SOBRE MIM
Recém-licenciada à procura de uma oportunidade para crescer numa empresa dinâmica. Aprendo depressa, sou motivada e organizada.

FORMAÇÃO
Licenciatura em Gestão, Universidade de Coimbra (2021 - 2024). Média final de 15 valores
Semestre Erasmus, Universidad de Salamanca (2023)
Tese: porque é que os clientes deixam uma operadora móvel, com dados de um inquérito a 300 clientes

EXPERIÊNCIA
Estágio de verão, equipa financeira, Grupo Lúmen Retalho (julho a setembro 2023)
- Ajudei a equipa com os relatórios mensais
- Atualizei ficheiros de Excel
- Participei em reuniões

Empregada de mesa, Café Aliados (2020 - 2022, part-time)
- Atendimento a clientes
- Pagamentos e fecho de caixa

COMPETÊNCIAS
Excel, PowerPoint, SPSS, Python básico
Português (nativo), Inglês (C1), Espanhol (B2)`,
  },
};

// The same three people for visitors who see the site in English, with the same weak spots to find.
const SAMPLES_EN = {
  designer: {
    name: "Example: product designer",
    target: "Senior Product Designer at a digital health company",
    text: `MARTA OLIVEIRA
Product Designer · Lisbon · marta.oliveira@email.com · linkedin.com/in/martaoliveira

PROFILE
Hard-working, passionate designer who loves creating beautiful experiences. Great team player with excellent communication skills.

EXPERIENCE
Product Designer, Lumena Health (2022 - present)
- Responsible for the design of the patient app
- Worked on the sign-up redesign, which improved completion
- Helped with the design system
- Interviewed patients and doctors

Junior UX Designer, Studio Nine (2020 - 2022)
- Designed websites for various clients
- Created wireframes and prototypes in Figma
- Took part in client meetings

EDUCATION
BA in Communication Design, University of Lisbon (2016 - 2019)

SKILLS
Figma, Sketch, Adobe CC, prototyping, user research, basic HTML/CSS, Microsoft Office`,
  },
  engenheiro: {
    name: "Example: backend engineer",
    target: "Senior Backend Engineer (Go)",
    text: `TIAGO FERREIRA
Software Engineer | tiago.ferreira@email.com | github.com/tferreira | Porto

SUMMARY
Backend engineer with 4 years of experience building APIs in Python and Go.

EXPERIENCE
Backend Engineer, Parcelo Logistics, March 2022 - present
• Built a route optimisation service in Go that cut average delivery time by 18%
• Migrated endpoints from the monolith to microservices
• On-call rotations, bug fixing, code reviews
• Mentored 2 interns

Developer, Banco Litoral, July 2020 - February 2022
• Maintained internal Django applications
• Wrote unit tests
• Worked in an agile team

2019 - 2020: Travel and freelance work

EDUCATION
MSc in Computer Engineering, University of Porto, 2019

TECHNOLOGIES
Python, Go, Django, FastAPI, PostgreSQL, Redis, Docker, Kubernetes, AWS, Git, Linux`,
  },
  "recem-licenciada": {
    name: "Example: recent graduate",
    target: "Junior Data Analyst",
    text: `INÊS CARVALHO
Coimbra · ines.carvalho@email.com · linkedin.com/in/inescarvalho

ABOUT ME
Recent graduate looking for an opportunity to grow in a dynamic company. Fast learner, motivated and organised.

EDUCATION
BSc in Management, University of Coimbra (2021 - 2024). Final grade 15/20
Erasmus semester, Universidad de Salamanca (2023)
Thesis: why customers leave a mobile operator, using data from a survey of 300 customers

EXPERIENCE
Summer internship, finance team, Lúmen Retail Group (July to September 2023)
- Helped the team with monthly reports
- Updated Excel files
- Took part in meetings

Waitress, Café Aliados (2020 - 2022, part-time)
- Customer service
- Payments and closing the till

SKILLS
Excel, PowerPoint, SPSS, basic Python
Portuguese (native), English (C1), Spanish (B2)`,
  },
};
const sampleFor = (key) => (lang === "en" ? SAMPLES_EN : SAMPLES)[key];

/* ---------------- Helpers ---------------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const shorten = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const words = (text) => text.trim().split(/\s+/).length;

// If you're signed in, requests carry your Firebase sign-in, so the server knows your plan.
// Firebase is only loaded on this page when the login page has left a sign that you're signed in.
let authReady = null;
async function authHeaders() {
  try { if (!localStorage.getItem("cvviews:conta")) return {}; } catch { return {}; }
  authReady ||= (async () => {
    const [{ initializeApp }, fb, { firebaseConfig }] = await Promise.all([
      import("/vendor/firebase/firebase-app.js"), import("/vendor/firebase/firebase-auth.js"), import("/firebase-config.js"),
    ]);
    const auth = fb.getAuth(initializeApp(firebaseConfig));
    await auth.authStateReady();
    return auth;
  })().catch(() => null);
  const token = await (await authReady)?.currentUser?.getIdToken().catch(() => "");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// The server's "free allowance used up" and "Pro only" answers carry a code, so they can be shown as an offer.
const UPSELL = new Set(["limit", "pro"]);
const planError = (data, status) => Object.assign(new Error(data.error || `Algo correu mal (${status}). Tenta de novo.`), { code: data.code });

async function postJson(url, body, signal) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: JSON.stringify({ ...body, lang }), signal });
  let data = {};
  try { data = await res.json(); } catch { /* non-JSON error page */ }
  if (!res.ok) throw planError(data, res.status);
  refreshUsage();
  return data;
}

/* ---------------- Reviews saved to your account ----------------
   Signed in, each review is kept in Firestore under your account (users/{uid}/reviews), so you can
   come back to it from the account page. The rules let only you read or delete them. */
async function signedIn() {
  await authHeaders();
  const auth = await authReady;
  return auth?.currentUser ? auth : null;
}
const firestore = () => import("/vendor/firebase/firebase-firestore-lite.js");

async function saveReview(out, r, cvText, cv) {
  if (r.is_cv === false) return;
  const auth = await signedIn();
  if (!auth) return;
  try {
    const { getFirestore, collection, addDoc, serverTimestamp } = await firestore();
    await addDoc(collection(getFirestore(auth.app), "users", auth.currentUser.uid, "reviews"), {
      cvName: String(cv?.name || "CV").slice(0, 120),
      cvText: String(cvText || "").slice(0, 60000),
      review: JSON.parse(JSON.stringify(r)),
      score: Number(r.overall_score) || 0,
      verdict: String(r.verdict || "").slice(0, 200),
      createdAt: serverTimestamp(),
    });
    $(".actions", out)?.insertAdjacentHTML("beforebegin", `<p class="saved-note"><i class="ph ph-check-circle" aria-hidden="true"></i> Guardada na tua conta. <a href="/entrar">Ver as tuas revisões</a></p>`);
  } catch (err) {
    console.warn("[guardar]", err.code || err.message);
  }
}

// /?revisao=ID opens a saved review again, as if it had just been done.
async function openSaved(id) {
  const auth = await signedIn();
  if (!auth) { setNote("Entra na tua conta para veres as tuas revisões."); return; }
  try {
    const { getFirestore, doc, getDoc } = await firestore();
    const snap = await getDoc(doc(getFirestore(auth.app), "users", auth.currentUser.uid, "reviews", id));
    if (!snap.exists()) { setNote("Essa revisão já não existe."); return; }
    const saved = snap.data();
    const cv = { kind: "text", text: saved.cvText, name: saved.cvName, source: "file" };
    setCv(cv);
    state.review = saved.review;
    await enterThread();
    addMe("Revisão guardada", cv);
    renderReview(addLeo(), saved.review, saved.cvText, cv);
  } catch (err) {
    console.warn("[abrir]", err.code || err.message);
    setNote("Não foi possível abrir essa revisão.");
  }
}

const upsellHtml = (message) => `<div class="err upsell"><p>${esc(message)}</p><a class="btn btn-ink btn-sm" href="/#planos" data-plans>Ver o Pro</a></div>`;

function loadScript(src, failure) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = () => reject(new Error(failure));
    document.head.append(s);
  });
}

// Tiny, safe markdown: escape first, then add bold/italic/code, lists and paragraphs.
function md(text) {
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/(^|\s)_(.+?)_(?=\s|$|[.,!?])/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
  const out = [];
  let list = null;
  for (const raw of String(text).split("\n")) {
    const line = raw.trimEnd();
    const ul = line.match(/^\s*[-*•]\s+(.*)/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (ul || ol) {
      const type = ul ? "ul" : "ol";
      if (!list || list.type !== type) { if (list) out.push(`</${list.type}>`); out.push(`<${type}>`); list = { type }; }
      out.push(`<li>${inline((ul || ol)[1])}</li>`);
      continue;
    }
    if (list) { out.push(`</${list.type}>`); list = null; }
    if (!line.trim()) continue;
    const h = line.match(/^#{1,4}\s+(.*)/);
    out.push(h ? `<p><strong>${inline(h[1])}</strong></p>` : `<p>${inline(line)}</p>`);
  }
  if (list) out.push(`</${list.type}>`);
  return out.join("");
}

// Screen readers hear one short line when something finishes, not every streamed word.
const live = document.createElement("p");
live.className = "sr-only";
live.setAttribute("role", "status");
document.body.append(live);
const announce = (text) => { live.textContent = ""; setTimeout(() => { live.textContent = text; }, 50); };

/* ---------------- Elements ---------------- */
const app = $("#app");
const thread = $("#thread");
const log = $("#log");
const dock = $("#dock");
const composer = $("#composer");
const prompt = $("#prompt");
const attachmentsEl = $("#attachments");
const sendBtn = $("#sendBtn");
const fileInput = $("#fileInput");
const noteEl = $("#composerNote");
const suggestEl = $("#suggest");
const ivOpts = $("#ivOpts");
const nav = $(".nav");

// The bar's "Rever o meu CV" button is only needed once the composer itself is out of sight.
new IntersectionObserver(([en]) => { nav.dataset.cta = en.isIntersecting ? "off" : "on"; }).observe(dock);

// Bring the composer into view: centred on the landing page, or at the end of the conversation.
function showComposer() {
  const behavior = reduceMotion ? "auto" : "smooth";
  if (app.dataset.state === "thread") app.scrollIntoView({ behavior, block: "end" });
  else dock.scrollIntoView({ behavior, block: "center" });
}

// On this page, "Rever o meu CV" links lead straight to the composer instead of reloading.
$$("[data-start]").forEach((b) => b.addEventListener("click", (e) => {
  e.preventDefault();
  setMode(b.dataset.start);
  showComposer();
  setTimeout(() => prompt.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
}));

/* ---------------- Composer ---------------- */
const MODES = {
  review: { send: "Rever o meu CV", label: "O teu CV, ou a vaga a que te candidatas" },
  ask: { send: "Enviar ao Leo", label: "Mensagem para o Leo" },
  interview: { send: "Criar as perguntas", label: "A vaga para a entrevista" },
};

// Phones get the short version, so the box stays one line tall under a conversation.
const narrow = matchMedia("(max-width: 560px)");
function placeholder() {
  const n = narrow.matches;
  if (state.mode === "review") return state.cv ? (n ? "Para que vaga? (opcional)" : "A que vaga te estás a candidatar? (opcional)") : "Cola aqui o teu CV, ou anexa um PDF, Word ou fotografias";
  if (state.mode === "ask") return n ? "Escreve ao Leo" : state.cv ? "Escreve ao Leo o que quiseres, ou junta uma imagem" : "Escreve ao Leo o que quiseres";
  return n ? "Para que vaga é a entrevista?" : "Para que vaga é a entrevista? Escreve o cargo ou cola o anúncio";
}

function canSend() {
  const text = prompt.value.trim();
  if (state.busy) return true;
  if (state.mode === "review") return !!state.cv || text.length >= 200;
  if (state.mode === "ask") return text.length > 0 || state.shots.length > 0;
  return !!state.cv || text.length > 0;
}

function syncComposer() {
  prompt.placeholder = placeholder();
  $("#promptLabel").textContent = MODES[state.mode].label;
  const label = state.busy ? "Parar" : MODES[state.mode].send;
  sendBtn.setAttribute("aria-label", label);
  sendBtn.title = label;
  $(".ph", sendBtn).className = `ph ${state.busy ? "ph-stop" : "ph-arrow-up"}`;
  sendBtn.classList.toggle("is-idle", !canSend());
}

function setMode(mode) {
  if (!MODES[mode]) return;
  state.mode = mode;
  $$('input[name="mode"]').forEach((r) => { r.checked = r.value === mode; });
  ivOpts.hidden = mode !== "interview";
  if (mode === "interview" && !prompt.value.trim() && state.role) { prompt.value = state.role; autosize(); }
  setNote("");
  syncComposer();
}
$$('input[name="mode"]').forEach((r) => r.addEventListener("change", () => setMode(r.value)));

function autosize() {
  prompt.style.height = "auto";
  prompt.style.height = `${Math.min(prompt.scrollHeight, 260)}px`;
}
prompt.addEventListener("input", () => { autosize(); syncComposer(); if (noteEl.textContent) setNote(""); });
prompt.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
  e.preventDefault();
  if (!state.busy) composer.requestSubmit(); // the send button doubles as stop; Enter never stops
});

function setNote(text) { noteEl.textContent = text; }

/* ---------------- Attaching a CV ---------------- */
function describe(cv) {
  if (cv.kind === "pdf") return { icon: "ph-file-pdf", cls: "is-pdf", meta: `PDF${cv.size ? `, ${Math.max(1, Math.round(cv.size / 1024))} KB` : ""}` };
  if (cv.source === "docx") return { icon: "ph-file-doc", cls: "is-doc", meta: `Documento Word, ${words(cv.text)} palavras` };
  if (cv.source === "photo") return { icon: "ph-image", cls: "", meta: `${cv.photos > 1 ? "Lidas" : "Fotografia, lida"} como ${words(cv.text)} palavras` };
  if (cv.source === "sample") return { icon: "ph-file-text", cls: "", meta: "Exemplo inventado para experimentar" };
  if (cv.source === "paste") return { icon: "ph-file-text", cls: "", meta: `Texto colado, ${words(cv.text)} palavras` };
  return { icon: "ph-file-text", cls: "", meta: `Texto, ${words(cv.text)} palavras` };
}

function attachmentHtml(cv) {
  const d = describe(cv);
  return `<div class="att"><span class="att-ic ${d.cls}"><i class="ph ${d.icon}" aria-hidden="true"></i></span>
    <span class="att-text"><span class="att-name">${esc(cv.name)}</span><span class="att-meta">${esc(d.meta)}</span></span>
    <button type="button" class="att-x" data-remove aria-label="Retirar ${esc(cv.name)}"><i class="ph ph-x" aria-hidden="true"></i></button></div>`;
}

function renderAttachments() {
  if (state.pending) {
    attachmentsEl.innerHTML = `<div class="att busy"><span class="att-ic"><i class="ph ${state.pending.icon}" aria-hidden="true"></i></span>
      <span class="att-text"><span class="att-name">${esc(state.pending.name)}</span><span class="att-meta">${esc(state.pending.meta)}</span></span></div>`;
  } else {
    attachmentsEl.innerHTML = (state.cv ? attachmentHtml(state.cv) : "") + state.shots.map((s, i) => `<div class="att att-shot">
      <img class="att-thumb" src="${s.src}" alt="">
      <span class="att-text"><span class="att-name">${esc(s.name)}</span><span class="att-meta">Vai com a próxima mensagem</span></span>
      <button type="button" class="att-x" data-remove-shot="${i}" aria-label="Retirar ${esc(s.name)}"><i class="ph ph-x" aria-hidden="true"></i></button></div>`).join("");
  }
}
attachmentsEl.addEventListener("click", (e) => {
  const shot = e.target.closest("[data-remove-shot]");
  if (shot) {
    state.shots.splice(Number(shot.dataset.removeShot), 1);
    renderAttachments();
    syncComposer();
    prompt.focus();
    return;
  }
  if (!e.target.closest("[data-remove]")) return;
  setCv(null);
  prompt.focus();
});

function setCv(cv) {
  state.cv = cv;
  state.review = null;
  renderAttachments();
  syncComposer();
}

// The API only needs these fields; the rest is for the chip.
const cvPayload = (cv) => (cv ? (cv.kind === "pdf" ? { kind: "pdf", data: cv.data, name: cv.name } : { kind: "text", text: cv.text, name: cv.name }) : null);

// What a file really is, from its first bytes. Phones and chat apps often send photos with no type,
// or a name that doesn't say what's inside (an iPhone photo is HEIC, not JPG).
async function sniff(file) {
  const b = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const at = (i, s) => [...s].every((c, j) => b[i + j] === c.charCodeAt(0));
  if (at(0, "%PDF")) return "pdf";
  if (at(4, "ftyp")) {
    if (["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].some((t) => at(8, t))) return "heic";
    if (["avif", "avis"].some((t) => at(8, t))) return "image";
  }
  if (at(0, "\xff\xd8\xff") || at(0, "\x89PNG") || at(0, "GIF8") || (at(0, "RIFF") && at(8, "WEBP")) || at(0, "BM")) return "image";
  return file.type.startsWith("image/") ? "image" : null;
}

// Opens a photo so the canvas can draw it, the right way up. Only Safari opens iPhone photos (HEIC)
// by itself, so elsewhere they go through a converter first.
async function decodeImage(file, kind) {
  const open = (blob) => createImageBitmap(blob, { imageOrientation: "from-image" }).catch(() => createImageBitmap(blob)).catch(() => null);
  let bitmap = await open(file);
  if (!bitmap && kind === "heic") {
    if (!window.heic2any) await loadScript(HEIC_URL, "Não foi possível abrir essa fotografia do iPhone. Experimenta uma captura de ecrã.");
    const jpeg = await window.heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 }).catch(() => null);
    bitmap = jpeg && (await open(Array.isArray(jpeg) ? jpeg[0] : jpeg));
  }
  if (!bitmap) throw new Error("Não foi possível abrir essa imagem. Experimenta um JPG, um PNG ou uma captura de ecrã.");
  return bitmap;
}

// Phone photos are huge; scale them down before sending so they upload fast and stay under the limit.
function shrinkImage(bitmap, maxSide = 2000) {
  const k = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
}

async function photoText(file, kind) {
  if (file.size > MAX_PHOTO_BYTES) throw new Error("Essa fotografia tem mais de 40 MB. Experimenta uma mais pequena.");
  const image = shrinkImage(await decodeImage(file, kind));
  const { text } = await postJson("/api/read", { image, mime: "image/jpeg" });
  // The photo stays in this tab too, so the review can be drawn on it afterwards.
  return { text, image: `data:image/jpeg;base64,${image}` };
}

// Several photos of the same CV, one per page, read in order and joined.
async function readPhotos(files) {
  if (files.length > MAX_PHOTOS) throw new Error(`Junta no máximo ${MAX_PHOTOS} fotografias, uma por página.`);
  const kinds = await Promise.all(files.map(sniff));
  if (!kinds.every((k) => k === "image" || k === "heic")) throw new Error("Para juntar vários ficheiros, usa só fotografias do CV, uma por página.");
  const name = `CV em ${files.length} fotografias`;
  const pages = [];
  for (const [i, file] of files.entries()) {
    state.pending = { name, icon: "ph-image", meta: `A ler a fotografia ${i + 1} de ${files.length}…` };
    renderAttachments();
    pages.push(await photoText(file, kinds[i]));
  }
  return { kind: "text", text: pages.map((p) => p.text).join("\n\n"), name, source: "photo", photos: files.length, images: pages.map((p) => p.image) };
}

async function readFile(file) {
  const name = file.name || "CV";
  const ext = name.split(".").pop().toLowerCase();
  const kind = await sniff(file);
  if (kind === "image" || kind === "heic" || ["heic", "heif"].includes(ext)) {
    state.pending = { name, icon: "ph-image", meta: "A ler a fotografia…" };
    renderAttachments();
    const page = await photoText(file, kind || "heic");
    return { kind: "text", text: page.text, name, source: "photo", photos: 1, images: [page.image] };
  }
  if (kind === "pdf" || ext === "pdf" || file.type === "application/pdf") {
    if (file.size > MAX_PDF_BYTES) throw new Error("Esse PDF tem mais de 3 MB. Se for digitalizado, envia antes fotografias das páginas.");
    const data = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1]);
      r.onerror = () => reject(new Error("Não foi possível ler esse ficheiro."));
      r.readAsDataURL(file);
    });
    return { kind: "pdf", data, name, size: file.size };
  }
  if (ext === "docx") {
    state.pending = { name, icon: "ph-file-doc", meta: "A abrir o documento…" };
    renderAttachments();
    if (!window.mammoth) await loadScript(MAMMOTH_URL, "Não foi possível abrir o leitor de Word. Experimenta um PDF.");
    const { value } = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return { kind: "text", text: value, name, source: "docx" };
  }
  if (["txt", "md", "text"].includes(ext) || file.type.startsWith("text/")) {
    return { kind: "text", text: await file.text(), name, source: "file" };
  }
  throw new Error("Esse tipo de ficheiro não funciona. Usa um PDF, um Word, um ficheiro de texto ou fotografias.");
}

/* ---------------- Images in the chat ----------------
   Once there's a CV and you're talking to Leo, an image you attach goes with your next message
   (a job ad, a screenshot, another version of the CV) instead of replacing the CV. */
const MAX_SHOTS = 3;
const forChat = () => state.mode === "ask" && !!state.cv;

async function addShots(files) {
  const kinds = await Promise.all(files.map(sniff));
  if (!kinds.every((k) => k === "image" || k === "heic")) return false;
  for (const [i, file] of files.entries()) {
    if (state.shots.length >= MAX_SHOTS) { setNote(`Podes juntar até ${MAX_SHOTS} imagens por mensagem.`); break; }
    if (file.size > MAX_PHOTO_BYTES) { setNote("Essa imagem tem mais de 40 MB. Experimenta uma mais pequena."); continue; }
    const src = `data:image/jpeg;base64,${shrinkImage(await decodeImage(file, kinds[i]), 1600)}`;
    state.shots.push({ name: file.name || "imagem", src });
  }
  renderAttachments();
  syncComposer();
  prompt.focus({ preventScroll: true });
  return true;
}

async function acceptFiles(list) {
  const files = [...list]; // copied first: the file input is cleared straight after
  if (!files.length) return;
  setNote("");
  try {
    if (forChat() && state.plan !== "pro" && (await Promise.all(files.map(sniff))).every((k) => k === "image" || k === "heic")) {
      setNote("Mostrar imagens ao Leo é do plano Pro. Vê os planos mais abaixo na página.");
      return;
    }
    if (forChat() && (await addShots(files))) return;
    const cv = files.length > 1 ? await readPhotos(files) : await readFile(files[0]);
    state.pending = null;
    setCv(cv);
    if (state.mode !== "review" && app.dataset.state !== "thread") setMode("review");
    prompt.focus({ preventScroll: true });
  } catch (e) {
    state.pending = null;
    renderAttachments();
    setNote(e.message);
  }
}

$("#attachBtn").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => { acceptFiles(fileInput.files); fileInput.value = ""; });

// A pasted CV becomes an attachment, so the box stays free for the job you're aiming for.
prompt.addEventListener("paste", (e) => {
  const files = e.clipboardData?.files;
  if (files?.length) { e.preventDefault(); acceptFiles(files); return; }
  if (state.mode !== "review" || state.cv) return;
  const text = e.clipboardData?.getData("text") || "";
  if (text.trim().length < 300) return;
  e.preventDefault();
  setCv({ kind: "text", text: text.trim(), name: "CV colado", source: "paste" });
});

// Drop a file anywhere on the page.
const overlay = $("#dropOverlay");
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes("Files");
let dragDepth = 0;
addEventListener("dragenter", (e) => { if (!hasFiles(e)) return; e.preventDefault(); dragDepth++; overlay.hidden = false; });
addEventListener("dragover", (e) => { if (hasFiles(e)) e.preventDefault(); });
addEventListener("dragleave", (e) => { if (!hasFiles(e)) return; dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) overlay.hidden = true; });
addEventListener("drop", (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault();
  dragDepth = 0;
  overlay.hidden = true;
  if (!e.dataTransfer.files.length) return;
  acceptFiles(e.dataTransfer.files);
  showComposer();
});

/* ---------------- Samples ---------------- */
function runSample(key) {
  const s = sampleFor(key);
  if (!s) return;
  setMode("review");
  setCv({ kind: "text", text: s.text, name: s.name, source: "sample" });
  prompt.value = s.target;
  autosize();
  composer.requestSubmit();
}
$$("[data-sample]").forEach((b) => b.addEventListener("click", () => runSample(b.dataset.sample)));

/* ---------------- The conversation ---------------- */
// Animates a layout change where the browser can; the change itself always happens.
function transition(apply) {
  if (!document.startViewTransition || reduceMotion || document.hidden) { apply(); return Promise.resolve(); }
  const t = document.startViewTransition(apply);
  t.ready.catch(() => {}); // a skipped animation is fine, the update still ran
  // The animation waits for the next frame; if none comes soon (a busy or background tab), change without it.
  // apply() only sets state, so running it twice is harmless.
  return Promise.race([t.updateCallbackDone, new Promise((done) => setTimeout(() => { apply(); done(); }, 800))]);
}

function enterThread() {
  if (app.dataset.state === "thread") return Promise.resolve();
  return transition(() => { app.dataset.state = "thread"; thread.hidden = false; });
}

function addMe(text, cv, images = []) {
  const el = document.createElement("div");
  el.className = "turn turn-me";
  el.innerHTML = `${images.length ? `<div class="said-shots">${images.map((src) => `<img src="${src}" alt="Imagem enviada">`).join("")}</div>` : ""}${text ? `<p class="said">${esc(text)}</p>` : ""}${cv ? `<p class="said-file"><i class="ph ph-file-text" aria-hidden="true"></i> ${esc(cv.name)}</p>` : ""}`;
  log.append(el);
  return el;
}

function addLeo() {
  const el = document.createElement("div");
  el.className = "turn turn-leo";
  el.innerHTML = `<p class="byline">Leo</p><div class="turn-body"></div>`;
  log.append(el);
  return $(".turn-body", el);
}

function thinking(out, lines, { skeleton = false } = {}) {
  out.innerHTML = `<p class="thinking">${esc(lines[0])}…</p>
    ${skeleton ? `<div class="sk-lines" aria-hidden="true"><span class="sk big"></span><span class="sk"></span><span class="sk" style="width:92%"></span><span class="sk" style="width:76%"></span></div>` : ""}`;
  if (lines.length < 2) return () => {};
  let i = 0;
  const timer = setInterval(() => {
    const t = $(".thinking", out);
    if (!t) return clearInterval(timer);
    i = Math.min(i + 1, lines.length - 1);
    t.textContent = `${lines[i]}…`;
  }, 2600);
  return () => clearInterval(timer);
}

function setBusy(busy) {
  state.busy = busy;
  syncComposer();
}

function setSuggestions(list) {
  suggestEl.innerHTML = list.length ? `<span>Podes perguntar</span>${list.map((s, i) => `<button type="button" class="suggest-link" data-i="${i}">${esc(s.label)}</button>`).join("")}` : "";
  suggestEl.hidden = !list.length;
  suggestEl.onclick = (e) => {
    const b = e.target.closest("[data-i]");
    if (!b || state.busy) return;
    const s = list[+b.dataset.i];
    setMode(s.mode);
    prompt.value = t(s.text); // in English, Leo gets the question in English too
    autosize();
    composer.requestSubmit();
  };
}

// Runs one exchange: shows your message, then Leo's answer, with stop and retry built in.
async function exchange({ me, cv, images, task }) {
  await enterThread();
  const turn = addMe(me, cv, images);
  const out = addLeo();
  setSuggestions([]);
  turn.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });

  const attempt = async () => {
    const controller = new AbortController();
    state.controller = controller;
    setBusy(true);
    try {
      await task(out, controller.signal);
    } catch (err) {
      if (err.name === "AbortError") {
        out.insertAdjacentHTML("beforeend", `<p class="stopped">Parado.</p>`);
        $(".thinking", out)?.remove();
        $(".sk-lines", out)?.remove();
      } else {
        if (UPSELL.has(err.code)) { out.innerHTML = upsellHtml(err.message); return; }
        // fetch() fails with a TypeError when the server can't be reached at all.
        const message = err instanceof TypeError ? "Não foi possível falar com o servidor. Verifica a ligação e tenta de novo." : err.message;
        out.innerHTML = `<div class="err"><p>${esc(message)}</p>
          <button type="button" class="text-act" data-retry>Tentar de novo</button></div>`;
        $("[data-retry]", out).addEventListener("click", () => { if (!state.busy) attempt(); });
        announce("Algo correu mal.");
      }
    } finally {
      state.controller = null;
      setBusy(false);
    }
  };
  await attempt();
}

composer.addEventListener("submit", (e) => {
  e.preventDefault();
  if (state.busy) { state.controller?.abort(); return; }
  if (state.pending) { setNote("Só um momento, ainda estamos a ler o teu ficheiro."); return; }
  const text = prompt.value.trim();
  if (state.mode === "review") startReview(text);
  else if (state.mode === "ask") startAsk(text);
  else startInterview(text);
});

function clearPrompt() {
  prompt.value = "";
  autosize();
  setNote("");
}

/* ---------------- Review ---------------- */
function startReview(text) {
  let cv = state.cv;
  let target = text;
  if (!cv && text.length >= 200) {
    cv = { kind: "text", text, name: "CV colado", source: "paste" };
    target = "";
    setCv(cv);
  }
  if (!cv) { setNote("Anexa o teu CV ou cola o texto primeiro."); prompt.focus(); return; }
  clearPrompt();
  exchange({
    me: target ? `Revê o meu CV para ${shorten(target, 160)}` : "Revê o meu CV",
    cv,
    task: async (out, signal) => {
      const stop = thinking(out, [
        "A ler o teu CV",
        target ? "A comparar com a vaga" : "A perceber a que vagas se adequa",
        "A marcar o que funciona e o que não funciona",
        "A escrever novas versões",
      ], { skeleton: true });
      try {
        const { review, cvText } = await postJson("/api/analyze", { cv: cvPayload(cv), target }, signal);
        state.review = review;
        if (target) state.role = target;
        renderReview(out, review, cvText || (cv.kind === "text" ? cv.text : ""), cv);
        saveReview(out, review, cvText || (cv.kind === "text" ? cv.text : ""), cv);
      } finally { stop(); }
    },
  });
}

const SEVERITY = { high: "corrigir primeiro", medium: "vale a pena corrigir", low: "pormenor" };

// New answers come in piece by piece: each block rises into place a beat after the one before.
const APPEAR = [
  ".rv > :not(ol, ul, dl, .rewrites)", ".notes > li", ".rewrites > .rw", ".rv-cats > div", ".issues > li", ".steps-list > li",
  ".iv-set > h3", ".iv-set > p", ".qs > li", ".fb-line", ".fb-cols > div", ".fb-model",
].join(", ");
function appear(root) {
  if (reduceMotion) return;
  $$(APPEAR, root).forEach((el, k) => {
    el.style.setProperty("--k", Math.min(k, 16));
    el.classList.add("appear");
  });
}

// A streamed reply is redrawn on every chunk. Each block remembers when it first showed up,
// so its rise carries on smoothly across redraws instead of starting over.
function appearNew(out, born) {
  if (reduceMotion) return;
  const now = performance.now();
  [...out.children].forEach((el, i) => {
    born[i] ??= now;
    const age = now - born[i];
    if (age > 700) return;
    el.classList.add("appear");
    el.style.animationDelay = `${-age}ms`;
  });
}

/* ---------------- The CV, marked up by its review ----------------
   The review quotes the CV word for word (lines to rewrite, lines that work), so those quotes can be
   found again in the text and marked the way a reviewer's pen would: struck out with the new line
   written in, or underlined. */
const WORD = /[\p{L}\p{N}%+#]+/gu;
// Finds a quote in a line, ignoring case, spacing and punctuation. Falls back to its first words,
// marking from there to the end of the line, for quotes that the CV breaks over two lines.
function findQuote(line, quote) {
  const words = String(quote || "").match(WORD);
  if (!words?.length) return null;
  const pattern = (list) => new RegExp(list.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[^\\p{L}\\p{N}%+#]+"), "iu");
  const whole = line.match(pattern(words));
  if (whole) return { start: whole.index, end: whole.index + whole[0].length };
  if (words.length < 5) return null;
  const head = line.match(pattern(words.slice(0, 5)));
  return head ? { start: head.index, end: line.length } : null;
}
// A handwritten note is a few words, not a paragraph.
const shortNote = (text) => {
  const first = String(text || "").split(/(?<=[.;:])\s/)[0].replace(/[.;:]$/, "");
  return first.length > 70 ? `${first.slice(0, 67).trimEnd()}…` : first;
};

function markedCv(r, text) {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 140);
  if (lines.length < 3) return null;
  const rewrites = (r.rewrites || []).filter((w) => w.original && w.improved);
  const strengths = (r.strengths || []).filter((s) => s.evidence);
  const used = new Set();
  let marks = 0;

  const rows = lines.map((line, i) => {
    const spans = [];
    let note = "";
    rewrites.forEach((w, k) => {
      if (used.has(`w${k}`)) return;
      const at = findQuote(line, w.original);
      if (!at || spans.some((s) => at.start < s.end && s.start < at.end)) return;
      used.add(`w${k}`);
      spans.push({ ...at, kind: "del", improved: w.improved });
      note ||= shortNote(w.why);
    });
    strengths.forEach((s, k) => {
      if (used.has(`s${k}`)) return;
      const at = findQuote(line, s.evidence);
      if (!at || spans.some((x) => at.start < x.end && x.start < at.end)) return;
      used.add(`s${k}`);
      spans.push({ ...at, kind: "hi" });
      note ||= s.title;
    });
    spans.sort((a, b) => a.start - b.start);
    marks += spans.length;

    // The line as it reads on paper, and as it reads once corrected.
    let html = "", fixed = "", pos = 0;
    for (const s of spans) {
      html += esc(line.slice(pos, s.start));
      fixed += line.slice(pos, s.start);
      const piece = line.slice(s.start, s.end);
      if (s.kind === "del") {
        html += `<del class="m-del">${esc(piece)}</del> <ins class="m-ins">${esc(s.improved)}</ins>`;
        fixed += s.improved;
      } else {
        html += `<span class="m-hi">${esc(piece)}</span>`;
        fixed += piece;
      }
      pos = s.end;
    }
    html += esc(line.slice(pos));
    fixed += line.slice(pos);

    const bullet = /^[-•*·▪●◦–]\s*/.test(line);
    const heading = i > 0 && line.length <= 40 && !bullet && (/:$/.test(line) || (line === line.toUpperCase() && /\p{L}{3}/u.test(line)));
    const kind = i === 0 ? "name" : heading ? "heading" : bullet ? "item" : "line";
    if (bullet) html = html.replace(/^[-•*·▪●◦–]\s*/, "");
    const tone = spans[0]?.kind === "hi" ? "n1" : "n3";
    return { kind, html, fixed, note: note && `<span class="m-note ${tone}">${esc(note)}</span>` };
  });

  // Keywords a recruiter would look for, written in beside the skills.
  const kws = (r.ats?.missing_keywords || []).slice(0, 6);
  if (kws.length) {
    const skills = rows.findIndex((row) => row.kind === "heading" && /compet|skill|aptid|ferrament|tecnolog|conhecimento/i.test(row.fixed));
    const extra = { kind: "line", html: `<ins class="m-ins">+ ${esc(kws.join(", "))}</ins>`, fixed: kws.join(", "), note: `<span class="m-note n3">o que um recrutador procura</span>` };
    rows.splice(skills >= 0 ? skills + 1 : rows.length, 0, extra);
    marks += 1;
  }
  if (!marks) return null;

  // Paper markup: consecutive items become one list.
  let body = "", list = false;
  for (const row of rows) {
    if (row.kind !== "item" && list) { body += "</ul>"; list = false; }
    if (row.kind === "name") body += `<header class="paper-head"><p class="paper-name">${row.html}</p></header>`;
    else if (row.kind === "heading") body += `<p class="paper-h">${row.html}</p>`;
    else if (row.kind === "item") {
      if (!list) { body += `<ul class="paper-list">`; list = true; }
      body += `<li class="row"><p>${row.html}</p>${row.note}</li>`;
    } else body += `<div class="row"><p>${row.html}</p>${row.note}</div>`;
  }
  if (list) body += "</ul>";
  return {
    html: `<article class="paper cvmark" aria-label="O teu CV, marcado com esta revisão">${body}</article>`,
    corrected: rows.map((row) => row.fixed).join("\n"),
  };
}

// The pen goes over the sheet once it's in view: what works, what goes, what's new, then the score.
function markWhenSeen(paper) {
  const stages = ["s1", "s2", "s3", "s4"];
  if (reduceMotion || !("IntersectionObserver" in window)) { paper.classList.add(...stages); return; }
  const io = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    io.disconnect();
    stages.forEach((s, i) => setTimeout(() => paper.classList.add(s), 300 + i * 800));
  }, { threshold: 0.25 });
  io.observe(paper);
}

// The text version: the CV's words on a sheet, marked up, and the corrected text to copy.
const sheet = (marked) => `${marked.html}
  <p class="cvmark-act"><button type="button" class="text-act" data-copy="${esc(marked.corrected)}">Copiar o CV já corrigido</button></p>`;

// The visual version: the review drawn on the CV itself, as an image to keep.
async function paintCv(slot, r, cv, marked) {
  const step = (text) => { const el = $("[data-step]", slot); if (el) el.textContent = text; };
  try {
    // The free plan includes a few of these a month; the server keeps count.
    try {
      await postJson("/api/billing?action=visual", {});
    } catch (err) {
      if (!UPSELL.has(err.code)) throw err;
      slot.innerHTML = upsellHtml(err.message) + (marked ? sheet(marked) : "");
      if ($(".cvmark", slot)) markWhenSeen($(".cvmark", slot));
      return;
    }
    const { drawCorrections } = await import("/markup.js");
    const { pages, marks, fixed } = await drawCorrections({ review: r, images: cv.images, pdf: cv.kind === "pdf" ? cv.data : null, onStep: step });
    if (!marks) throw new Error("no quote found on the page");
    const shots = pages.map((c) => c.toDataURL("image/jpeg", 0.9));
    const many = shots.length > 1;
    slot.innerHTML = `${shots.map((src, i) => `<figure class="cvshot-page appear" style="--k:${i}"><img src="${src}" alt="${many ? `Página ${i + 1} do` : "O"} teu CV, com as correções desenhadas por cima"></figure>`).join("")}
      <p class="cvmark-act">${shots.map((src, i) => `<a class="text-act" href="${src}" download="cv-revisto${many ? `-${i + 1}` : ""}.jpg">Descarregar${many ? ` a página ${i + 1}` : " esta versão"}</a>`).join("")}
      ${marked ? `<button type="button" class="text-act" data-copy="${esc(marked.corrected)}">Copiar o texto já corrigido</button>` : ""}</p>`;
    // The same document, corrected in place: its own layout, fonts and colours.
    const full = $("[data-cvfull]", slot.closest(".rv"));
    if (full && fixed?.length) showFixed(full, fixed.map((c) => c.toDataURL("image/jpeg", 0.92)), cv);
    else if (full) fullCv(full, r, cv);
  } catch (err) {
    console.warn("[cv corrigido]", err);
    slot.innerHTML = marked ? sheet(marked) : `<p class="rv-p">Não foi possível desenhar as correções neste ficheiro.</p>`;
    if ($(".cvmark", slot)) markWhenSeen($(".cvmark", slot));
  }
}

/* ---------------- The whole CV, corrected ----------------
   After the marked-up CV, the same CV written out again with the review applied: a clean page to use. */
const blanks = (s) => esc(s).replace(/\[[^\]\n]{1,14}\]/g, (m) => `<mark class="cvdoc-blank">${m}</mark>`);
function cvDocHtml(f) {
  const head = `<header class="cvdoc-head"><h2>${esc(f.name)}</h2>${f.headline ? `<p class="cvdoc-role">${esc(f.headline)}</p>` : ""}${f.contact?.length ? `<p class="cvdoc-contact">${f.contact.map(esc).join(" · ")}</p>` : ""}</header>`;
  const body = (f.sections || []).map((s) => `<section><h3>${esc(s.title)}</h3>${(s.entries || []).map((e) => {
    const top = e.title || e.dates ? `<div class="cvdoc-row"><b>${esc(e.title)}</b><span>${esc(e.dates)}</span></div>` : "";
    const sub = e.subtitle ? `<p class="cvdoc-sub">${esc(e.subtitle)}</p>` : "";
    const lines = e.lines || [];
    const text = !e.title && lines.length === 1 ? `<p>${blanks(lines[0])}</p>` : lines.length ? `<ul>${lines.map((l) => `<li>${blanks(l)}</li>`).join("")}</ul>` : "";
    return `<div class="cvdoc-entry">${top}${sub}${text}</div>`;
  }).join("")}</section>`).join("");
  return head + body;
}
function cvDocText(f) {
  const out = [f.name, f.headline, (f.contact || []).join(" | "), ""];
  for (const s of f.sections || []) {
    out.push(s.title.toUpperCase());
    for (const e of s.entries || []) {
      const top = [e.title, e.subtitle, e.dates].filter(Boolean).join(", ");
      if (top) out.push(top);
      for (const l of e.lines || []) out.push(e.title || (e.lines || []).length > 1 ? `- ${l}` : l);
    }
    out.push("");
  }
  return out.filter((l, i, a) => l !== undefined && !(l === "" && a[i - 1] === "")).join("\n").trim();
}
// The page prints on its own sheet; the browser's print window saves it as a PDF.
const PRINT_CSS = `@page { size: A4; margin: 16mm 16mm 18mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font: 10.5pt/1.45 Calibri, "Segoe UI", Arial, sans-serif; color: #1a1a1a; }
.cvdoc-head h2 { font-size: 22pt; line-height: 1.1; }
.cvdoc-role { margin-top: 2mm; font-size: 12pt; color: #333; }
.cvdoc-contact { margin-top: 2mm; font-size: 9.5pt; color: #555; }
section { margin-top: 6mm; break-inside: auto; }
h3 { font-size: 10.5pt; letter-spacing: .08em; text-transform: uppercase; padding-bottom: 1.2mm; border-bottom: .8pt solid #222; }
.cvdoc-entry { margin-top: 3mm; break-inside: avoid; }
.cvdoc-row { display: flex; justify-content: space-between; gap: 6mm; }
.cvdoc-row span { color: #555; white-space: nowrap; }
.cvdoc-sub { font-style: italic; color: #444; }
ul { margin: 1mm 0 0 5mm; } li { margin-top: .6mm; } p { margin-top: 1mm; }
.cvdoc-blank { background: none; color: inherit; font-weight: 700; }`;
function printCv(f) {
  const frame = Object.assign(document.createElement("iframe"), { title: "CV para imprimir" });
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.append(frame);
  const doc = frame.contentDocument;
  doc.open();
  doc.write(`<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><title>${esc(f.name || "CV")} - CV</title><style>${PRINT_CSS}</style></head><body>${cvDocHtml(f)}</body></html>`);
  doc.close();
  setTimeout(() => { frame.contentWindow.focus(); frame.contentWindow.print(); setTimeout(() => frame.remove(), 2000); }, 250);
}
// The pages as images, one per printed sheet, for the browser to save as a PDF.
function printImages(srcs, name) {
  const frame = Object.assign(document.createElement("iframe"), { title: "CV para imprimir" });
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.append(frame);
  const doc = frame.contentDocument;
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(name)}</title><style>@page { size: A4; margin: 0; } body { margin: 0; } img { display: block; width: 100%; page-break-after: always; break-after: page; }</style></head><body>${srcs.map((s) => `<img src="${s}">`).join("")}</body></html>`);
  doc.close();
  const imgs = [...doc.images];
  Promise.all(imgs.map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })))).then(() => {
    frame.contentWindow.focus(); frame.contentWindow.print(); setTimeout(() => frame.remove(), 2000);
  });
}
// Builds the PDF file and saves it straight away; the print window opens only if that fails.
async function downloadPdf(button, build, name, fallback) {
  const label = button.textContent;
  button.disabled = true;
  button.textContent = "A preparar o PDF…";
  try {
    const m = await import("/pdf.js");
    m.savePdf(await build(m), name);
  } catch (err) {
    console.warn("[pdf]", err);
    announce("Não foi possível criar o PDF. Abre-se a janela de impressão para o guardares.");
    fallback();
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}
function showFixed(slot, srcs, cv) {
  const many = srcs.length > 1;
  const base = (cv.name || "CV").replace(/.[a-z0-9]+$/i, "");
  slot.innerHTML = `${srcs.map((src, i) => `<figure class="cvshot-page appear" style="--k:${i}"><img src="${src}" alt="${many ? `Página ${i + 1} do` : "O"} teu CV, já corrigido"></figure>`).join("")}
    <p class="cvmark-act">${srcs.map((src, i) => `<a class="text-act" href="${src}" download="${esc(base)}-corrigido${many ? `-${i + 1}` : ""}.jpg">Descarregar${many ? ` a página ${i + 1}` : " o CV corrigido"}</a>`).join("")}
    <button type="button" class="text-act" data-print-fixed>Descarregar em PDF</button></p>`;
  $("[data-print-fixed]", slot).addEventListener("click", (e) => downloadPdf(e.currentTarget, (m) => m.imagesPdf(srcs), `${base} corrigido`, () => printImages(srcs, `${base} corrigido`)));
}
async function fullCv(slot, r, cv) {
  try {
    const review = { weaknesses: r.weaknesses, rewrites: r.rewrites, ats: r.ats, next_steps: r.next_steps };
    const { full } = await postJson("/api/analyze", { mode: "full", cv: cvPayload(cv), target: state.role || "", review });
    slot.innerHTML = `<article class="cvdoc appear">${cvDocHtml(full)}</article>
      <p class="cvmark-act"><button type="button" class="text-act" data-print>Descarregar em PDF</button>
      <button type="button" class="text-act" data-copy="${esc(cvDocText(full))}">Copiar o texto</button></p>`;
    $("[data-print]", slot).addEventListener("click", (e) => downloadPdf(e.currentTarget, (m) => m.textPdf(full), `${full.name || "CV"} - CV`, () => printCv(full)));
  } catch (err) {
    slot.innerHTML = `<p class="rv-p">Não foi possível escrever o CV corrigido agora. ${esc(err.message)}</p>`;
  }
}

function renderReview(out, r, cvText, cv) {
  if (r.is_cv === false) {
    out.innerHTML = `<div class="not-cv">
      <h3>Isto não parece um CV.</h3>
      <p>${esc(r.not_cv_reason || "Anexa um CV em PDF, Word ou fotografia, ou cola o texto.")}</p>
      <button type="button" class="text-act" data-pick>Anexar outro ficheiro</button></div>`;
    $("[data-pick]", out).addEventListener("click", () => { setCv(null); setMode("review"); fileInput.click(); });
    announce("Esse ficheiro não parece um CV.");
    return;
  }

  const score = clamp(Number(r.overall_score) || 0, 0, 100);
  const p = r.profile || {};
  // Names often come off the CV in capitals; write them the way a person would.
  const name = p.name && p.name === p.name.toUpperCase() ? p.name.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (m) => m.toUpperCase()) : p.name;
  const profile = [name, p.current_role, p.seniority?.toLowerCase(), p.years_experience].filter(Boolean).join(", ");
  const scores = (r.scores || []).map((s) => ({ ...s, v: clamp(Number(s.score) || 0, 0, 100) }));
  const strengths = r.strengths || [];
  const weaknesses = r.weaknesses || [];
  const rewrites = r.rewrites || [];
  const kws = r.ats?.missing_keywords || [];
  const issues = r.ats?.issues || [];
  const steps = r.next_steps || [];
  const ats = r.ats?.score != null ? clamp(Number(r.ats.score) || 0, 0, 100) : null;
  const marked = markedCv(r, cvText);
  // A photo or a PDF can be marked up as it looks; pasted text and Word files get the sheet.
  const visual = cv?.images?.length > 0 || cv?.kind === "pdf";
  const scoreWords = score >= 85 ? "o que é excelente."
    : `${score >= 70 ? "acima da média" : score >= 50 ? "na média" : "abaixo da média"}. A partir de 85 é excelente.`;

  out.innerHTML = `
    <div class="rv">
      ${profile ? `<p class="rv-profile">${esc(profile)}</p>` : ""}
      <h3 class="rv-verdict">${esc(r.verdict)}</h3>
      <p class="rv-summary">${esc(r.summary)}</p>
      <p class="rv-score-line">No geral, dava-lhe <strong>${score} em 100</strong>, ${scoreWords}</p>

      ${weaknesses.length ? `<h4 class="rv-h">O que corrigir</h4>
      <ol class="notes">${weaknesses.map((w) => `<li>
        <p class="note-title">${esc(w.title)} <span class="sev sev-${esc(w.severity)}">${esc(SEVERITY[w.severity] || w.severity)}</span></p>
        <p>${esc(w.detail)}</p>${w.fix ? `<p class="note-fix"><em>O que fazer:</em> ${esc(w.fix)}</p>` : ""}</li>`).join("")}</ol>` : ""}

      ${rewrites.length ? `<h4 class="rv-h">Linhas a reescrever</h4>
      <div class="rewrites">${rewrites.map((w) => `<div class="rw">
        <p class="rw-text"><del>${esc(w.original)}</del> <ins>${esc(w.improved)}</ins></p>
        ${w.why ? `<p class="rw-why">${esc(w.why)}</p>` : ""}
        <button type="button" class="text-act" data-copy="${esc(w.improved)}">Copiar a nova linha</button>
      </div>`).join("")}</div>` : ""}

      ${strengths.length ? `<h4 class="rv-h">O que está a resultar</h4>
      <ul class="notes">${strengths.map((s) => `<li>
        <p class="note-title">${esc(s.title)}</p><p>${esc(s.detail)}</p>${s.evidence ? `<p class="quote">“${esc(s.evidence)}”</p>` : ""}</li>`).join("")}</ul>` : ""}

      ${scores.length ? `<h4 class="rv-h">Nota por área</h4>
      <dl class="rv-cats">${scores.map((s) => `<div><dt>${esc(s.category)}</dt><dd class="rv-cat-n">${s.v}</dd>${s.note ? `<dd class="rv-cat-note">${esc(s.note)}</dd>` : ""}</div>`).join("")}</dl>` : ""}

      <h4 class="rv-h">Palavras-chave</h4>
      <p class="rv-p">${kws.length ? `Palavras que um recrutador, ou o software dele, pode procurar e que não estão no teu CV: ${kws.map((k) => `<b>${esc(k)}</b>`).join(", ")}.` : "Não falta nenhuma palavra-chave evidente para este tipo de vaga."}${ats != null ? ` Os sistemas de triagem automática (ATS) ${ats >= 70 ? "devem lê-lo bem" : ats >= 50 ? "podem perder partes dele" : "podem ter dificuldade em lê-lo"} (${ats} em 100).` : ""}</p>
      ${issues.length ? `<ul class="issues">${issues.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}

      ${steps.length ? `<h4 class="rv-h">Por onde eu começava</h4><ol class="steps-list">${steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}

      ${visual || marked ? `<h4 class="rv-h">O teu CV, corrigido</h4>
      <p class="rv-p">O que anexaste, com esta revisão por cima: <span class="leg leg-del">a riscar</span>, <span class="leg leg-ins">a escrever no lugar</span> e <span class="leg leg-hi">a manter</span>.</p>
      ${visual ? `<div class="cvshot" data-cvshot><p class="cvshot-wait"><span class="cvshot-dot" aria-hidden="true"></span><span data-step>A preparar o teu CV</span>…</p></div>` : sheet(marked)}` : ""}

      ${cv ? `<h4 class="rv-h">O teu CV, já corrigido</h4>
      <p class="rv-p">Tudo aplicado, pronto a usar. Onde vires um <span class="cvdoc-blank">[X]</span>, põe o teu número.</p>
      <div class="cvfull" data-cvfull><p class="cvshot-wait"><span class="cvshot-dot" aria-hidden="true"></span><span>A escrever o teu CV corrigido</span>…</p></div>` : ""}

      <p class="actions">
        <button type="button" class="text-act" data-act="copy">Copiar a revisão</button>
        <button type="button" class="text-act" data-act="ask">Perguntar sobre isto</button>
        <button type="button" class="text-act" data-act="interview">Treinar a entrevista</button>
      </p>
    </div>`;
  appear(out);
  if (visual) paintCv($("[data-cvshot]", out), r, cv, marked);
  else if ($(".cvmark", out)) markWhenSeen($(".cvmark", out));
  if (cv && !visual) fullCv($("[data-cvfull]", out), r, cv); // a photo or PDF is corrected in place, in paintCv

  announce(`Revisão pronta. O teu CV tem ${score} em 100.`);

  out.addEventListener("click", async (e) => {
    const copy = e.target.closest("[data-copy]");
    if (copy) return copyText(copy, copy.dataset.copy);
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "copy") return copyText(e.target.closest("[data-act]"), reviewText(r));
    if (act === "ask" || act === "interview") {
      setMode(act);
      prompt.focus();
    }
  });

  // the review is in, so the composer turns to follow-up questions
  setMode("ask");
  const top = weaknesses[0]?.title;
  setSuggestions([
    { label: top ? `Como corrijo “${shorten(top, 48)}”?` : "O que devo corrigir primeiro?", mode: "ask", text: top ? `Como corrijo “${top}”?` : "O que devo corrigir primeiro?" },
    { label: "Reescreve o meu resumo de perfil", mode: "ask", text: "Reescreve o meu resumo de perfil" },
    { label: "Faz-me uma entrevista para esta vaga", mode: "interview", text: state.role },
  ]);
}

async function copyText(btn, text) {
  const before = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = "Copiado"; }
  catch { btn.textContent = "Não foi possível copiar. Seleciona o texto"; }
  setTimeout(() => { btn.textContent = before; }, 1600);
}

function reviewText(r) {
  const lines = [`Revisão do CV: ${r.verdict}`, `Nota: ${r.overall_score} em 100`, "", r.summary, ""];
  if (r.weaknesses?.length) lines.push("O que corrigir", ...r.weaknesses.map((w) => `- ${w.title} (${SEVERITY[w.severity] || w.severity}): ${w.detail} O que fazer: ${w.fix}`), "");
  if (r.rewrites?.length) lines.push("Linhas a reescrever", ...r.rewrites.map((w) => `- Antes: ${w.original}\n  Depois: ${w.improved}`), "");
  if (r.strengths?.length) lines.push("O que está a resultar", ...r.strengths.map((s) => `- ${s.title}: ${s.detail}`), "");
  if (r.scores?.length) lines.push("Nota por área", ...r.scores.map((s) => `- ${s.category}: ${s.score}. ${s.note}`), "");
  if (r.ats) lines.push(`ATS: ${r.ats.score} em 100`, r.ats.missing_keywords?.length ? `Palavras-chave em falta: ${r.ats.missing_keywords.join(", ")}` : "", "");
  if (r.next_steps?.length) lines.push("Por onde começar", ...r.next_steps.map((s, i) => `${i + 1}. ${s}`));
  return lines.join("\n").trim();
}

/* ---------------- Ask Leo ---------------- */
// Only the latest message with images sends them again; older ones say there was an image.
function chatPayload() {
  const lastWithImages = state.chat.findLastIndex((m) => m.images?.length);
  return state.chat.map((m, i) => ({
    role: m.role,
    content: m.content || (m.images?.length ? "(imagem)" : ""),
    ...(i === lastWithImages ? { images: m.images } : {}),
  }));
}

function startAsk(text) {
  const images = state.shots.map((s) => s.src);
  if (!text && !images.length) { setNote("Escreve primeiro uma mensagem para o Leo."); prompt.focus(); return; }
  clearPrompt();
  state.shots = [];
  renderAttachments();
  exchange({
    me: text,
    images,
    task: async (out, signal) => {
      state.chat.push({ role: "user", content: text, ...(images.length ? { images } : {}) });
      thinking(out, ["O Leo está a pensar"]);
      let reply = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(await authHeaders()) },
          body: JSON.stringify({ cv: cvPayload(state.cv), review: state.review, messages: chatPayload(), lang }),
          signal,
        });
        if (!res.ok) {
          let data = {};
          try { data = await res.json(); } catch { /* ignore */ }
          throw planError(data, res.status);
        }
        refreshUsage(); // the message was counted
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        out.classList.add("md");
        const born = [];
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          reply += decoder.decode(value, { stream: true });
          out.innerHTML = md(reply);
          appearNew(out, born);
        }
        reply += decoder.decode();
        if (!reply.trim()) reply = "Hum, não percebi bem. Podes perguntar de outra forma?";
        out.innerHTML = md(reply);
        appearNew(out, born);
        state.chat.push({ role: "assistant", content: reply });
        announce("O Leo respondeu.");
      } catch (err) {
        // A stopped reply keeps what already arrived; a failed one lets the same question be asked again.
        // After "Recomeçar" the history is empty, and nothing from the old conversation goes back in.
        const last = state.chat[state.chat.length - 1];
        if (last?.role === "user") {
          if (err.name === "AbortError" && reply.trim()) state.chat.push({ role: "assistant", content: reply });
          else state.chat.pop();
        }
        if (!(err.name === "AbortError" && reply.trim())) out.classList.remove("md");
        throw err;
      }
    },
  });
}

/* ---------------- Interview practice ---------------- */
const STYLE_LABEL = { Mixed: "uma mistura", Behavioural: "comportamentais", Technical: "técnicas", "CV deep-dive": "sobre o meu CV" };
const LEVEL_LABEL = { Friendly: "simpático", Standard: "justo", Tough: "exigente" };

function startInterview(text) {
  const role = text || "";
  if (!state.cv && !role) { setNote("Diz-me a vaga, ou anexa primeiro o teu CV."); prompt.focus(); return; }
  const style = $("#ivStyle").value;
  const level = $("#ivLevel").value;
  const count = $("#ivCount").value;
  clearPrompt();
  const what = role ? `para ${shorten(role.split("\n")[0], 120)}` : "sobre o meu CV";
  exchange({
    me: `Faz-me uma entrevista ${what}. ${count} perguntas, ${STYLE_LABEL[style]}, entrevistador ${LEVEL_LABEL[level]}.`,
    task: async (out, signal) => {
      const stop = thinking(out, ["A ler a vaga", "A escrever as perguntas", "A juntar dicas para cada uma"], { skeleton: true });
      try {
        const { interview } = await postJson("/api/interview", { cv: cvPayload(state.cv), role, style, level, count }, signal);
        if (role) state.role = role;
        renderInterview(out, interview, role);
      } finally { stop(); }
    },
  });
}

function renderInterview(out, iv, role) {
  const qs = iv.questions || [];
  const id = log.children.length;
  out.innerHTML = `<div class="iv-set">
    <h3 class="iv-title">${esc(iv.title)}</h3>
    <p class="iv-intro">${esc(iv.intro)}${state.cv ? "" : " <span>Anexa o teu CV e as perguntas passam a ser sobre a tua experiência.</span>"}</p>
    <ol class="qs">${qs.map((q, i) => `
      <li class="q${i === 0 ? " open" : ""}">
        <button type="button" class="q-head" aria-expanded="${i === 0}" aria-controls="qb-${id}-${i}">
          <span class="q-n">${i + 1}</span>
          <span><span class="q-text">${esc(q.question)}</span>
            <span class="q-meta">${esc(q.type)}, ${esc(String(q.difficulty || "").toLowerCase())}</span></span>
          <i class="ph ph-caret-down" aria-hidden="true"></i>
        </button>
        <div class="q-body" id="qb-${id}-${i}"><div><div class="q-inner">
          <p><b>Porque perguntam:</b> ${esc(q.why_asked)}</p>
          ${q.cv_link ? `<p><b>Do teu CV:</b> ${esc(q.cv_link)}</p>` : ""}
          ${(q.tips || []).length ? `<ul class="q-tips">${q.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
          <form class="practice" data-q="${esc(q.question)}">
            <label class="field-label" for="ans-${id}-${i}">Treina a tua resposta</label>
            <textarea class="field" id="ans-${id}-${i}" placeholder="Escreve-a como a dirias em voz alta"></textarea>
            <div class="practice-row"><span>Recebes uma nota, dicas e uma versão mais forte.</span>
              <button class="btn btn-ink btn-sm" type="submit">Pedir feedback</button></div>
            <p class="form-note" role="status" aria-live="polite"></p>
            <div class="fb-slot"></div>
          </form>
        </div></div></div>
      </li>`).join("")}</ol></div>`;
  appear(out);
  announce(`${qs.length} perguntas de entrevista prontas.`);
  setMode("ask");

  out.addEventListener("click", (e) => {
    const head = e.target.closest(".q-head");
    if (!head) return;
    const q = head.closest(".q");
    q.classList.toggle("open");
    head.setAttribute("aria-expanded", String(q.classList.contains("open")));
  });

  out.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const note = $(".form-note", form);
    const btn = $("button[type=submit]", form);
    const answer = $("textarea", form).value.trim();
    note.textContent = "";
    if (answer.length < 15) { note.textContent = "Escreve um pouco mais antes de pedir feedback."; return; }
    btn.disabled = true;
    btn.textContent = "A ler a tua resposta…";
    try {
      const { feedback: f } = await postJson("/api/interview", { mode: "feedback", cv: cvPayload(state.cv), role, question: form.dataset.q, answer });
      $(".fb-slot", form).innerHTML = `
        <div class="fb">
          <p class="fb-line"><strong>${clamp(Number(f.score) || 0, 0, 10)} em 10.</strong> ${esc(f.verdict)}</p>
          <div class="fb-cols">
            <div><h5>O que resultou</h5><ul>${(f.went_well || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
            <div><h5>Para ficar mais forte</h5><ul>${(f.improve || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
          </div>
          <div class="fb-model"><h5>Uma versão mais forte</h5><p>${esc(f.stronger_answer)}</p></div>
        </div>`;
      appear($(".fb-slot", form));
      announce(`Feedback pronto: ${f.score} em 10.`);
    } catch (err) {
      if (UPSELL.has(err.code)) $(".fb-slot", form).innerHTML = upsellHtml(err.message);
      else note.textContent = err.message;
    } finally {
      btn.disabled = false;
      btn.textContent = "Pedir feedback";
    }
  });

  setSuggestions([
    { label: "Que pergunta devo preparar mais?", mode: "ask", text: "Destas perguntas de entrevista, qual devo preparar mais, e porquê?" },
    { label: "Como estruturo uma resposta STAR?", mode: "ask", text: "Como estruturo uma resposta com o método STAR? Usa um exemplo do meu CV." },
  ]);
}

/* ---------------- Start over ---------------- */
$("#resetBtn").addEventListener("click", () => {
  state.controller?.abort();
  state.chat = [];
  state.shots = [];
  state.review = null;
  state.role = "";
  setCv(null);
  clearPrompt();
  setMode("review");
  transition(() => {
    log.innerHTML = "";
    thread.hidden = true;
    app.dataset.state = "idle";
    setSuggestions([]);
  });
  scrollTo({ top: 0, behavior: "auto" });
  prompt.focus({ preventScroll: true });
});

/* ---------------- Arriving from another page ----------------
   /?modo=leo or /?modo=entrevista opens the composer in that mode; /?exemplo=designer runs a sample. */
const params = new URLSearchParams(location.search);
const MODE_PARAM = { rever: "review", leo: "ask", entrevista: "interview" };
if (params.has("modo") || params.has("exemplo")) {
  history.replaceState(null, "", location.pathname); // a refresh shouldn't run it again
  if (MODE_PARAM[params.get("modo")]) {
    setMode(MODE_PARAM[params.get("modo")]);
    prompt.focus({ preventScroll: true });
  }
  if (SAMPLES[params.get("exemplo")]) runSample(params.get("exemplo"));
}

/* ---------------- Usage ----------------
   What's left of each free allowance, as a meter under the composer that opens the plan's limits.
   The server counts; this only shows it, and asks again after each review or message. */
const usageBox = $("#usage");
const usageBtn = $("#usageBtn");
const usagePanel = $("#usagePanel");
let usage = null;
let usageTimer = 0;
function untilText(t) {
  const m = Math.max(1, Math.round((t - Date.now()) / 60000));
  const h = Math.floor(m / 60);
  if (h >= 48) return `${Math.round(h / 24)} dias`;
  return h ? `${h} h ${m % 60} min` : `${m} min`;
}
// "às 01:00" when the reset is within a day, otherwise the day as well.
function resetText(t) {
  const d = new Date(t);
  const time = d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  return t - Date.now() < 86400000 ? `às ${time}` : `${d.toLocaleDateString("pt-PT", { weekday: "long" })} às ${time}`;
}
const LIMIT_WORDS = { review: ["revisões", "as revisões"], visual: ["CV corrigidos", "os CV corrigidos"], chat: ["mensagens ao Leo", "as mensagens ao Leo"] };
const limitBar = $("#limitBar");
function drawLimitBar(pro) {
  if (!limitBar) return;
  // the allowance closest to running out, once it passes 80%
  const near = usage.items.filter((i) => i.used / i.limit >= 0.8).sort((x, y) => y.used / y.limit - x.used / x.limit)[0];
  const key = near ? `cvviews:aviso:${near.kind}:${near.used >= near.limit ? "fim" : "perto"}:${new Date(near.resets).toISOString().slice(0, 10)}` : "";
  let closed = false;
  try { closed = !!key && sessionStorage.getItem(key) === "1"; } catch { /* no storage: always show */ }
  limitBar.hidden = !near || closed;
  if (limitBar.hidden) return;
  const full = near.used >= near.limit;
  limitBar.classList.toggle("is-full", full);
  $(".limit-pro", limitBar).hidden = pro;
  limitBar.style.setProperty("--used", Math.min(1, near.used / near.limit));
  $(".limit-text", limitBar).innerHTML = `<b>${full ? `Acabaram ${LIMIT_WORDS[near.kind][1]} de hoje` : `Quase no limite de ${LIMIT_WORDS[near.kind][0]}`}</b><span>Repõe ${resetText(near.resets)}</span>`;
  $(".limit-x", limitBar).onclick = () => { try { sessionStorage.setItem(key, "1"); } catch { /* ignore */ } limitBar.hidden = true; };
}
function drawUsage() {
  if (!usage || !usageBox) return;
  usageBox.hidden = false;
  const pro = usage.plan === "pro";
  const worst = Math.max(...usage.items.map((i) => i.used / i.limit));
  usageBox.style.setProperty("--used", Math.min(1, worst));
  usageBox.classList.toggle("is-high", worst >= 0.8 && worst < 1);
  usageBox.classList.toggle("is-full", worst >= 1);
  $(".usage-text", usageBtn).textContent = pro ? "Pro" : "Plano grátis";
  usageBtn.title = "Ver os limites do plano";
  $(".usage-plan", usagePanel).textContent = pro ? "Pro" : "Grátis";
  const link = $(".usage-link", usagePanel);
  link.href = pro ? "/entrar" : "/#planos";
  link.firstChild.textContent = pro ? "A minha conta " : "Ver planos ";
  $(".usage-rows", usagePanel).innerHTML = usage.items.map((i) => {
      const pct = Math.min(100, Math.round((i.used / i.limit) * 100));
    return `<div class="usage-row${pct >= 100 ? " is-full" : pct >= 80 ? " is-high" : ""}"><div class="usage-line"><span>${esc(i.label)}</span><span class="usage-when">Repõe em ${untilText(i.resets)}<b>${i.used}/${i.limit}</b></span></div><div class="usage-bar"><i style="width:${pct}%"></i></div></div>`;
  }).join("");
  drawLimitBar(pro);
}
function refreshUsage() {
  clearTimeout(usageTimer);
  usageTimer = setTimeout(async () => {
    try {
      const res = await fetch("/api/billing?action=usage", { headers: await authHeaders() });
      if (res.ok) { usage = await res.json(); drawUsage(); }
    } catch { /* offline: the meter just keeps its last numbers */ }
  }, 400);
}
function closeUsage(focus) {
  if (usagePanel.hidden) return;
  usagePanel.hidden = true;
  usageBtn.setAttribute("aria-expanded", "false");
  if (focus) usageBtn.focus();
}
if (usageBox) {
  usageBtn.addEventListener("click", () => {
    if (!usagePanel.hidden) return closeUsage();
    usagePanel.hidden = false;
    usageBtn.setAttribute("aria-expanded", "true");
    drawUsage();
    refreshUsage();
  });
  document.addEventListener("click", (e) => { if (!usageBox.contains(e.target)) closeUsage(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeUsage(true); });
  refreshUsage();
}

/* ---------------- Plans ----------------
   Which plan you're on decides a few things on this page (images in the chat); the server enforces it all. */
state.plan = "free";
(async () => {
  const res = await fetch("/api/billing?action=status", { headers: await authHeaders() });
  if (res.ok) state.plan = (await res.json()).plan;
})().catch(() => {});

const planNote = $("#planNote");
async function goPro(button) {
  let signedIn = false;
  try { signedIn = !!localStorage.getItem("cvviews:conta"); } catch { /* no storage, no account */ }
  if (!signedIn) { location.href = "/entrar?modo=registo&seguir=pro"; return; }
  if (planNote) planNote.textContent = "";
  button?.classList.add("is-loading");
  try {
    const { url } = await postJson("/api/billing?action=checkout", {});
    location.href = url;
  } catch (err) {
    button?.classList.remove("is-loading");
    if (err.code === "signin") { location.href = "/entrar?seguir=pro"; return; }
    if (planNote) planNote.textContent = err.message;
  }
}
document.addEventListener("click", (e) => {
  const button = e.target.closest("[data-pro]");
  if (!button) return;
  e.preventDefault();
  goPro(button);
});

if (params.get("revisao")) {
  const id = params.get("revisao");
  history.replaceState(null, "", location.pathname);
  openSaved(id);
}

// Back from Stripe, or from signing in on the way to it.
if (params.get("pro") === "ok") {
  history.replaceState(null, "", location.pathname);
  setNote("Bem-vindo ao Pro. Pode demorar um minuto até tudo ficar desbloqueado.");
}
if (params.get("pro") === "comprar") {
  history.replaceState(null, "", `${location.pathname}#planos`);
  goPro($("[data-pro]"));
}

syncComposer();
