// CVviews app: one composer, three agents (Leo, Revisão, Entrevista), voice in, documents out.
// Talks to the same /api endpoints as the site. The CV lives only in memory in this tab.
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const MAX_PDF_BYTES = 3 * 1024 * 1024; // base64 makes it a third bigger, and Vercel takes bodies up to 4.5 MB
const MAMMOTH_URL = "/vendor/mammoth.browser.min.js";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  agent: "leo",
  cv: null,        // { kind: "pdf", data, name, size } | { kind: "text", text, name, source }
  reading: null,   // a file still being read: { name }
  review: null,
  role: "",
  chat: [],        // Leo's turns: [{ role, content }]
  interview: null, // { title, intro, questions }
  practice: null,  // the interview question being answered
  busy: false,
  controller: null,
};

const AGENTS = {
  leo: { name: "Leo", initial: "L" },
  review: { name: "Revisão", initial: "R" },
  interview: { name: "Entrevista", initial: "E" },
};

// A made-up CV for trying the app. The name and companies are invented.
const SAMPLE = {
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
};

/* ---------------- Helpers ---------------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const icon = (id) => `<svg class="ic"><use href="#i-${id}" /></svg>`;
const words = (text) => text.trim().split(/\s+/).length;
const shorten = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Tiny, safe markdown: escape first, then bold/italic/code, lists and paragraphs.
function md(text) {
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>")
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

/* ---------------- Talking to the server ---------------- */
// Signed in on the site, requests carry the Firebase sign-in, so the server knows the plan.
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

const planError = (data, status) => Object.assign(new Error(data.error || `Algo correu mal (${status}). Tenta de novo.`), { code: data.code });

async function post(url, body, signal) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeaders()) }, body: JSON.stringify(body), signal });
  if (!res.ok) {
    let data = {};
    try { data = await res.json(); } catch { /* not JSON */ }
    throw planError(data, res.status);
  }
  return res;
}

const cvPayload = (cv) => (cv ? (cv.kind === "pdf" ? { kind: "pdf", data: cv.data, name: cv.name } : { kind: "text", text: cv.text, name: cv.name }) : null);

/* ---------------- Elements ---------------- */
const stage = $("#stage");
const log = $("#log");
const dock = $("#dock");
const composer = $("#composer");
const prompt = $("#prompt");
const sendBtn = $("#sendBtn");
const micBtn = $("#micBtn");
const attsEl = $("#atts");
const fileInput = $("#fileInput");
const noteEl = $("#note");
const cleanedEl = $("#cleaned");
const panel = $("#panel");
const newBtn = $("#newBtn");

setTimeout(() => $("#splash")?.remove(), 1400);

/* ---------------- Composer ---------------- */
function placeholder() {
  if (state.agent === "review") return state.cv ? "A que vaga te candidatas? (opcional)" : "Anexa o CV com + ou cola aqui o texto";
  if (state.agent === "interview") {
    if (state.practice) return "A tua resposta. Podes escrever ou falar";
    return "Para que vaga é a entrevista?";
  }
  return "Pergunta qualquer coisa ao Leo";
}

function canSend() {
  const text = prompt.value.trim();
  if (state.agent === "review") return !!state.cv || text.length >= 200;
  if (state.agent === "interview" && !state.practice) return !!state.cv || text.length > 0;
  return text.length > 0;
}

// The round button is the voice button while there's nothing to send, like in a messaging app.
function sync() {
  prompt.placeholder = placeholder();
  let id = "wave"; let label = "Falar";
  if (state.busy) { id = "stop"; label = "Parar"; }
  else if (canSend()) { id = "up"; label = "Enviar"; }
  sendBtn.innerHTML = icon(id);
  sendBtn.setAttribute("aria-label", label);
  sendBtn.title = label;
  sendBtn.classList.toggle("is-voice", id === "wave");
}

function setAgent(agent) {
  if (!AGENTS[agent]) return;
  state.agent = agent;
  $$('input[name="agent"]').forEach((r) => { r.checked = r.value === agent; });
  if (agent !== "interview") setPractice(null);
  note("");
  sync();
}
$$('input[name="agent"]').forEach((r) => r.addEventListener("change", () => setAgent(r.value)));

