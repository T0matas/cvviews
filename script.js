/* ============================================================
   CVViews – Script (B&W Premium)
   ============================================================ */

const responses = [
  "Tailoring your resume for each position can increase callback chances by up to 60%. Want me to generate a tailored version for a specific job description? 🎯",
  "A powerful tip: start every bullet point with a strong action verb. Instead of 'Responsible for sales', write 'Grew Q3 revenue by 35% through targeted pipeline optimization'.",
  "For LinkedIn, your headline should go beyond your title. Include specialties and keywords: e.g. 'Senior Engineer | React & Node.js | Scaling distributed systems'.",
  "A strong cover letter has three parts: a compelling hook, a concise value proposition, and a clear call to action. Want me to draft one for you?",
  "I recommend adding quantified impact metrics throughout. Instead of 'Improved processes', write 'Reduced deployment time by 42% by implementing CI/CD pipelines'.",
  "For international applications, adapt your format to local norms. UK CVs typically omit photos; German CVs include them. European roles often prefer the Europass format."
];

let msgCount = 0;

function createAvatar(isAI) {
  const div = document.createElement('div');
  div.className = 'msg-avatar';
  div.textContent = isAI ? 'CV' : 'U';
  return div;
}

function addMessage(text, isUser) {
  const messages = document.getElementById('chatMessages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = 'msg ' + (isUser ? 'user' : 'ai');
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = text;
  div.appendChild(createAvatar(!isUser));
  div.appendChild(bubble);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const messages = document.getElementById('chatMessages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = 'msg ai';
  div.id = 'typingIndicator';
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  div.appendChild(createAvatar(true));
  div.appendChild(bubble);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, true);
  input.value = '';
  input.style.height = 'auto';
  showTyping();
  setTimeout(() => {
    removeTyping();
    addMessage(responses[msgCount % responses.length], false);
    msgCount++;
  }, 1200 + Math.random() * 700);
}

/* ── Draw SVG connector lines ───────────────────────────── */
function drawConnectors() {
  const svg = document.getElementById('heroConnectors');
  if (!svg) return;
  const hero = svg.closest('.hero');
  if (!hero) return;

  const cards = hero.querySelectorAll('.hero-float-card');
  const centerEl = hero.querySelector('.hero-logo-mark');
  if (!centerEl || cards.length === 0) return;

  // Clear previous
  svg.innerHTML = '';

  const heroRect  = hero.getBoundingClientRect();
  const centerRect = centerEl.getBoundingClientRect();

  const cx = centerRect.left - heroRect.left + centerRect.width / 2;
  const cy = centerRect.top  - heroRect.top  + centerRect.height / 2;

  cards.forEach(card => {
    const r = card.getBoundingClientRect();
    const px = r.left - heroRect.left + r.width / 2;
    const py = r.top  - heroRect.top  + r.height / 2;

    // Midpoint for curve
    const mx = (cx + px) / 2;
    const my = (cy + py) / 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${cx} ${cy} Q ${mx} ${my} ${px} ${py}`);
    path.setAttribute('stroke', 'rgba(0,0,0,0.1)');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-dasharray', '5 5');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);
  });
}

document.addEventListener('DOMContentLoaded', () => {

  // Nav scroll state
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Hero buttons
  document.getElementById('btnAnalyze')?.addEventListener('click', () => {
    document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('btnFeatures')?.addEventListener('click', () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Chat
  const chatInput = document.getElementById('chatInput');
  chatInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  chatInput?.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  });
  document.getElementById('sendBtn')?.addEventListener('click', sendMessage);

  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (chatInput) { chatInput.value = chip.textContent.trim(); sendMessage(); }
    });
  });

  // Connectors
  drawConnectors();
  window.addEventListener('resize', drawConnectors, { passive: true });

  // Scroll reveal
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // Feature cards stagger
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        cardObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.55s ${i * 0.08}s ease, transform 0.55s ${i * 0.08}s ease, box-shadow .3s, border-color .3s`;
    cardObs.observe(card);
  });

  // Stat counter animation
  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const numEl = e.target.querySelector('.stat-num');
      if (!numEl) return;
      const txt = numEl.textContent;
      const dur = 1400;
      const start = performance.now();
      let target, suffix, prefix = '';

      if (txt.includes('98'))  { target = 98;  suffix = '%'; }
      else if (txt.includes('50')) { target = 50;  suffix = 'k+'; }
      else if (txt.includes('3.2')){ target = 3.2; suffix = 'x'; }
      else { statsObs.unobserve(e.target); return; }

      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = target % 1 !== 0 ? (target * ease).toFixed(1) : Math.round(target * ease);
        numEl.innerHTML = val + '<span>' + suffix + '</span>';
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statsObs.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat').forEach(s => statsObs.observe(s));

});
