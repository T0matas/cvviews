// Entrar e criar conta no CVviews, com a Firebase Authentication.
// It all happens in the browser: the Firebase SDK (served from our own site) talks to Google's account
// servers and keeps the session in this browser. If it can't load, or the accounts aren't switched on in
// the Firebase console yet, the page says so and nothing typed is kept.
import { firebaseConfig } from "/firebase-config.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const COPY = {
  login: {
    title: "Olá de novo",
    sub: "Entra no CVviews.",
    switch: `Ainda não tens conta? <a href="/entrar?modo=registo" data-mode="signup">Criar conta</a>`,
  },
  signup: {
    title: "Cria a tua conta",
    sub: "Demora um minuto.",
    switch: `Já tens conta? <a href="/entrar" data-mode="login">Entrar</a>`,
  },
};

// Steps that have their own heading, whatever the mode.
const STEP_COPY = {
  reset: ["Recuperar a palavra-passe", "Escreve o email com que criaste a conta e enviamos-te uma ligação para escolheres uma nova."],
  "new-password": ["Escolhe uma nova palavra-passe", "Usa uma que não uses em mais lado nenhum."],
  check: ["Vê o teu email", ""],
  "signed-in": ["A tua conta", "Tens sessão iniciada neste navegador."],
};

// What the page says when the accounts can't be used.
const CLOSED = {
  off: { title: "As contas ainda não abriram", text: "Ainda não é possível entrar nem criar conta. Nada do que escreveste aqui foi guardado." },
  offline: { title: "Não conseguimos ligar às contas", text: "O serviço de contas não respondeu, por isso nada do que escreveste foi enviado. Verifica a ligação à internet e tenta de novo." },
};

// Firebase's error codes, in words people can act on.
const WRONG = "O email ou a palavra-passe não estão certos.";
const MESSAGES = {
  "auth/invalid-email": "Isso não parece um email. Vê se há algum erro, como em nome@exemplo.pt.",
  "auth/missing-password": "Escreve a tua palavra-passe.",
  "auth/invalid-credential": WRONG,
  "auth/invalid-login-credentials": WRONG,
  "auth/wrong-password": WRONG,
  "auth/user-not-found": WRONG,
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/email-already-in-use": "Já existe uma conta com este email. Escreve a palavra-passe para entrares.",
  "auth/weak-password": "Essa palavra-passe é fácil de adivinhar. Escolhe outra mais longa.",
  "auth/password-does-not-meet-requirements": "A palavra-passe não cumpre as regras da conta. Experimenta uma mais longa, com números e símbolos.",
  "auth/too-many-requests": "Foram muitas tentativas seguidas. Espera um bocado e tenta de novo.",
  "auth/network-request-failed": "Sem ligação à internet. Verifica a rede e tenta de novo.",
  "auth/popup-blocked": "O navegador bloqueou a janela da Google. Deixa este site abrir janelas e tenta de novo.",
  "auth/unauthorized-domain": "Este endereço ainda não está autorizado a entrar com a Google.",
  "auth/expired-action-code": "Esta ligação já expirou. Pede uma nova.",
  "auth/invalid-action-code": "Esta ligação já foi usada ou está incompleta. Pede uma nova.",
  "auth/requires-recent-login": "Por segurança, entra outra vez e tenta de novo.",
  "auth/account-exists-with-different-credential": "Já tens conta com este email. Entra com o email e a palavra-passe.",
  "auth/no-current-user": "Entra na tua conta para pedires outro email.",
  "cvviews/google-off": "Entrar com o Google ainda não está ligado. Usa o teu email.",
};
const messageFor = (err) => MESSAGES[err?.code] || "Algo correu mal. Tenta de novo.";
// Codes meaning the accounts aren't switched on in the Firebase console yet.
const OFF = new Set(["auth/configuration-not-found", "auth/operation-not-allowed", "auth/admin-restricted-operation"]);
// The person closed the Google window themselves: nothing to say.
const QUIET = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"]);