function autosize() {
  prompt.style.height = "auto";
  prompt.style.height = `${Math.min(prompt.scrollHeight, 220)}px`;
}
prompt.addEventListener("input", () => { autosize(); sync(); note(""); });
prompt.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
  e.preventDefault();
  if (!state.busy && canSend()) composer.requestSubmit();
});

function note(text) { noteEl.textContent = text; }

function setPractice(q) {
  state.practice = q;
  $("#practice")?.remove();
  if (q) {
    const el = document.createElement("div");
    el.className = "practice";
    el.id = "practice";
    el.innerHTML = `<span class="practice-k">A responder</span><p>${esc(q.question)}</p><button class="icon-btn plain" type="button" aria-label="Deixar de responder">${icon("x")}</button>`;
    $("button", el).addEventListener("click", () => { setPractice(null); sync(); });
    composer.before(el);
  }
  sync();
}

/* ---------------- Attaching a CV ---------------- */
function loadScript(src, failure) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.onload = resolve; s.onerror = () => reject(new Error(failure));
    document.head.append(s);
  });
}

function fileKind(cv) {
  if (cv.kind === "pdf") return { cls: "", meta: `PDF, ${Math.max(1, Math.round(cv.size / 1024))} KB` };
  if (cv.source === "docx") return { cls: "is-doc", meta: `Word, ${words(cv.text)} palavras` };
  if (cv.source === "sample") return { cls: "is-txt", meta: "CV inventado para experimentar" };
  return { cls: "is-txt", meta: `Texto, ${words(cv.text)} palavras` };
}

function renderAtts() {
  if (state.reading) {
    attsEl.innerHTML = `<div class="att busy"><span class="file-ic is-txt">${icon("file")}</span><span class="att-text"><span class="att-name">${esc(state.reading.name)}</span><span class="att-meta">A abrir…</span></span></div>`;
    return;
  }
  if (!state.cv) { attsEl.innerHTML = ""; return; }
  const k = fileKind(state.cv);
  attsEl.innerHTML = `<div class="att"><span class="file-ic ${k.cls}">${icon("file")}</span><span class="att-text"><span class="att-name">${esc(state.cv.name)}</span><span class="att-meta">${esc(k.meta)}</span></span><button class="icon-btn" type="button" aria-label="Tirar o CV">${icon("x")}</button></div>`;
  $("button", attsEl).addEventListener("click", () => { state.cv = null; state.review = null; renderAtts(); sync(); prompt.focus(); });
}

async function readFile(file) {
  const name = file.name || "CV";
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "pdf" || file.type === "application/pdf") {
    if (file.size > MAX_PDF_BYTES) throw new Error("Esse PDF tem mais de 3 MB. Experimenta exportá-lo outra vez, ou cola o texto.");
    const data = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1]);
      r.onerror = () => reject(new Error("Não foi possível ler esse ficheiro."));
      r.readAsDataURL(file);
    });
    return { kind: "pdf", data, name, size: file.size };
  }
  if (ext === "docx") {
    if (!window.mammoth) await loadScript(MAMMOTH_URL, "Não foi possível abrir o leitor de Word. Experimenta um PDF.");
    const { value } = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return { kind: "text", text: value, name, source: "docx" };
  }
  if (["txt", "md", "text"].includes(ext) || file.type.startsWith("text/")) {
    return { kind: "text", text: await file.text(), name, source: "file" };
  }
  throw new Error("Esse tipo de ficheiro não funciona aqui. Usa um PDF, um Word ou um ficheiro de texto. Para fotografias, usa o site.");
}

async function attach(file) {
  if (!file) return;
  note("");
  state.reading = { name: file.name || "CV" };
  renderAtts();
  try {
    state.cv = await readFile(file);
    state.review = null;
    if (state.agent === "leo" && !state.chat.length) setAgent("review");
  } catch (err) {
    note(err.message);
  }
  state.reading = null;
  renderAtts();
  sync();
  prompt.focus({ preventScroll: true });
}

