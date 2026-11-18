/* Usman Ali portfolio — interactions.
   Everything degrades gracefully: without JS the content is fully readable,
   and prefers-reduced-motion turns the animations off. */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- boot / preloader (home only, once per session) ---------- */
  const boot = document.getElementById('boot');
  if (boot) {
    const num = document.getElementById('boot-num');
    const fill = document.getElementById('boot-fill');
    const log = document.getElementById('boot-log');
    const steps = ['loading sensors…', 'syncing sentinel rules…', 'checking firewall policies…', 'all systems nominal ✓'];
    const start = performance.now();
    const dur = 1500;
    boot.style.animation = 'none';
    (function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const v = Math.round(100 * (1 - Math.pow(1 - t, 3)));
      num.textContent = v;
      fill.style.width = v + '%';
      log.textContent = steps[Math.min(steps.length - 1, Math.floor(t * steps.length))];
      if (t < 1) requestAnimationFrame(frame);
      else setTimeout(() => {
        boot.classList.add('done');
        try { sessionStorage.setItem('booted', '1'); } catch (e) {}
        setTimeout(() => boot.remove(), 700);
      }, 250);
    })(start);
  }

  /* ---------- mobile nav ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- cursor spotlight on the background ---------- */
  if (finePointer && !reduce) {
    const root = document.documentElement;
    window.addEventListener('pointermove', e => {
      root.style.setProperty('--mx', e.clientX + 'px');
      root.style.setProperty('--my', e.clientY + 'px');
    }, { passive: true });
  }

  /* ---------- glow that follows the cursor inside case cards ---------- */
  document.querySelectorAll('.case').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--cx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--cy', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- doors: tap to open on touch screens ---------- */
  if (!finePointer) {
    document.querySelectorAll('.door').forEach(door => {
      door.addEventListener('click', e => {
        if (!door.classList.contains('open')) {
          e.preventDefault();
          document.querySelectorAll('.door.open').forEach(d => d.classList.remove('open'));
          door.classList.add('open');
        }
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------- count-up numbers ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const t0 = performance.now();
        (function step(now) {
          const p = Math.min(1, (now - t0) / 1100);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => co.observe(el));
  }

  /* ---------- rotating role text ---------- */
  const swap = document.querySelector('.role-swap');
  if (swap && !reduce) {
    const roles = swap.dataset.roles.split('|');
    const txt = swap.querySelector('.role-text');
    let i = 0;
    setInterval(() => {
      txt.classList.add('out');
      setTimeout(() => {
        i = (i + 1) % roles.length;
        txt.textContent = roles[i];
        txt.classList.remove('out');
      }, 300);
    }, 2400);
  }

  /* ---------- filter bars (blog / labs / guides / videos) ---------- */
  document.querySelectorAll('[data-filter-bar]').forEach(grid => {
    const bar = document.getElementById(grid.dataset.filterBar);
    if (!bar) return;
    const items = grid.querySelectorAll('.filter-item');
    bar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tag = btn.dataset.tag;
        items.forEach(item => {
          const tags = (item.dataset.tags || '').split(',');
          item.style.display = (tag === 'all' || tags.includes(tag)) ? '' : 'none';
        });
      });
    });
  });

  /* ---------- hero terminal typing loop ---------- */
  const typeLine = document.querySelector('.type-line');
  if (typeLine && !reduce) {
    const commands = ['$ tail -f alerts.log', '$ SecurityEvent | where EventID == 4625', '$ fw ctl zdebug drop', '$ Get-WinEvent -LogName Security'];
    let c = 0, ch = 0, del = false;
    (function tick() {
      const cur = commands[c];
      if (!del) {
        typeLine.textContent = cur.slice(0, ++ch);
        if (ch === cur.length) { del = true; return setTimeout(tick, 1600); }
      } else {
        typeLine.textContent = cur.slice(0, --ch);
        if (ch === 0) { del = false; c = (c + 1) % commands.length; }
      }
      setTimeout(tick, del ? 30 : 60);
    })();
  }

  /* ---------- reading progress bar on posts ---------- */
  const article = document.querySelector('.post-content');
  if (article) {
    const bar = document.createElement('div');
    bar.className = 'read-progress';
    document.body.appendChild(bar);
    const upd = () => {
      const r = article.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      bar.style.width = (p * 100) + '%';
    };
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* ---------- particle portrait ----------
     Uses assets/img/profile.png if it exists (best: background removed, transparent PNG) (red dot hologram that resolves
     into the real photo on hover). Without a photo it draws the "UA" monogram. */
  const visual = document.querySelector('.hero-visual');
  const canvas = document.getElementById('particles');
  if (visual && canvas) initParticles(visual, canvas, reduce, finePointer);
});