const params = new URLSearchParams(location.search);
const state = {
  mode: params.get("modo") === "registo" ? "signup" : "login",
  step: "start",
  email: "",
  resetCode: "",
  closed: null,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const title = $("#title");
const sub = $("#sub");
const switchEl = $("#switch");
const noteEl = $("#note");

// The SDK starts loading with the page, so it's ready by the first click:
// the Google window has to open straight from the click, or the browser blocks it.
const firebase = (async () => {
  try {
    const [{ initializeApp }, fb] = await Promise.all([import("/vendor/firebase/firebase-app.js"), import("/vendor/firebase/firebase-auth.js")]);
    const auth = fb.getAuth(initializeApp(firebaseConfig));
    auth.languageCode = "pt-PT"; // the emails and the Google window in European Portuguese
    return { auth, fb };
  } catch (err) {
    console.error("[contas]", err);
    return null;
  }
})();

// Runs an account action with its button busy. Resolves to false when the accounts can't be used,
// after saying why; Firebase's other errors are thrown for the form to show in the right place.
async function attempt(button, work) {
  const fbase = await firebase;
  if (!fbase) { closed("offline"); return false; }
  try {
    await busy(button, () => work(fbase));
    return true;
  } catch (err) {
    if (OFF.has(err.code)) { closed("off"); return false; }
    throw err;
  }
}

// Links in our emails bring people back here. Firebase only allows addresses on the project's authorised
// domains, so while this one isn't listed the email still goes, just without the way back.
async function withReturn(send, query) {
  try {
    await send({ url: `${location.origin}/entrar${query}` });
  } catch (err) {
    if (!/continue-uri/.test(err.code || "")) throw err;
    await send(undefined);
  }
}

// The other pages can't see the session, so the first name waits here for the bar to greet you with.
const HINT = "cvviews:conta";
function remember(user) {
  try {
    if (user) localStorage.setItem(HINT, (user.displayName || user.email || "").split(/[\s@]/)[0]);
    else localStorage.removeItem(HINT);
  } catch { /* storage blocked: the bar just keeps saying Entrar */ }
}

// Each account has a profile in Firestore (users/{uid}): name, email, how they sign in, and when.
// The security rules (firestore.rules) let people read and write only their own. It's best effort:
// if the profile can't be saved, signing in still works.
async function saveProfile(user) {
  if (!user) return;
  try {
    const { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } = await import("/vendor/firebase/firebase-firestore-lite.js");
    const ref = doc(getFirestore(user.auth?.app || (await firebase).auth.app), "users", user.uid);
    const data = {
      name: (user.displayName || "").slice(0, 100),
      email: user.email || "",
      provider: user.providerData[0]?.providerId === "google.com" ? "google" : "email",
      lastLoginAt: serverTimestamp(),
    };
    const snap = await getDoc(ref);
    if (snap.exists()) await updateDoc(ref, data);
    else await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  } catch (err) {
    console.warn("[perfil]", err.code || err.message);
  }
}
// Never keep someone waiting on the profile for more than a moment.
const shortly = (promise, ms = 3000) => Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);

async function finish() {
  const user = (await firebase)?.auth.currentUser;
  remember(user);
  await shortly(saveProfile(user));
  location.href = next;
}
// Coming from "Passar a Pro": once signed in, straight on to the payment.
const next = params.get("seguir") === "pro" ? "/?pro=comprar" : "/";

// Shows a spinner on the button while `work` runs.
async function busy(button, work) {
  button.classList.add("is-loading");
  button.disabled = true;
  try { return await work(); } finally {
    button.classList.remove("is-loading");
    button.disabled = false;
  }
}

function note(text, ok = false) {
  noteEl.textContent = text;
  noteEl.hidden = !text;
  noteEl.classList.toggle("ok", ok);
}

function setError(id, text) {
  $(`#${id}`).textContent = text;
  const input = $(`[aria-describedby~="${id}"]`);
  input?.classList.toggle("invalid", !!text);
  input?.setAttribute("aria-invalid", text ? "true" : "false");
}

// Show what's wrong under the field and put the cursor back in it.
function fail(id, text) {
  setError(id, text);
  $(`[aria-describedby~="${id}"]`)?.focus();
}

