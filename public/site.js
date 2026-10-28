// Behaviour shared by every page: the navigation bar, the full-screen menu,
// and the sample CV that gets marked up as you scroll on "Como funciona".
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Smooth scrolling ----------------
   The mouse wheel glides instead of stepping. Touch, the keyboard and reduced motion keep the browser's own scrolling. */
const lenis = !reduceMotion && window.Lenis
  ? new window.Lenis({ autoRaf: true, lerp: 0.1, allowNestedScroll: true, stopInertiaOnNavigate: true })
  : null;

// A click on a link to a part of this page glides there, and the address still changes.
// Keyboard activation keeps the browser's own jump, which also moves where Tab carries on from.
document.addEventListener("click", (e) => {
  const a = lenis && e.detail > 0 && !e.defaultPrevented && e.target.closest("a[href*='#']");
  if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const url = new URL(a.href);
  const target = url.origin === location.origin && url.pathname === location.pathname && document.getElementById(decodeURIComponent(url.hash.slice(1)));
  if (!target) return;
  e.preventDefault();
  if (location.hash !== url.hash) history.pushState(null, "", url.hash);
  lenis.scrollTo(target, { duration: 1.4 });
});

/* ---------------- Navigation bar ---------------- */
const nav = $(".nav");
// Signed in on this browser? The login page leaves your first name here, and the bar greets you with it.
try {
  const who = localStorage.getItem("cvviews:conta");
  const login = $(".nav-login");
  if (who && login) { login.textContent = who; login.title = "A tua conta"; }
  // the phone menu and the footer say it too
  if (who) {
    $$('.menu-card[href="/entrar"]').forEach((card) => card.replaceChildren(
      Object.assign(document.createElement("span"), { textContent: "A minha conta" }),
      Object.assign(document.createElement("small"), { textContent: `Olá, ${who}. O teu plano e as revisões` }),
    ));
    $$('.footer a[href="/entrar"]').forEach((a) => { a.textContent = "A minha conta"; });
  }
} catch { /* storage blocked: the bar just says Entrar */ }
const sentinel = document.createElement("div");
sentinel.style.cssText = "position:absolute;top:0;left:0;height:8px;width:1px;pointer-events:none";
document.body.prepend(sentinel);
new IntersectionObserver(([en]) => nav.classList.toggle("scrolled", !en.isIntersecting)).observe(sentinel);

// On the home page, the bar shows which section you're reading.
const sectionLinks = $$(".nav-links a, .menu-links a").filter((a) => {
  const url = new URL(a.href);
  return url.pathname === location.pathname && url.hash && document.getElementById(url.hash.slice(1));
});
if (sectionLinks.length) {
  const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    sectionLinks.forEach((a) => {
      if (new URL(a.href).hash === `#${en.target.id}`) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }), { rootMargin: "-45% 0px -50% 0px" });
  new Set(sectionLinks.map((a) => new URL(a.href).hash.slice(1))).forEach((id) => spy.observe(document.getElementById(id)));
  // Back at the composer, no section is current.
  new IntersectionObserver(([en]) => { if (en.isIntersecting) sectionLinks.forEach((a) => a.removeAttribute("aria-current")); }, { rootMargin: "-45% 0px -50% 0px" })
    .observe($("#app") || document.body);
}

/* ---------------- Full-screen menu ----------------
   While it's open, the page behind can't be scrolled or tabbed into. */
