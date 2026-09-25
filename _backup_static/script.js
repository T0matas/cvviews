const responses = [
  "Great question! Based on the analysis of thousands of CVs, I can tell you that tailoring your resume for each position can increase your chances by up to 60%. Want me to help with that? 🎯",
  "Of course! One important tip: use action verbs at the start of each bullet point. For example: 'Led', 'Developed', 'Increased'. This makes your CV much more impactful! ✨",
  "Great! To stand out on LinkedIn, make sure your professional headline goes beyond just your job title. Include specialties and keywords from your field. 💡",
  "Got it! A cover letter should have no more than 3 paragraphs: introduction + value you offer + call to action. I can write one for you! 📝",
  "Analyzing your profile... Our AI suggests adding more quantifiable metrics to your professional achievements. For example, instead of 'Increased sales', write 'Increased sales by 35% in 6 months'. 📊",
  "Perfect! For international applications, remember to adapt the format to the country. CVs in the UK should not include a photo, while in some countries it's common to include one. 🌍"
];

let msgCount = 0;

function addMessage(text, isUser) {
  const messages = document.getElementById('chatMessages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = 'msg ' + (isUser ? 'user' : 'ai');
  div.innerHTML = '<div class="msg-avatar">' + (isUser ? '👤' : '🤖') + '</div><div class="msg-bubble">' + text + '</div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const messages = document.getElementById('chatMessages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = 'msg ai';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="msg-avatar">🤖</div><div class="msg-bubble"><div class="typing"><span></span><span></span><span></span></div></div>';
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
    const reply = responses[msgCount % responses.length];
    msgCount++;
    addMessage(reply, false);
  }, 1200 + Math.random() * 800);
}

document.addEventListener('DOMContentLoaded', () => {
  // Navigation / Action Buttons
  const btnAnalyze = document.getElementById('btnAnalyze');
  if (btnAnalyze) {
    btnAnalyze.addEventListener('click', () => {
      document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const btnFeatures = document.getElementById('btnFeatures');
  if (btnFeatures) {
    btnFeatures.addEventListener('click', () => {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Chat Input
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });
  }

  // Send Button
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  // Quick Suggestion Chips
  document.querySelectorAll('.suggestion-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chatInput) {
        chatInput.value = chip.textContent.trim();
        sendMessage();
      }
    });
  });

  // Scroll Animations for Feature Cards
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity .5s ease, transform .5s ease, border-color .25s, box-shadow .25s';
    observer.observe(card);
  });
});