function render() {
  const copy = COPY[state.mode];
  const [stepTitle, stepSub] = STEP_COPY[state.step] || [];
  title.textContent = state.step === "done" ? CLOSED[state.closed].title : stepTitle || copy.title;
  const subText = state.step === "done" ? "" : stepTitle ? stepSub : copy.sub;
  sub.textContent = subText;
  sub.hidden = !subText;
  const showSwitch = ["start", "password", "details"].includes(state.step);
  switchEl.innerHTML = showSwitch ? copy.switch : "";
  switchEl.hidden = !showSwitch;
  $$("[data-email]").forEach((el) => { el.textContent = state.email; });
  $("#email").setAttribute("autocomplete", state.mode === "signup" ? "email" : "username");
  document.title = `${state.mode === "signup" ? "Criar conta" : "Entrar"} | CVviews`;
}

// Steps slide forward and back, so moving through the form feels like one place.
const ORDER = ["start", "password", "details", "reset", "new-password", "check", "signed-in", "done"];
function go(step, { focus = true } = {}) {
  const from = state.step;
  state.step = step;
  render();
  $$(".step").forEach((el) => {
    const on = el.dataset.step === step;
    el.hidden = !on;
    el.classList.remove("in-fwd", "in-back");
    if (on && from !== step && !reduceMotion) {
      void el.offsetWidth; // restart the entrance
      el.classList.add(ORDER.indexOf(step) >= ORDER.indexOf(from) ? "in-fwd" : "in-back");
    }
  });
  if (!focus) return;
  const target = ["done", "check", "signed-in"].includes(step) ? title : $(`.step[data-step="${step}"] input`);
  target?.focus({ preventScroll: true });
}

function setMode(mode, step = "start") {
  state.mode = mode;
  const url = new URL(location.href);
  if (mode === "signup") url.searchParams.set("modo", "registo");
  else url.searchParams.delete("modo");
  history.replaceState(null, "", url);
  go(step);
}

switchEl.addEventListener("click", (e) => {
  const a = e.target.closest("[data-mode]");
  if (!a) return;
  e.preventDefault();
  note("");
  setMode(a.dataset.mode);
});

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-go]");
  if (!b) return;
  const step = b.dataset.go;
  if (step === "reset") $("#resetEmail").value = state.email;
  note("");
  go(step === "password" && state.mode === "signup" ? "details" : step);
});

// When the accounts can't be used, every path ends here.
function closed(reason) {
  state.closed = reason;
  $("#doneText").textContent = `${CLOSED[reason].text} As revisões, o Leo e o treino de entrevistas funcionam todos sem conta.`;
  $$("input[type=password]").forEach((i) => { i.value = ""; });
  go("done");
}

function checkEmail(text, { home = false } = {}) {
  $("#checkText").textContent = text;
  $("#checkHome").href = next;
  $("#checkHome").hidden = !home;
  $("#resendBtn").hidden = state.mode !== "signup";
  setError("resendErr", "");
  go("check");
}

/* ---------------- 1. Email ---------------- */
$("#email").addEventListener("input", () => setError("emailErr", ""));
$("#emailForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#email").value.trim();
  if (!email) return fail("emailErr", "Escreve o teu email para continuar.");
  if (!EMAIL.test(email)) return fail("emailErr", "Isso não parece um email. Vê se há algum erro, como em nome@exemplo.pt.");
  state.email = email;
  note("");
  go(state.mode === "signup" ? "details" : "password");
});

$("#google").addEventListener("click", async (e) => {
  note("");
  try {
    const ok = await attempt(e.currentTarget, ({ auth, fb }) => fb.signInWithPopup(auth, new fb.GoogleAuthProvider()).catch((err) => {
      // Only Google is off; the email still works, so don't close the whole page.
      throw err.code === "auth/operation-not-allowed" ? Object.assign(err, { code: "cvviews/google-off" }) : err;
    }));
    if (ok) finish();
  } catch (err) {
    if (!QUIET.has(err.code)) note(messageFor(err));
  }
});

/* ---------------- Palavras-passe ---------------- */
$$(".pw-toggle").forEach((b) => b.addEventListener("click", () => {
  const input = b.previousElementSibling;
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  $(".ph", b).className = `ph ${show ? "ph-eye-slash" : "ph-eye"}`;
  b.setAttribute("aria-label", show ? "Esconder a palavra-passe" : "Mostrar a palavra-passe");
  b.setAttribute("aria-pressed", String(show));
  input.focus();
}));