$("#attachBtn").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => { attach(fileInput.files[0]); fileInput.value = ""; });
addEventListener("dragover", (e) => { if (e.dataTransfer?.types.includes("Files")) e.preventDefault(); });
addEventListener("drop", (e) => {
  if (!e.dataTransfer?.files.length) return;
  e.preventDefault();
  attach(e.dataTransfer.files[0]);
});

/* ---------------- Voice ----------------
   The wave is drawn from the microphone's loudness; the words come from the browser's speech
   recognition (pt-PT). Stopping cleans the text up: hesitations out, repeated words out, capitals
   and a full stop in. */
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const voiceEl = $("#voice");
const voiceText = $("#voiceText");
const wave = $("#wave");
const voice = { on: false, send: false, stream: null, ctx: null, rec: null, final: "", interim: "", levels: [], started: 0, timer: 0, raf: 0 };

async function startVoice(sendAfter) {
  if (voice.on || state.busy) return;
  note("");
  if (!Recognition) { note("Este navegador não transcreve voz. Experimenta o Chrome, o Edge ou o Safari."); return; }
  try {
    voice.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch {
    note("Sem acesso ao microfone. Dá permissão nas definições do navegador e tenta de novo.");
    return;
  }
  Object.assign(voice, { on: true, send: sendAfter, final: "", interim: "", levels: [], started: performance.now() });

  voice.ctx = new AudioContext();
  const analyser = voice.ctx.createAnalyser();
  analyser.fftSize = 1024;
  voice.ctx.createMediaStreamSource(voice.stream).connect(analyser);
  const samples = new Float32Array(analyser.fftSize);

  voice.rec = new Recognition();
  voice.rec.lang = "pt-PT";
  voice.rec.continuous = true;
  voice.rec.interimResults = true;
  voice.rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) voice.final += `${r[0].transcript} `;
      else interim += r[0].transcript;
    }
    voice.interim = interim;
    showWords();
  };
  // Some browsers stop listening after a pause; keep going until the tick or the cross.
  voice.rec.onend = () => { if (voice.on) try { voice.rec.start(); } catch { /* already starting */ } };
  voice.rec.onerror = (e) => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") { stopVoice(); note("O navegador não deixou usar o reconhecimento de voz."); }
  };
  voice.rec.start();

  composer.classList.add("is-voice");
  voiceEl.hidden = false;
  showWords();
  $("#voiceTime").textContent = "0:00";
  voice.timer = setInterval(() => {
    const s = Math.floor((performance.now() - voice.started) / 1000);
    $("#voiceTime").textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }, 250);

  // Loudness over time, newest on the right; silence is a dot, sound is a bar.
  const dpr = devicePixelRatio || 1;
  let last = 0;
  const draw = (t) => {
    voice.raf = requestAnimationFrame(draw);
    if (t - last < 60) return;
    last = t;
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const v of samples) sum += v * v;
    voice.levels.push(Math.min(1, Math.sqrt(sum / samples.length) * 6));
    const w = wave.clientWidth; const h = wave.clientHeight;
    if (wave.width !== w * dpr) { wave.width = w * dpr; wave.height = h * dpr; }
    const g = wave.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    g.fillStyle = getComputedStyle(document.body).color;
    const step = 7; const bar = 4; const slots = Math.floor(w / step);
    const levels = voice.levels.slice(-slots);
    for (let i = 0; i < slots; i++) {
      const level = levels[i - (slots - levels.length)];
      const x = i * step + bar / 2;
      const bh = level === undefined ? 0 : Math.max(0, level * h);
      if (bh < 5) { g.beginPath(); g.arc(x, h / 2, 1.8, 0, Math.PI * 2); g.fill(); }
      else { g.beginPath(); g.roundRect(x - bar / 2, (h - bh) / 2, bar, bh, bar / 2); g.fill(); }
    }
  };
  voice.raf = requestAnimationFrame(draw);
}

function showWords() {
  $(".voice-final", voiceText).textContent = voice.final;
  $(".voice-interim", voiceText).textContent = voice.interim;
  voiceText.classList.toggle("has-words", !!(voice.final + voice.interim).trim());
  voiceText.scrollTop = voiceText.scrollHeight;
}

