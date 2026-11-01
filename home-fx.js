// =====================================================
// TECHZONE - Efek gerak kartu produk (home.html)
// - Tilt 3D + glare mengikuti kursor (spring, rAF)
// - Scroll reveal berjenjang (sekali per kartu yang baru muncul)
// - Jeda animasi float untuk kartu di luar layar
// Memakai event delegation + MutationObserver pada #grid, sehingga
// kartu hasil render ulang (filter, cari, favorit, produk baru dari admin)
// otomatis ikut. Tidak mengubah data/logika di home.js.
// =====================================================
(function () {
  'use strict';
  const grid = document.getElementById('grid');
  if (!grid) return;

  const reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MAX_TILT = 6;                 // derajat
  const STIFFNESS = 170, DAMPING = 2 * Math.sqrt(STIFFNESS) * 0.88; // sedikit under-damped = natural, tanpa jitter
  const KEYS = ['rx', 'ry', 'lift', 'nx', 'ny', 'mx', 'my'];

  const states = new WeakMap();       // card -> {cur, vel, tgt, rect}
  const active = new Set();           // kartu yang sedang bergerak
  let raf = 0, last = 0;

  function stateOf(card) {
    let s = states.get(card);
    if (!s) {
      s = { cur: {rx: 0, ry: 0, lift: 0, nx: 0, ny: 0, mx: 50, my: 50}, vel: {}, tgt: {rx: 0, ry: 0, lift: 0, nx: 0, ny: 0, mx: 50, my: 50}, rect: null };
      KEYS.forEach(k => s.vel[k] = 0);
      states.set(card, s);
    }
    return s;
  }

  function wake(card) {
    active.add(card);
    card.classList.add('fx-active');
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  function tick(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    active.forEach(card => {
      if (!card.isConnected) { active.delete(card); return; }
      const s = stateOf(card);
      let settled = true;
      KEYS.forEach(k => {
        const force = STIFFNESS * (s.tgt[k] - s.cur[k]) - DAMPING * s.vel[k];
        s.vel[k] += force * dt;
        s.cur[k] += s.vel[k] * dt;
        if (Math.abs(s.vel[k]) > 0.02 || Math.abs(s.tgt[k] - s.cur[k]) > 0.01) settled = false;
      });
      if (settled) { KEYS.forEach(k => { s.cur[k] = s.tgt[k]; s.vel[k] = 0; }); }
      const st = card.style;
      KEYS.forEach(k => st.setProperty('--' + k, s.cur[k].toFixed(3)));
      if (settled) {
        active.delete(card);
        card.classList.remove('fx-active');
        if (s.tgt.lift === 0) KEYS.forEach(k => st.removeProperty('--' + k)); // kembali ke nilai CSS bawaan
      }
    });
    raf = active.size ? requestAnimationFrame(tick) : 0;
  }

  function release(card) {
    const s = states.get(card); if (!s) return;
    Object.assign(s.tgt, {rx: 0, ry: 0, lift: 0, nx: 0, ny: 0, mx: 50, my: 50});
    s.rect = null;
    wake(card);
  }
  function releaseAll() { active.forEach(release); grid.querySelectorAll('.card.fx-active').forEach(release); }

  // ---------- Pointer tracking (hanya mouse; layar sentuh tidak memakai tilt) ----------
  grid.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || reducedMQ.matches) return;
    const card = e.target.closest && e.target.closest('.card'); if (!card) return;
    const s = stateOf(card);
    if (!s.rect) s.rect = card.getBoundingClientRect();   // di-cache agar tidak berumpan balik dengan transform
    const r = s.rect;
    const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    s.tgt.ry = nx * MAX_TILT; s.tgt.rx = -ny * MAX_TILT;
    s.tgt.nx = nx; s.tgt.ny = ny;
    s.tgt.mx = (nx + 1) * 50; s.tgt.my = (ny + 1) * 50;
    s.tgt.lift = 1;
    wake(card);
  }, {passive: true});

  grid.addEventListener('pointerout', e => {
    if (e.pointerType !== 'mouse') return;
    const card = e.target.closest && e.target.closest('.card'); if (!card) return;
    if (e.relatedTarget && card.contains(e.relatedTarget)) return;
    release(card);
  }, {passive: true});

  grid.addEventListener('pointerleave', releaseAll, {passive: true});
  window.addEventListener('blur', releaseAll);
  const dropRects = () => active.forEach(c => { const s = states.get(c); if (s) s.rect = null; });
  window.addEventListener('scroll', dropRects, {passive: true});
  window.addEventListener('resize', dropRects, {passive: true});
  reducedMQ.addEventListener && reducedMQ.addEventListener('change', e => { if (e.matches) releaseAll(); });

  // ---------- Float: jeda saat di luar layar ----------
  const floatIO = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('fx-off', !en.isIntersecting)), {rootMargin: '150px 0px'})
    : null;

  // ---------- Scroll reveal ----------
  const revealIO = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        const vis = entries.filter(en => en.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left));
        vis.forEach((en, i) => {
          const card = en.target, delay = Math.min(i, 8) * 70;
          revealIO.unobserve(card);
          card.style.setProperty('--fx-delay', delay + 'ms');
          card.classList.add('fx-in');
          setTimeout(() => { card.classList.remove('fx-pre', 'fx-in'); card.style.removeProperty('--fx-delay'); }, delay + 750);
        });
      }, {threshold: 0.12, rootMargin: '0px 0px -6% 0px'})
    : null;

  let seen = new Set();   // id kartu pada render sebelumnya
  function setup() {
    const cards = Array.from(grid.querySelectorAll('.card'));
    const ids = new Set(cards.map(c => c.dataset.id));
    cards.forEach(c => {
      if (floatIO) floatIO.observe(c);
      // Hanya kartu yang BARU muncul yang di-reveal; render ulang (favorit, cari, urut) tidak memutar ulang animasi.
      if (revealIO && !reducedMQ.matches && !seen.has(c.dataset.id)) { c.classList.add('fx-pre'); revealIO.observe(c); }
    });
    seen = ids;
  }

  new MutationObserver(setup).observe(grid, {childList: true});
  setup();   // render pertama sudah terjadi sebelum file ini dimuat
})();