// Tell people when Caps Lock is on, before they wonder why their password fails.
[["#password", "#passwordCaps"], ["#newPassword", "#newPasswordCaps"], ["#resetPassword", "#resetPasswordCaps"]].forEach(([field, hint]) => {
  const update = (e) => { if (e.getModifierState) $(hint).hidden = !e.getModifierState("CapsLock"); };
  $(field).addEventListener("keydown", update);
  $(field).addEventListener("keyup", update);
  $(field).addEventListener("blur", () => { $(hint).hidden = true; });
});

const RULES = {
  length: (p) => p.length >= 8,
  mix: (p) => /[\d\W_]/.test(p),
  email: (p) => !!p && p.toLowerCase() !== state.email.toLowerCase() && p.toLowerCase() !== state.email.split("@")[0].toLowerCase(),
};
function checkRules(listId, password) {
  let ok = true;
  $$(`#${listId} li`).forEach((li) => {
    const pass = RULES[li.dataset.rule](password);
    li.classList.toggle("ok", pass);
    ok = ok && pass;
  });
  return ok;
}

/* ---------------- 2a. Entrar ---------------- */
$("#password").addEventListener("input", () => setError("passwordErr", ""));
$("#passwordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = $("#password").value;
  if (!password) return fail("passwordErr", "Escreve a tua palavra-passe.");
  try {
    const ok = await attempt(e.submitter || $("#passwordForm button[type=submit]"), ({ auth, fb }) => fb.signInWithEmailAndPassword(auth, state.email, password));
    if (ok) finish();
  } catch (err) {
    fail("passwordErr", messageFor(err));
  }
});

/* ---------------- 2b. Criar conta ---------------- */
$("#newPassword").addEventListener("input", (e) => { checkRules("rules", e.target.value); setError("newPasswordErr", ""); });
$("#name").addEventListener("input", () => setError("nameErr", ""));
$("#detailsForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("#name").value.trim();
  const password = $("#newPassword").value;
  if (!name) return fail("nameErr", "Diz-nos como te chamas.");
  if (!checkRules("rules", password)) return fail("newPasswordErr", "A palavra-passe tem de cumprir tudo o que está na lista acima.");
  try {
    const ok = await attempt(e.submitter || $("#detailsForm button[type=submit]"), async ({ auth, fb }) => {
      const { user } = await fb.createUserWithEmailAndPassword(auth, state.email, password);
      await fb.updateProfile(user, { displayName: name });
      remember(user);
      await shortly(saveProfile(user));
      // The account works straight away; the email only confirms the address is theirs.
      await withReturn((settings) => fb.sendEmailVerification(user, settings), "?confirmado=1").catch(() => {});
    });
    if (ok) checkEmail(`A tua conta está criada. Enviámos uma ligação para ${state.email} para confirmares que o email é teu.`, { home: true });
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      $("#password").value = "";
      setMode("login", "password");
      return note(messageFor(err));
    }
    fail("newPasswordErr", messageFor(err));
  }
});

$("#resendBtn").addEventListener("click", async (e) => {
  const button = e.currentTarget;
  setError("resendErr", "");
  try {
    const ok = await attempt(button, ({ auth, fb }) => {
      if (!auth.currentUser) throw Object.assign(new Error("signed out"), { code: "auth/no-current-user" });
      return withReturn((settings) => fb.sendEmailVerification(auth.currentUser, settings), "?confirmado=1");
    });
    if (!ok) return;
    button.textContent = "Enviado. Vê a tua caixa de entrada";
    button.disabled = true;
    setTimeout(() => { button.textContent = "Enviar o email outra vez"; button.disabled = false; }, 30000);
  } catch (err) {
    setError("resendErr", messageFor(err));
  }
});

/* ---------------- 3. Palavra-passe esquecida ---------------- */
$("#resetEmail").addEventListener("input", () => setError("resetErr", ""));
$("#resetForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("#resetEmail").value.trim();
  if (!EMAIL.test(email)) return fail("resetErr", "Escreve o email com que criaste a conta.");
  state.email = email;
  try {
    const ok = await attempt(e.submitter || $("#resetForm button[type=submit]"), ({ auth, fb }) =>
      withReturn((settings) => fb.sendPasswordResetEmail(auth, email, settings), "").catch((err) => {
        if (err.code !== "auth/user-not-found") throw err; // say the same either way, so no one can test which emails have accounts
      }));
    if (ok) checkEmail(`Se houver uma conta com ${email}, enviámos-lhe uma ligação para escolheres uma nova palavra-passe. Só funciona uma vez, e durante pouco tempo.`);
  } catch (err) {
    fail("resetErr", messageFor(err));
  }
});

