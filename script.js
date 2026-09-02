// ── PRELOADER ──────────────────────────────────────────────────────────────
const preloader = document.getElementById('preloader');
const prePoster = document.getElementById('prePoster');
const video     = document.getElementById('preVideo-el');

// Music initialization
const songPath = 'assets/Ed Sheeran - Photograph.mp3';
const audio = new Audio(songPath);
audio.currentTime = 53;
audio.loop = true;
let musicStarted = false;

function dismissPreloader() {
  preloader.classList.add('done');
  document.querySelectorAll('.reveal').forEach(el => {
    const d = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('in'), d);
  });
  document.querySelectorAll('.reveal-photo').forEach(el => el.classList.add('in'));
}

// Preload video silently in background
video.load();

// Click poster → hide it, show & play video
prePoster.addEventListener('click', () => {
  prePoster.classList.add('hidden');
  video.classList.add('active');
  video.muted = true;
  video.play().catch(() => {});
  
  // Start background music
  if (!musicStarted) {
    audio.currentTime = 53;
    audio.play().catch(err => console.log("Audio play failed:", err));
    document.getElementById('music').classList.add('playing');
    musicStarted = true;
  }
});

// Video ends → dismiss
video.addEventListener('ended', dismissPreloader);
video.addEventListener('error', () => setTimeout(dismissPreloader, 500));





// Split text into chars with stagger
document.querySelectorAll('.title .word').forEach((word, wi) => {
  const text = word.dataset.text || '';
  word.innerHTML = '';
  [...text].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = c;
    s.style.animationDelay = (1.6 + wi * 0.4 + i * 0.06) + 's';
    word.appendChild(s);
  });
});




// IntersectionObserver for in-view animations
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.in-view, .g-item, .count-cell, .std-poster').forEach(el => io.observe(el));

// Countdown
const TARGET = new Date('2026-09-11T20:00:00').getTime();
const cells = [
  { l: 'days' }, { l: 'hours' }, { l: 'minutes' }, { l: 'seconds' }
];
const grid = document.getElementById('countGrid');
cells.forEach((c, i) => {
  const el = document.createElement('div');
  el.className = 'count-cell in-view';
  el.style.transitionDelay = (0.2 + i * 0.08) + 's';
  el.innerHTML = `<div class="num" data-k="${c.l}">00</div><div class="lbl">${c.l}</div>`;
  grid.appendChild(el);
  io.observe(el);
});
function tick() {
  const t = TARGET - Date.now();
  const d = Math.max(0, Math.floor(t / 86400000));
  const h = Math.max(0, Math.floor((t / 3600000) % 24));
  const m = Math.max(0, Math.floor((t / 60000) % 60));
  const s = Math.max(0, Math.floor((t / 1000) % 60));
  const map = { days: d, hours: h, minutes: m, seconds: s };
  document.querySelectorAll('[data-k]').forEach(el => {
    el.textContent = String(map[el.dataset.k]).padStart(2, '0');
  });
}
tick(); setInterval(tick, 1000);

// Venue parallax
const venueBg = document.querySelector('[data-parallax]');
if (venueBg) {
  window.addEventListener('scroll', () => {
    const r = venueBg.parentElement.getBoundingClientRect();
    const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
    venueBg.style.transform = `translateY(${p * -40}px)`;
  }, { passive: true });
}

// Music toggle (no audio file bundled — toggles visual state; wire up your own <audio>)
// Music toggle
const musicBtn = document.getElementById('music');
musicBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    musicBtn.classList.add('playing');
  } else {
    audio.pause();
    musicBtn.classList.remove('playing');
  }
});