function stopVoice() {
  voice.on = false;
  clearInterval(voice.timer);
  cancelAnimationFrame(voice.raf);
  try { voice.rec?.stop(); } catch { /* already stopped */ }
  voice.stream?.getTracks().forEach((t) => t.stop());
  voice.ctx?.close();
  composer.classList.remove("is-voice");
  voiceEl.hidden = true;
}

function cleanSpeech(raw) {
  const fixes = [];
  let text = ` ${raw.replace(/\s+/g, " ").trim()} `;
  const fillers = /\s(?:h+u+m+|h+m+|a+h+n*|e+h+|é{2,}h*|éh+|u+h+|ã+|tipo assim|quer dizer|pronto pronto)(?=[\s,.?!])/gi;
  const before = text;
  text = text.replace(fillers, " ");
  if (text !== before) fixes.push("Hesitações removidas");
  const deduped = text.replace(/\b(\p{L}+)(\s+\1\b)+/giu, "$1");
  if (deduped !== text) fixes.push("Repetições removidas");
  text = deduped.replace(/\s+/g, " ").trim();
  if (!text) return { text: "", fixes: [] };
  let tidy = text.replace(/\s+([,.?!])/g, "$1").replace(/(^|[.?!]\s+)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
  const questionWords = /^(o que|como|porque|porquê|quando|onde|quem|qual|quais|quanto|será|achas|podes|devo|posso|é que)\b/i;
  if (!/[.?!…]$/.test(tidy)) tidy += questionWords.test(tidy) ? "?" : ".";
  if (tidy !== text) fixes.push("Pontuação corrigida");
  return { text: tidy, fixes };
}

function finishVoice() {
  const { text, fixes } = cleanSpeech(`${voice.final} ${voice.interim}`);
  const send = voice.send;
  stopVoice();
  if (!text) { note("Não apanhei nada. Tenta outra vez, mais perto do microfone."); return; }
  prompt.value = prompt.value.trim() ? `${prompt.value.trim()} ${text}` : text;
  autosize();
  sync();
  showFixes(fixes);
  if (send && canSend()) setTimeout(() => composer.requestSubmit(), reduceMotion ? 0 : 700);
  else prompt.focus({ preventScroll: true });
}

function showFixes(fixes) {
  if (!fixes.length) { cleanedEl.hidden = true; return; }
  cleanedEl.innerHTML = fixes.map((f, i) => `<li style="--i:${i}">${icon("check")}${esc(f)}</li>`).join("");
  cleanedEl.hidden = false;
  clearTimeout(showFixes.t);
  showFixes.t = setTimeout(() => { cleanedEl.hidden = true; }, 4200);
}

micBtn.addEventListener("click", () => startVoice(false));
$("#voiceDone").addEventListener("click", finishVoice);
$("#voiceCancel").addEventListener("click", stopVoice);
addEventListener("keydown", (e) => {
  if (!voice.on) return;
  if (e.key === "Escape") stopVoice();
  if (e.key === "Enter") { e.preventDefault(); finishVoice(); }
});

/* ---------------- The conversation ---------------- */
function enterChat() {
  if (stage.dataset.state === "chat") return;
  stage.dataset.state = "chat";
  newBtn.hidden = false;
}

function scrollDown() {
  requestAnimationFrame(() => stage.scrollTo({ top: stage.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" }));
}

function addMe(text, cv) {
  const el = document.createElement("div");
  el.className = "me";
  if (cv) {
    const k = fileKind(cv);
    el.innerHTML = `<div class="me-att"><div class="att"><span class="file-ic ${k.cls}">${icon("file")}</span><span class="att-text"><span class="att-name">${esc(cv.name)}</span><span class="att-meta">${esc(k.meta)}</span></span></div></div>`;
  }
  if (text) el.append(document.createTextNode(text));
  log.append(el);
}

// An agent's turn: who, what it's doing (steps), then the answer and any file it hands back.
function addTurn(agent) {
  const el = document.createElement("article");
  el.className = "turn";
  el.innerHTML = `
    <div class="who"><span class="avatar ${agent}">${AGENTS[agent].initial}</span>${AGENTS[agent].name}</div>
    <div class="work is-busy"><button class="work-head" type="button" aria-expanded="false"><span class="work-label">A trabalhar…</span>${icon("chev")}</button><ol class="steps"></ol></div>
    <div class="answer"></div>`;
  log.append(el);
  const work = $(".work", el);
  const head = $(".work-head", el);
  const steps = $(".steps", el);
  const started = performance.now();
  head.addEventListener("click", () => {
    if (work.classList.contains("is-busy")) return;
    const open = work.classList.toggle("is-open");
    head.setAttribute("aria-expanded", open);
  });
  let current = null;
  const turn = {
    el,
    answer: $(".answer", el),
    step(text) {
      if (current) { current.className = "step is-done"; $(".step-ic", current).innerHTML = icon("check"); }
      current = document.createElement("li");
      current.className = "step is-doing";
      current.innerHTML = `<span class="step-ic"></span><span class="step-text">${esc(text)}</span>`;
      steps.append(current);
      scrollDown();
    },
    done() {
      if (current) { current.className = "step is-done"; $(".step-ic", current).innerHTML = icon("check"); }
      const s = Math.max(1, Math.round((performance.now() - started) / 1000));
      work.classList.remove("is-busy");
      $(".work-label", el).textContent = `Trabalhou durante ${s} ${s === 1 ? "segundo" : "segundos"}`;
    },
    fail(err) {
      turn.done();
      const upsell = err.code === "limit" || err.code === "pro";
      const msg = err.name === "AbortError" ? "Parado." : err.message || "Algo correu mal. Tenta de novo.";
      turn.answer.insertAdjacentHTML("beforeend", `<p class="err">${esc(msg)}${upsell ? ` <a href="/#planos">Ver o Pro</a>` : ""}</p>`);
    },
  };
  // Steps narrate one request on a timer: each shows once the request has been going that long.
  turn.plan = (list) => {
    turn.step(list[0]);
    const timers = list.slice(1).map((text, i) => setTimeout(() => turn.step(text), (i + 1) * 2600));
    return () => timers.forEach(clearTimeout);
  };
  return turn;
}

function fileCard(turn, { name, meta, cls = "", open }) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "file-card";
  btn.innerHTML = `<span class="file-ic ${cls}">${icon("file")}</span><span class="att-text"><span class="att-name">${esc(name)}</span><span class="att-meta">${esc(meta)}</span></span><span class="file-open">Abrir</span>`;
  btn.addEventListener("click", open);
  turn.el.append(btn);
  return btn;
}

function followUps(turn, items) {
  const box = document.createElement("div");
  box.className = "follow";
  for (const [label, run] of items) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "start"; b.textContent = label;
    b.addEventListener("click", () => { box.remove(); run(); });
    box.append(b);
  }
  turn.el.append(box);
}

async function run(task) {
  state.busy = true;
  state.controller = new AbortController();
  sync();
  try { await task(state.controller.signal); } finally {
    state.busy = false;
    state.controller = null;
    sync();
    scrollDown();
  }
}

composer.addEventListener("submit", (e) => {
  e.preventDefault();
  if (state.busy) { state.controller?.abort(); return; }
  if (!canSend()) {
    // nothing to send: the round button is the voice button
    if (state.agent === "review" && prompt.value.trim()) { note("Cola o CV inteiro, ou anexa o ficheiro com +."); return; }
    startVoice(true);
    return;
  }
  const text = prompt.value.trim();
  prompt.value = "";
  autosize();
  cleanedEl.hidden = true;
  enterChat();
  if (state.agent === "review") startReview(text);
  else if (state.agent === "interview") state.practice ? startFeedback(text) : startInterview(text);
  else startAsk(text);
});

/* ---------------- Leo ---------------- */
function startAsk(text) {
  addMe(text);
  state.chat.push({ role: "user", content: text });
  const turn = addTurn("leo");
  turn.step("A pensar");
  scrollDown();
  run(async (signal) => {
    let reply = "";
    try {
      const res = await post("/api/chat", { cv: cvPayload(state.cv), review: state.review, messages: state.chat }, signal);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!reply) turn.done();
        reply += decoder.decode(value, { stream: true });
        turn.answer.innerHTML = md(reply);
        if (stage.scrollHeight - stage.scrollTop - stage.clientHeight < 200) stage.scrollTop = stage.scrollHeight;
      }
      reply += decoder.decode();
      if (!reply.trim()) reply = "Hum, não percebi bem. Podes perguntar de outra forma?";
      turn.done();
      turn.answer.innerHTML = md(reply);
      state.chat.push({ role: "assistant", content: reply });
    } catch (err) {
      if (err.name === "AbortError" && reply.trim()) state.chat.push({ role: "assistant", content: reply });
      else state.chat.pop();
      turn.fail(err);
    }
  });
}