/* ---------------- 4. Nova palavra-passe, a partir do email ---------------- */
$("#resetPassword").addEventListener("input", (e) => { checkRules("resetRules", e.target.value); setError("resetPasswordErr", ""); });
$("#newPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = $("#resetPassword").value;
  if (!checkRules("resetRules", password)) return fail("resetPasswordErr", "A palavra-passe tem de cumprir tudo o que está na lista acima.");
  try {
    const ok = await attempt(e.submitter || $("#newPasswordForm button[type=submit]"), async ({ auth, fb }) => {
      await fb.confirmPasswordReset(auth, state.resetCode, password);
      await fb.signInWithEmailAndPassword(auth, state.email, password);
    });
    if (ok) finish();
  } catch (err) {
    if (/action-code/.test(err.code || "")) { note(messageFor(err)); return go("reset"); }
    fail("resetPasswordErr", messageFor(err));
  }
});

/* ---------------- Já com sessão iniciada: a conta ---------------- */
const DAY = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric" });
const HOUR = new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" });
function when(value, { withTime = false } = {}) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem registo";
  if (withTime && date.toDateString() === new Date().toDateString()) return `Hoje, às ${HOUR.format(date)}`;
  return DAY.format(date);
}
// "Daniel Tomatas" becomes DT; an email with no name uses its first letter.
function initials(user) {
  const words = (user.displayName || (user.email || "?").split("@")[0]).split(/[\s._-]+/).filter(Boolean);
  return ((words[0]?.[0] || "?") + (words.length > 1 ? words.at(-1)[0] : "")).toUpperCase();
}
// A small icon and a word, for the list of facts.
function fact(icon, text, cls = "") {
  const span = document.createElement("span");
  if (cls) span.className = cls;
  span.innerHTML = `<i class="ph ${icon}" aria-hidden="true"></i>`;
  span.append(text);
  return span;
}

function showAccount(user) {
  state.email = user.email || "";
  const viaGoogle = user.providerData.some((p) => p.providerId === "google.com");
  const withPassword = user.providerData.some((p) => p.providerId === "password");
  $("[data-initials]").textContent = initials(user);
  $("[data-name]").textContent = user.displayName || "Sem nome";
  $("[data-account-email]").textContent = user.email || "";
  $("[data-provider]").replaceChildren(viaGoogle ? fact("ph-google-logo", withPassword ? "Google, e email e palavra-passe" : "Google") : fact("ph-envelope-simple", "Email e palavra-passe"));
  const verified = $("[data-verified]");
  if (user.emailVerified) {
    verified.replaceChildren(fact("ph-check-circle", "Confirmado", "state-ok"));
  } else {
    const resend = Object.assign(document.createElement("button"), { type: "button", className: "link small", id: "verifyResend", textContent: "Reenviar a confirmação" });
    verified.replaceChildren(fact("ph-warning-circle", "Por confirmar", "state-warn"), resend);
  }
  $("[data-created]").textContent = when(user.metadata.creationTime);
  $("[data-last]").textContent = when(user.metadata.lastSignInTime, { withTime: true });
  $("#changePasswordBtn").hidden = !withPassword;
  showPlan(user);
  showSaved(user);
  $("#deleteConfirm").hidden = true;
  $("#deleteStart").hidden = false;
  setError("accountErr", "");
  go("signed-in", { focus: false });
}

