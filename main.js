// ─── THEME TOGGLE ───
(function(){
  const toggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const stored = localStorage.getItem('n8nano-theme');
  if (stored) {
    html.setAttribute('data-theme', stored);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.setAttribute('data-theme', 'dark');
  }
  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('n8nano-theme', next);
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('n8nano-theme')) {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
})();

// ─── NAV SCROLL ───
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ─── REVEAL ON SCROLL ───
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ─── COUNTER ANIMATION ───
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = Math.max(1, Math.floor(target / 40));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = current + (suffix ? ' ' + suffix : '+');
      }, 30);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

// ─── SMOOTH SCROLL ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ─── SHOWCASE CAROUSEL ───
(function(){
  const slides = document.querySelectorAll('.showcase-slide');
  const titleEl = document.getElementById('showcaseTitle');
  const descEl = document.getElementById('showcaseDesc');
  const tagsEl = document.getElementById('showcaseTags');
  const dotsEl = document.getElementById('showcaseDots');
  const prevBtn = document.getElementById('showcasePrev');
  const nextBtn = document.getElementById('showcaseNext');
  if(!slides.length) return;

  let current = 0;
  const total = slides.length;

  function goTo(idx){
    slides[current].classList.remove('active');
    dotsEl.children[current].classList.remove('active');
    current = (idx + total) % total;
    slides[current].classList.add('active');
    dotsEl.children[current].classList.add('active');
    titleEl.textContent = slides[current].dataset.title;
    descEl.textContent = slides[current].dataset.desc;
    const tags = slides[current].dataset.tags.split(',');
    const colors = slides[current].dataset.tagColors.split(',');
    tagsEl.innerHTML = tags.map((t,i) => '<span class="'+colors[i]+'">'+t+'</span>').join('');
  }

  // build dots
  dotsEl.innerHTML = '';
  for(let i = 0; i < total; i++){
    const d = document.createElement('span');
    if(i === 0) d.classList.add('active');
    d.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(d);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // auto-play if more than 1 slide
  if(total > 1){
    setInterval(() => goTo(current + 1), 5000);
  }
})();

// ─── BANNER PARTICLES + RIPPLE ───
(function(){
  const container = document.getElementById('bannerParticles');
  const banner = document.getElementById('examplesBanner');
  const ripple = document.getElementById('bannerRipple');
  if(!container || !banner) return;

  const colors = ['#3ECFA5','#00B4D8','#7B5EA7','#E2725B','#3ECFA5','#00B4D8'];

  // create floating particles
  for(let i = 0; i < 20; i++){
    const p = document.createElement('div');
    p.className = 'banner-particle';
    p.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      width:${Math.random()*4+2}px;
      height:${Math.random()*4+2}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${Math.random()*3+2}s;
      animation-delay:${Math.random()*3}s;
      box-shadow:0 0 ${Math.random()*6+2}px currentColor;
    `;
    container.appendChild(p);
  }

  // create spark lines
  for(let i = 0; i < 8; i++){
    const s = document.createElement('div');
    s.className = 'banner-spark';
    s.style.cssText = `
      left:${Math.random()*100}%;
      bottom:0;
      height:${Math.random()*20+10}px;
      background:linear-gradient(to top,transparent,${colors[Math.floor(Math.random()*colors.length)]});
      animation-duration:${Math.random()*2+1.5}s;
      animation-delay:${Math.random()*2}s;
    `;
    container.appendChild(s);
  }

  // ripple follows mouse on banner
  banner.addEventListener('mousemove', e => {
    const rect = banner.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
  });
})();

// ─── CHATBOT ───
(function(){
  const fab = document.getElementById('chatFab');
  const win = document.getElementById('chatWindow');
  const msgs = document.getElementById('chatMessages');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');

  // *** CAMBIA ESTA URL POR TU WEBHOOK DE N8N ***
  const WEBHOOK_URL = 'https://86c6-2803-2a00-2003-6003-2ecf-67ff-fe59-9757.ngrok-free.app/webhook/chatbot';

  let isOpen = false;

  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    fab.classList.toggle('open', isOpen);
    win.classList.toggle('open', isOpen);
    if(isOpen) input.focus();
  });

  function addMsg(text, type){
    const div = document.createElement('div');
    div.className = 'chat-msg ' + type;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping(){
    const div = document.createElement('div');
    div.className = 'chat-typing';
    div.id = 'chatTyping';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping(){
    const el = document.getElementById('chatTyping');
    if(el) el.remove();
  }

  async function sendMessage(){
    const text = input.value.trim();
    if(!text) return;

    addMsg(text, 'user');
    input.value = '';
    sendBtn.disabled = true;
    showTyping();

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      hideTyping();
      addMsg(data.reply || data.response || data.output || 'Lo siento, no pude procesar tu mensaje.', 'bot');
    } catch(err) {
      hideTyping();
      addMsg('No pude conectarme al servidor. Escribinos por WhatsApp: +595 972 117 118', 'bot');
    }
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if(e.key === 'Enter') sendMessage();
  });
})();