function initParticles(visual, canvas, reduce, finePointer) {
  const ctx = canvas.getContext('2d');
  const photo = document.getElementById('portrait-photo');
  const box = document.getElementById('portrait');
  let W = 0, H = 0, dpr = 1, parts = [], running = false, visible = true;
  const mouse = { x: -9999, y: -9999 };
  let hasPhoto = false;

  function sampleFrom(drawFn, gap) {
    const off = document.createElement('canvas');
    off.width = W; off.height = H;
    const o = off.getContext('2d', { willReadFrequently: true });
    drawFn(o);
    const data = o.getImageData(0, 0, W, H).data;
    const pts = [];
    for (let y = 0; y < H; y += gap) {
      for (let x = 0; x < W; x += gap) {
        const i = (y * W + x) * 4;
        const a = data[i + 3];
        if (a < 40) continue;
        const lum = (data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11) / 255;
        if (lum < 0.08) continue; // skip near-black background
        pts.push({ x, y, s: 0.6 + lum * 1.6 });
      }
    }
    return pts;
  }

  function drawMonogram(o) {
    o.fillStyle = '#fff';
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.font = `${Math.round(H * 0.58)}px Anton, Impact, sans-serif`;
    o.fillText('UA', W / 2, H * 0.46);
  }

  function drawPhoto(o) {
    const iw = photo.naturalWidth, ih = photo.naturalHeight;
    const scale = Math.max(W / iw, H / ih);
    const dw = iw * scale, dh = ih * scale;
    o.drawImage(photo, (W - dw) / 2, 0, dw, dh);
    // keep only a soft oval around the face/shoulders
    o.globalCompositeOperation = 'destination-in';
    const g = o.createRadialGradient(W / 2, H * 0.42, W * 0.15, W / 2, H * 0.45, W * 0.55);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.8, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    o.fillStyle = g;
    o.fillRect(0, 0, W, H);
  }

  function build(usePhoto) {
    const rect = box.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(200, Math.round(rect.width));
    H = Math.max(200, Math.round(rect.height));
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gap = W < 340 ? 6 : 5;
    const pts = sampleFrom(usePhoto ? drawPhoto : drawMonogram, gap);
    parts = pts.map(p => ({
      tx: p.x, ty: p.y, s: p.s,
      x: reduce ? p.x : W / 2 + (Math.random() - 0.5) * W * 1.4,
      y: reduce ? p.y : H / 2 + (Math.random() - 0.5) * H * 1.4,
      vx: 0, vy: 0,
    }));
    if (reduce) render(); else start();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    const dim = hasPhoto && visual.classList.contains('lit');
    ctx.fillStyle = dim ? 'rgba(255,46,77,0.35)' : '#ff2e4d';
    for (const p of parts) {
      ctx.globalAlpha = dim ? 0.4 : 0.55 + p.s * 0.2;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.globalAlpha = 1;
  }

  function step() {
    if (!running) return;
    const R = 70, R2 = R * R;
    for (const p of parts) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2) {
        const f = (1 - d2 / R2) * 3.2;
        const d = Math.sqrt(d2) || 1;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
      p.vx += (p.tx - p.x) * 0.045;
      p.vy += (p.ty - p.y) * 0.045;
      p.vx *= 0.82; p.vy *= 0.82;
      p.x += p.vx; p.y += p.vy;
    }
    render();
    requestAnimationFrame(step);
  }
  function start() { if (!running && visible) { running = true; requestAnimationFrame(step); } }
  function stop() { running = false; }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !reduce) start(); else stop();
    }).observe(box);
  }

  box.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  box.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

  const setLit = on => { visual.classList.toggle('lit', on); if (reduce) render(); };
  if (finePointer) {
    box.addEventListener('pointerenter', () => setLit(true));
    box.addEventListener('pointerleave', () => setLit(false));
  } else {
    box.addEventListener('click', () => setLit(!visual.classList.contains('lit')));
  }

  const go = () => build(hasPhoto);
  if (photo) {
    photo.addEventListener('load', () => { hasPhoto = true; photo.hidden = false; visual.classList.add('has-photo'); go(); });
    photo.addEventListener('error', () => { hasPhoto = false; photo.remove(); go(); });
    if (photo.complete) {
      if (photo.naturalWidth) { hasPhoto = true; photo.hidden = false; visual.classList.add('has-photo'); }
      else photo.remove();
    }
  }

  // wait for the display font so the monogram renders in Anton
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
    if (!parts.length) go();
  });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(go, 200); });
}