// The reviews this account has saved, newest first, to open again or delete.
const firestore = () => import("/vendor/firebase/firebase-firestore-lite.js");
async function showSaved(user) {
  const section = $(".saved");
  const list = $("[data-saved]");
  try {
    const { getFirestore, collection, query, orderBy, limit, getDocs } = await firestore();
    const snap = await getDocs(query(collection(getFirestore(user.auth?.app || (await firebase).auth.app), "users", user.uid, "reviews"), orderBy("createdAt", "desc"), limit(20)));
    list.replaceChildren(...snap.docs.map((d) => {
      const r = d.data();
      const li = document.createElement("li");
      const link = Object.assign(document.createElement("a"), { href: `/?revisao=${encodeURIComponent(d.id)}` });
      const title = Object.assign(document.createElement("b"), { textContent: r.verdict || r.cvName });
      const meta = Object.assign(document.createElement("span"), { textContent: `${r.cvName} · ${r.createdAt?.toDate ? DAY.format(r.createdAt.toDate()) : ""} · ${r.score} em 100` });
      link.append(title, meta);
      const del = Object.assign(document.createElement("button"), { type: "button", className: "saved-del", title: "Apagar esta revisão" });
      del.dataset.id = d.id;
      del.setAttribute("aria-label", `Apagar a revisão ${r.cvName}`);
      del.innerHTML = `<i class="ph ph-x" aria-hidden="true"></i>`;
      li.append(link, del);
      return li;
    }));
    section.hidden = snap.empty;
  } catch (err) {
    console.warn("[revisões]", err.code || err.message);
    section.hidden = true;
  }
}

$("[data-saved]").addEventListener("click", async (e) => {
  const button = e.target.closest(".saved-del");
  if (!button) return;
  const { auth } = await firebase;
  try {
    const { getFirestore, doc, deleteDoc } = await firestore();
    await deleteDoc(doc(getFirestore(auth.app), "users", auth.currentUser.uid, "reviews", button.dataset.id));
    button.closest("li").remove();
    if (!$("[data-saved] li")) $(".saved").hidden = true;
  } catch (err) {
    setError("accountErr", messageFor(err));
  }
});

// The plan comes from the server, which asks Stripe; it fills in when it arrives.
async function showPlan(user) {
  const dd = $("[data-plan]");
  const button = $("#planBtn");
  dd.textContent = "…";
  button.hidden = true;
  try {
    const res = await fetch("/api/billing?action=status", { headers: { Authorization: `Bearer ${await user.getIdToken()}` } });
    const s = await res.json();
    const renews = s.renews ? new Date(s.renews * 1000) : null;
    dd.replaceChildren(s.plan === "pro"
      ? fact("ph-check-circle", renews ? `Pro, ${s.cancelling ? "termina" : "renova"} a ${DAY.format(renews)}` : "Pro", "state-ok")
      : fact("ph-user", "Grátis"));
    if (!s.payments || s.manual) return;
    button.textContent = s.plan === "pro" ? "Gerir a subscrição" : `Passar a Pro, ${s.price}`;
    button.dataset.action = s.plan === "pro" ? "portal" : "checkout";
    button.hidden = false;
  } catch {
    dd.textContent = "Grátis";
  }
}

