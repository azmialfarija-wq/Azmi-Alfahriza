// =====================================================
// TECHZONE MOTION SYSTEM - bagian JS bersama
//  - [data-reveal] / [data-reveal-stagger]  : scroll reveal sekali pakai
//  - [data-fx-parallax="pointer|scroll"]    : parallax ringan untuk orb & elemen --fx-px/--fx-py
// Dimuat di <head> (sinkron) supaya kelas `fx` terpasang sebelum cat pertama
// dan konten reveal tidak berkedip.
// =====================================================
(function () {
  'use strict';
  const de = document.documentElement;
  const reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canIO = 'IntersectionObserver' in window;
  if (!reducedMQ.matches && canIO) de.classList.add('fx');
  window.TZMotion = { reduced: () => reducedMQ.matches };

  function initReveal() {
    document.querySelectorAll('[data-reveal-stagger]').forEach(box => {
      const step = Number(box.dataset.revealStagger) || 90;
      Array.from(box.children).forEach((c, i) => {
        if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', '');
        c.style.setProperty('--rv-delay', i * step + 'ms');
      });
    });
    const items = document.querySelectorAll('[data-reveal]');
    if (!de.classList.contains('fx') || !items.length) return;
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target; io.unobserve(el);
      el.classList.add('is-in');
      const delay = parseFloat(el.style.getPropertyValue('--rv-delay')) || 0;
      // setelah selesai, lepas aturan reveal agar transisi hover milik elemen itu kembali normal
      setTimeout(() => el.classList.add('rv-done'), delay + 950);
    }), {threshold: 0.15, rootMargin: '0px 0px -8% 0px'});
    items.forEach(el => io.observe(el));
  }

  function initParallax() {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    document.querySelectorAll('[data-fx-parallax]').forEach(sec => {
      const mode = sec.dataset.fxParallax;
      let visible = true, tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
      if (canIO) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && mode === 'scroll') measure(); }, {rootMargin: '100px'}).observe(sec);

      function apply() {
        raf = 0;
        cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
        sec.style.setProperty('--fx-px', cx.toFixed(3));
        sec.style.setProperty('--fx-py', cy.toFixed(3));
        if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(apply);
      }
      const kick = () => { if (!raf && !reducedMQ.matches) raf = requestAnimationFrame(apply); };

      function measure() {
        const r = sec.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        ty = Math.max(-1, Math.min(1, (mid - innerHeight / 2) / (innerHeight / 2 + r.height / 2)));
        kick();
      }
      if (mode === 'pointer' && fine) {
        sec.addEventListener('pointermove', e => {
          if (e.pointerType !== 'mouse' || !visible) return;
          const r = sec.getBoundingClientRect();
          tx = ((e.clientX - r.left) / r.width) * 2 - 1; ty = ((e.clientY - r.top) / r.height) * 2 - 1; kick();
        }, {passive: true});
        sec.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); }, {passive: true});
      } else if (mode === 'scroll') {
        window.addEventListener('scroll', () => { if (visible) measure(); }, {passive: true});
        window.addEventListener('resize', measure, {passive: true});
        measure();
      }
    });
  }

  function init() { initReveal(); initParallax(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