/* ---------------- Review ---------------- */
function startReview(text) {
  // Pasted text with no file is the CV; with a file attached, it's the job.
  if (!state.cv) state.cv = { kind: "text", text, name: "CV colado", source: "paste" };
  const target = state.cv.source === "paste" && state.cv.text === text ? "" : text;
  const cv = state.cv;
  addMe(target ? `Revê o meu CV para esta vaga: ${target}` : "Revê o meu CV.", cv);
  renderAtts();
  const turn = addTurn("review");
  const stopPlan = turn.plan([`A ler ${cv.name}`, "A ler como um recrutador lê", target ? "A comparar com a vaga" : "A ver que vaga combina contigo", "A escrever a revisão"]);
  scrollDown();
  run(async (signal) => {
    try {
      const { review } = await (await post("/api/analyze", { cv: cvPayload(cv), target }, signal)).json();
      stopPlan();
      turn.done();
      if (review.is_cv === false) {
        turn.answer.innerHTML = md(review.not_cv_reason || "Isto não parece um CV. Anexa o teu CV e tento outra vez.");
        state.cv = null;
        renderAtts();
        return;
      }
      state.review = review;
      state.role = target || review.profile?.current_role || "";
      turn.answer.innerHTML = md(`**${review.overall_score} em 100.** ${review.verdict}\n\n${review.summary}`);
      const name = `Revisão – ${review.profile?.name || cv.name.replace(/\.[^.]+$/, "")}`;
      const open = () => openDoc({ name, meta: `${review.overall_score}/100`, html: reviewHtml(review, name) });
      fileCard(turn, { name, meta: `${review.weaknesses?.length || 0} pontos a mudar · ${review.rewrites?.length || 0} frases reescritas`, open });
      followUps(turn, [
        ["Treinar a entrevista", () => { setAgent("interview"); prompt.value = state.role; autosize(); sync(); composer.requestSubmit(); }],
        ["Corrige-me o perfil", () => { setAgent("leo"); prompt.value = "Corrige-me o perfil do CV."; sync(); composer.requestSubmit(); }],
      ]);
      setAgent("leo");
      if (matchMedia("(min-width: 861px)").matches) open();
    } catch (err) {
      stopPlan();
      turn.fail(err);
    }
  });
}