$("#planBtn").addEventListener("click", async (e) => {
  const button = e.currentTarget;
  setError("accountErr", "");
  try {
    const { auth } = await firebase;
    await busy(button, async () => {
      const res = await fetch(`/api/billing?action=${button.dataset.action}`, { method: "POST", headers: { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      location.href = data.url;
    });
  } catch (err) {
    setError("accountErr", err.message || "Algo correu mal. Tenta de novo.");
  }
});

// Changing the password goes through the same email link as a forgotten one, so nothing new to trust.
$("#changePasswordBtn").addEventListener("click", async (e) => {
  setError("accountErr", "");
  try {
    const ok = await attempt(e.currentTarget, ({ auth, fb }) =>
      withReturn((settings) => fb.sendPasswordResetEmail(auth, state.email, settings), ""));
    if (ok) note(`Enviámos um email para ${state.email} com uma ligação para escolheres a nova palavra-passe.`, true);
  } catch (err) {
    setError("accountErr", messageFor(err));
  }
});

$("[data-verified]").addEventListener("click", async (e) => {
  const button = e.target.closest("#verifyResend");
  if (!button) return;
  setError("accountErr", "");
  const fbase = await firebase;
  if (!fbase) return closed("offline");
  try {
    await withReturn((settings) => fbase.fb.sendEmailVerification(fbase.auth.currentUser, settings), "?confirmado=1");
    button.replaceWith("Ligação enviada, vê o teu email");
  } catch (err) {
    setError("accountErr", messageFor(err));
  }
});

$("#logoutBtn").addEventListener("click", async (e) => {
  const fbase = await firebase;
  await busy(e.currentTarget, () => fbase?.fb.signOut(fbase.auth)).catch(() => {});
  remember(null);
  note("Terminaste a sessão.", true);
  go("start");
});

// Deleting asks once more, inline, then removes the profile and the account.
$("#deleteStart").addEventListener("click", () => {
  $("#deleteStart").hidden = true;
  $("#deleteConfirm").hidden = false;
  $("#deleteBtn").focus();
});
$("#deleteCancel").addEventListener("click", () => {
  $("#deleteConfirm").hidden = true;
  $("#deleteStart").hidden = false;
  $("#deleteStart").focus();
});
$("#deleteBtn").addEventListener("click", async (e) => {
  setError("accountErr", "");
  try {
    const ok = await attempt(e.currentTarget, async ({ auth, fb }) => {
      const user = auth.currentUser;
      if (!user) throw Object.assign(new Error("signed out"), { code: "auth/no-current-user" });
      // The profile goes first, while this account still has the right to remove it.
      try {
        const { getFirestore, doc, deleteDoc } = await import("/vendor/firebase/firebase-firestore-lite.js");
        const { collection, getDocs } = await import("/vendor/firebase/firebase-firestore-lite.js");
        const reviews = await getDocs(collection(getFirestore(auth.app), "users", user.uid, "reviews"));
        await Promise.all(reviews.docs.map((r) => deleteDoc(r.ref)));
        await deleteDoc(doc(getFirestore(auth.app), "users", user.uid));
      } catch (err) {
        console.warn("[perfil]", err.code || err.message);
      }
      try {
        await fb.deleteUser(user);
      } catch (err) {
        // Google asks for a fresh sign-in before deleting an account; with Google that's one more click.
        if (err.code !== "auth/requires-recent-login" || !user.providerData.some((p) => p.providerId === "google.com")) throw err;
        await fb.reauthenticateWithPopup(user, new fb.GoogleAuthProvider());
        await fb.deleteUser(user);
      }
    });
    if (!ok) return;
    remember(null);
    note("A tua conta foi apagada.", true);
    go("start");
  } catch (err) {
    if (!QUIET.has(err.code)) setError("accountErr", err.code === "auth/requires-recent-login" ? "Por segurança, sai, entra outra vez e depois apaga a conta." : messageFor(err));
  }
});

/* ---------------- Início ---------------- */
async function start() {
  render();
  go("start", { focus: false });
  // the entrance plays once; after that the steps use their own slide
  setTimeout(() => document.documentElement.classList.remove("entering"), reduceMotion ? 0 : 1900);

  const fbase = await firebase;
  if (!fbase) return; // the first thing they try will explain
  const { auth, fb } = fbase;

  // Links from our emails, once the Firebase project sends them to this page (see CONTAS-FIREBASE.md).
  const mode = params.get("mode");
  const code = params.get("oobCode");
  if (code) {
    history.replaceState(null, "", "/entrar"); // the code works once; keep it out of the address bar
    try {
      if (mode === "resetPassword") {
        state.email = await fb.verifyPasswordResetCode(auth, code);
        state.resetCode = code;
        return go("new-password");
      }
      if (mode === "verifyEmail") {
        await fb.applyActionCode(auth, code);
        await auth.currentUser?.reload();
        note("O teu email está confirmado.", true);
      }
      if (mode === "recoverEmail") {
        const { data } = await fb.checkActionCode(auth, code);
        await fb.applyActionCode(auth, code);
        note(`O email da tua conta voltou a ser ${data.email}. Se não foste tu a mudá-lo, muda também a palavra-passe.`, true);
      }
    } catch (err) {
      note(messageFor(err));
      if (mode === "resetPassword") return go("reset");
    }
  }
  if (params.has("confirmado")) note("O teu email está confirmado.", true);

  // Already signed in on this browser?
  await auth.authStateReady();
  const user = auth.currentUser;
  remember(user);
  if (!user) return;
  // A confirmation clicked in another tab only shows up after asking Google again.
  if (!user.emailVerified) await user.reload().catch(() => {});
  showAccount(user);
}
start();