const menuBtn = $("#menuBtn");
const menu = $("#menu");
const isMenuOpen = () => menu.classList.contains("is-open");
function setMenu(open) {
  if (open === isMenuOpen()) return;
  menuBtn.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("menu-open", open);
  document.documentElement.classList.toggle("menu-lock", open);
  if (open) lenis?.stop(); else lenis?.start();
  $$("main, .footer").forEach((el) => { el.inert = open; });
  if (open) {
    const img = $(".menu-window img");
    if (img && !img.getAttribute("src")) img.src = img.dataset.src; // the photo loads the first time the menu opens
    menu.classList.add("is-open");
    setTimeout(() => { if (isMenuOpen()) $(".menu-links a")?.focus({ preventScroll: true }); }, reduceMotion ? 0 : 500);
  } else {
    menu.classList.remove("is-open");
    if (menu.contains(document.activeElement)) menuBtn.focus({ preventScroll: true });
  }
}
menuBtn?.addEventListener("click", () => setMenu(!isMenuOpen()));
menu?.addEventListener("click", (e) => { if (e.target.closest("a, button")) setMenu(false); });
addEventListener("keydown", (e) => { if (e.key === "Escape" && isMenuOpen()) setMenu(false); });
matchMedia("(min-width: 901px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });
// Coming back with the browser's back button shouldn't find the menu still open.
addEventListener("pageshow", () => setMenu(false));

/* ---------------- Scroll reveals ----------------
   As each part comes into view, headings rise word by word and blocks fade up. It happens once,
   and without JavaScript (or with reduced motion) everything is simply there. */
if (!reduceMotion && "IntersectionObserver" in window) {
  // Wrap every word of a heading (every letter, for the footer's giant name) so each can rise out of its own line.
  $$('[data-reveal="words"], [data-reveal="letters"]').forEach((heading) => {
    const pieces = heading.dataset.reveal === "letters" ? /(\s+|.)/u : /(\s+)/;
    let n = 0;
    const wrap = (node) => [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) { if (!child.matches(".sr-only")) wrap(child); return; }
      if (child.nodeType !== Node.TEXT_NODE) return;
      const frag = document.createDocumentFragment();
      child.textContent.split(pieces).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(part); return; }
        const word = document.createElement("span");
        const inner = document.createElement("span");
        word.className = "w";
        inner.textContent = part;
        inner.style.setProperty("--w", n++);
        word.append(inner);
        frag.append(word);
      });
      child.replaceWith(frag);
    });
    wrap(heading);
  });
  // A list comes in one item after another.
  $$('[data-reveal="list"]').forEach((list) => [...list.children].forEach((item, n) => item.style.setProperty("--n", n)));

  document.documentElement.classList.add("can-reveal");
  const revealIo = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    revealIo.unobserve(en.target);
  }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach((el) => revealIo.observe(el));
}

/* ---------------- Footer: the visitor's country, the time and the weather there ----------------
   Our own /api/tempo says roughly where the visit comes from and what the weather is like. Until it answers
   (and if it can't), the footer uses the browser's own time zone and leaves the weather out. */
const now = $(".foot-now");
if (now) {
  const clock = $("[data-clock]", now);
  const placeEl = $("[data-place]", now);
  const lang = document.documentElement.lang.startsWith("en") ? "en" : "pt-PT";
  let zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fmt = () => { try { return new Intl.DateTimeFormat(lang, { timeZone: zone, hour: "2-digit", minute: "2-digit" }); } catch { return new Intl.DateTimeFormat(lang, { hour: "2-digit", minute: "2-digit" }); } };
  let format = fmt();
  const tick = () => { const d = new Date(); clock.textContent = format.format(d); clock.dateTime = d.toISOString(); };
  const countryName = (code) => { try { return new Intl.DisplayNames([lang], { type: "region" }).of(code); } catch { return code; } };

  // asked once the page has settled, so it never competes with what the visitor came for
  const load = async () => {
    try {
      const [w, { WEATHER_ICONS }] = await Promise.all([
        fetch("/api/tempo").then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))),
        import("/weather-icons.js"),
      ]);
      if (w.country) { placeEl.textContent = countryName(w.country); try { localStorage.setItem("cvviews:country", w.country); } catch { /* fine */ } }
      if (w.timezone) { zone = w.timezone; format = fmt(); tick(); }
      if (typeof w.temp !== "number") return;
      const [icon, words] = weatherLook(w.code, w.day);
      const el = $("[data-weather]", now);
      el.innerHTML = `${w.temp}°C<span class="sr-only">, ${words}</span><svg viewBox="0 0 256 256" aria-hidden="true"><path d="${WEATHER_ICONS[icon]}"/></svg>`;
      el.title = `${lang === "en" ? "Now in" : "Agora em"} ${w.city || countryName(w.country)}: ${words}, ${w.temp}°C`;
      el.hidden = false;
    } catch { /* no weather today: the time is enough */ }
  };

  // a first guess while it waits: the country from last time, or the browser's region
  let region = "";
  try { region = localStorage.getItem("cvviews:country") || ""; } catch { /* no storage */ }
  region ||= (navigator.language.split("-")[1] || "").toUpperCase();
  placeEl.textContent = /^[A-Z]{2}$/.test(region) ? countryName(region) : "";
  tick();
  setInterval(tick, 15000);
  now.hidden = false;
  if ("requestIdleCallback" in window) requestIdleCallback(load, { timeout: 3000 });
  else setTimeout(load, 1500);
}