function reviewHtml(r, name) {
  const tone = r.overall_score >= 75 ? "var(--ins)" : r.overall_score >= 50 ? "var(--warn)" : "var(--del)";
  const p = r.profile || {};
  return `<article class="doc">
    <p class="doc-kicker">Revisão do CV</p>
    <h2 class="doc-title">${esc(name.replace(/^Revisão – /, ""))}</h2>
    <p class="doc-sub">${esc([p.current_role, p.seniority, p.years_experience].filter(Boolean).join(" · "))}</p>
    <div class="doc-score"><span class="ring" style="--v:${r.overall_score};--c:${tone}"><b>${r.overall_score}</b></span><p><strong>${esc(r.verdict)}</strong>${esc(r.summary)}</p></div>
    <h3>Por partes</h3>
    <div class="bars">${(r.scores || []).map((s) => `<div class="bar-row"><span>${esc(s.category)}</span><span>${s.score}</span><span class="bar-track"><i data-w="${s.score}"></i></span><small>${esc(s.note)}</small></div>`).join("")}</div>
    <h3>O que mudar primeiro</h3>
    <ul class="items bad">${(r.weaknesses || []).map((w) => `<li class="${esc(w.severity)}"><b>${esc(w.title)}</b><p>${esc(w.detail)}</p><p class="fix">${esc(w.fix)}</p></li>`).join("")}</ul>
    <h3>Frases reescritas</h3>
    ${(r.rewrites || []).map((w) => `<div class="rewrite"><del>${esc(w.original)}</del><ins>${esc(w.improved)}</ins><small>${esc(w.why)}</small></div>`).join("")}
    <h3>O que já está bom</h3>
    <ul class="items good">${(r.strengths || []).map((s) => `<li><b>${esc(s.title)}</b><p>${esc(s.detail)}</p>${s.evidence ? `<q>${esc(s.evidence)}</q>` : ""}</li>`).join("")}</ul>
    <h3>Programas de triagem (ATS) · ${r.ats?.score ?? "–"}/100</h3>
    ${r.ats?.missing_keywords?.length ? `<p class="doc-sub" style="margin:0 0 8px">Palavras que faltam:</p><div class="kw">${r.ats.missing_keywords.map((k) => `<span>${esc(k)}</span>`).join("")}</div>` : ""}
    ${r.ats?.issues?.length ? `<ul class="items" style="margin-top:12px">${r.ats.issues.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}
    <h3>Próximos passos</h3>
    <ol class="next">${(r.next_steps || []).map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
  </article>`;
}

/* ---------------- Interview ---------------- */
function startInterview(text) {
  const role = text || state.role;
  addMe(role ? `Prepara-me para uma entrevista: ${role}` : "Prepara-me para uma entrevista a partir do meu CV.");
  const turn = addTurn("interview");
  const stopPlan = turn.plan([state.cv ? `A ler ${state.cv.name}` : "A ler a vaga", "A pensar como quem contrata", "A escrever as perguntas"]);
  scrollDown();
  run(async (signal) => {
    try {
      const { interview } = await (await post("/api/interview", { cv: cvPayload(state.cv), role, count: 6, style: "Mixed", level: "Standard" }, signal)).json();
      stopPlan();
      turn.done();
      state.interview = interview;
      state.role = role;
      turn.answer.innerHTML = md(`${interview.intro}\n\nAbre as perguntas e escolhe uma para responder. Podes responder a falar.`);
      const name = interview.title || "Perguntas de entrevista";
      const open = () => openDoc({ name, meta: `${interview.questions.length} perguntas`, html: interviewHtml(interview), after: bindPractice });
      fileCard(turn, { name, meta: `${interview.questions.length} perguntas`, cls: "is-iv", open });
      followUps(turn, [["Responder à primeira", () => practise(0)]]);
      if (matchMedia("(min-width: 861px)").matches) open();
    } catch (err) {
      stopPlan();
      turn.fail(err);
    }
  });
}

function interviewHtml(iv) {
  return `<article class="doc">
    <p class="doc-kicker">Treino de entrevista</p>
    <h2 class="doc-title">${esc(iv.title)}</h2>
    <p class="doc-sub">${esc(iv.intro)}</p>
    <div style="margin-top:18px">${iv.questions.map((q, i) => `<section class="q">
      <p class="q-meta"><span>${i + 1}</span><span>${esc(q.type)}</span><span>${esc(q.difficulty)}</span></p>
      <p class="q-text">${esc(q.question)}</p>
      <p class="q-why">${esc(q.why_asked)}</p>
      <ul>${(q.tips || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <button class="start" type="button" data-practise="${i}">Responder a esta</button>
    </section>`).join("")}</div>
  </article>`;
}

function bindPractice(body) {
  $$("[data-practise]", body).forEach((b) => b.addEventListener("click", () => practise(Number(b.dataset.practise))));
}

function practise(i) {
  const q = state.interview?.questions[i];
  if (!q) return;
  if (!matchMedia("(min-width: 861px)").matches) closeDoc();
  setAgent("interview");
  setPractice(q);
  enterChat();
  const turn = addTurn("interview");
  turn.done();
  $(".work", turn.el).remove();
  turn.answer.innerHTML = `<p><strong>${esc(q.question)}</strong></p><p>Responde como responderias na entrevista. Carrega na onda para responder a falar.</p>`;
  scrollDown();
  prompt.focus({ preventScroll: true });
}

function startFeedback(answer) {
  const q = state.practice;
  addMe(answer);
  const turn = addTurn("interview");
  const stopPlan = turn.plan(["A ouvir a tua resposta", "A comparar com o teu CV", "A escrever uma versão mais forte"]);
  scrollDown();
  run(async (signal) => {
    try {
      const { feedback: f } = await (await post("/api/interview", { mode: "feedback", cv: cvPayload(state.cv), role: state.role, question: q.question, answer }, signal)).json();
      stopPlan();
      turn.done();
      turn.answer.innerHTML = md([
        `**${f.score} em 10.** ${f.verdict}`,
        f.went_well?.length ? `**Correu bem**\n${f.went_well.map((x) => `- ${x}`).join("\n")}` : "",
        f.improve?.length ? `**A melhorar**\n${f.improve.map((x) => `- ${x}`).join("\n")}` : "",
        f.stronger_answer ? `**Uma versão mais forte**\n${f.stronger_answer}` : "",
      ].filter(Boolean).join("\n\n"));
      const next = state.interview.questions.indexOf(q) + 1;
      followUps(turn, [
        ["Tentar outra vez", () => { prompt.focus(); }],
        ...(next < state.interview.questions.length ? [["Próxima pergunta", () => practise(next)]] : []),
      ]);
    } catch (err) {
      stopPlan();
      turn.fail(err);
    }
  });
}

/* ---------------- Document panel ---------------- */
function openDoc({ name, meta, html, after }) {
  $("#panelName").textContent = name;
  $("#panelMeta").textContent = meta || "";
  const body = $("#panelBody");
  body.innerHTML = html;
  body.scrollTop = 0;
  panel.hidden = false;
  after?.(body);
  requestAnimationFrame(() => requestAnimationFrame(() => $$("[data-w]", body).forEach((i) => { i.style.width = `${i.dataset.w}%`; })));
}
function closeDoc() { panel.hidden = true; }
$("#panelClose").addEventListener("click", closeDoc);
$("#panelPrint").addEventListener("click", () => print());
addEventListener("keydown", (e) => { if (e.key === "Escape" && !voice.on && !panel.hidden) closeDoc(); });

/* ---------------- Starting points ---------------- */
$$("[data-start]").forEach((b) => b.addEventListener("click", () => {
  setAgent(b.dataset.start);
  if (b.dataset.start === "review" && !state.cv) fileInput.click();
  prompt.focus();
}));
$$("[data-ask]").forEach((b) => b.addEventListener("click", () => {
  setAgent("leo");
  prompt.value = b.dataset.ask;
  sync();
  composer.requestSubmit();
}));
$("[data-sample]").addEventListener("click", async () => {
  state.cv = { kind: "text", text: SAMPLE.text, name: SAMPLE.name, source: "sample" };
  setAgent("review");
  renderAtts();
  await sleep(reduceMotion ? 0 : 350);
  prompt.value = SAMPLE.target;
  sync();
  composer.requestSubmit();
});

newBtn.addEventListener("click", () => {
  state.controller?.abort();
  Object.assign(state, { chat: [], review: null, interview: null, role: "" });
  setPractice(null);
  log.innerHTML = "";
  closeDoc();
  stage.dataset.state = "empty";
  newBtn.hidden = true;
  setAgent(state.cv ? "review" : "leo");
  prompt.focus();
});

// /app?modo=entrevista or /app?modo=revisao opens with that agent picked.
const MODE = { leo: "leo", revisao: "review", entrevista: "interview" };
const mode = MODE[new URLSearchParams(location.search).get("modo")];
if (mode) setAgent(mode);
sync();