// Open-Meteo's weather codes (WMO), as an icon and a few words.
function weatherLook(code, day) {
  const en = document.documentElement.lang.startsWith("en");
  const say = (pt, eng) => (en ? eng : pt);
  if (code === 0) return [day ? "sun" : "moon", say("céu limpo", "clear sky")];
  if (code <= 2) return [day ? "cloud-sun" : "cloud-moon", say("pouco nublado", "partly cloudy")];
  if (code === 3) return ["cloud", say("nublado", "cloudy")];
  if (code === 45 || code === 48) return ["cloud-fog", say("nevoeiro", "fog")];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ["cloud-snow", say("neve", "snow")];
  if (code >= 95) return ["cloud-lightning", say("trovoada", "thunderstorm")];
  return ["cloud-rain", say("chuva", "rain")];
}

/* ---------------- Cookies ----------------
   On the first visit a small notice asks. Only "Aceitar" turns on Google Analytics (visits, pages,
   device); "Só os necessários" turns on nothing. The choice is kept in this browser, and the
   cookie policy page has a button to change it. */
const CONSENT_KEY = "cvviews:cookies";
const MEASUREMENT_ID = "G-3ST1D0TNNG";
const getConsent = () => { try { return localStorage.getItem(CONSENT_KEY); } catch { return null; } };

function startAnalytics() {
  if (window.gtag) return;
  window[`ga-disable-${MEASUREMENT_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.append(s);
}

function stopAnalytics() {
  window[`ga-disable-${MEASUREMENT_ID}`] = true;
  // Google's cookies live on this site's domain and its parent; clear both.
  const host = location.hostname.split(".").slice(-2).join(".");
  document.cookie.split(";").map((c) => c.trim().split("=")[0]).filter((n) => /^_ga/.test(n)).forEach((name) => {
    for (const domain of ["", `; domain=.${host}`]) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
  });
}

function cookieNotice() {
  if ($(".cookie-bar")) return;
  const bar = document.createElement("div");
  bar.className = "cookie-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Cookies");
  bar.innerHTML = `<div class="cookie-head"><p class="cookie-title">Só contamos visitas</p><a href="/cookies">Saber mais</a></div>
    <p class="cookie-text">Com a tua autorização, contamos as visitas para perceber que páginas ajudam. Nada de anúncios.</p>
    <div class="cookie-actions">
      <button type="button" class="cookie-no" data-consent="essential">Recusar</button>
      <button type="button" class="cookie-yes" data-consent="all">Aceitar</button>
    </div>`;
  bar.addEventListener("click", (e) => {
    const choice = e.target.closest("[data-consent]")?.dataset.consent;
    if (!choice) return;
    try { localStorage.setItem(CONSENT_KEY, choice); } catch { /* no storage: ask again next time */ }
    if (choice === "all") startAnalytics(); else stopAnalytics();
    // The card slips away once a choice is made.
    bar.classList.add("is-gone");
    setTimeout(() => bar.remove(), reduceMotion ? 0 : 500);
  });
  document.body.append(bar);
}

if (getConsent() === "all") startAnalytics();
else if (!getConsent()) cookieNotice();
document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-cookie-settings]")) return;
  try { localStorage.removeItem(CONSENT_KEY); } catch { /* nothing to forget */ }
  cookieNotice();
});

