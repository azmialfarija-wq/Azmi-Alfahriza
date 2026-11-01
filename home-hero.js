// =====================================================
// TECHZONE - Carousel produk unggulan di hero (home.html)
// Mengambil produk NYATA dari katalog (produkTampil() di home.js):
// satu per kategori - laptop, smartphone, iPad/tablet, mouse.
// Klik gambar / nama / tombol -> katalog difilter ke kategori produk itu,
// lalu halaman menggulir ke kartu produk dan menyorotnya
// (proyek ini tidak punya halaman detail produk terpisah).
// =====================================================
(function () {
  'use strict';
  const root = document.getElementById('hc');
  if (!root) return;

  const stage = document.getElementById('hc-stage');
  const slidesEl = document.getElementById('hc-slides');
  const dotsEl = document.getElementById('hc-dots');
  const infoEl = document.getElementById('hc-info');
  const catEl = document.getElementById('hc-cat'), nameEl = document.getElementById('hc-name');
  const descEl = document.getElementById('hc-desc'), ctaEl = document.getElementById('hc-cta'), priceEl = document.getElementById('hc-price');
  const reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Urutan & produk pilihan (id seed). Bila produk itu dihapus/disembunyikan admin / habis,
  // otomatis diganti produk pertama yang tersedia di kategori yang sama.
  const SLOTS = [
    {cat: 'laptop', label: 'Laptop',        prefer: [1, 2]},
    {cat: 'hp',     label: 'Smartphone',    prefer: [12, 11]},
    {cat: 'ipad',   label: 'iPad & Tablet', prefer: [31, 32]},
    {cat: 'mouse',  label: 'Mouse',         prefer: [21, 22]}
  ];

  let items = [];     // [{slot, b}]
  let cur = 0;
  let sig = '';

  function pick() {
    const all = produkTampil();
    return SLOTS.map(slot => {
      const pool = all.filter(b => b.kategori === slot.cat && b.stok > 0);
      let b = null;
      for (const id of slot.prefer) { b = pool.find(x => Number(x.id) === id); if (b) break; }
      if (!b) b = pool[0];
      return b ? {slot, b} : null;
    }).filter(Boolean);
  }

  // ---------- Render ----------
  function build() {
    const next = pick();
    if (!next.length) return;
    const nsig = next.map(i => i.b.id + ':' + i.b.nama + ':' + i.b.gambar + ':' + i.b.harga).join('|');
    if (nsig === sig) return;                       // tidak ada perubahan data -> jangan bangun ulang
    const keepCat = items[cur] && items[cur].slot.cat;
    sig = nsig; items = next;
    cur = Math.max(0, items.findIndex(i => i.slot.cat === keepCat));

    slidesEl.innerHTML = items.map((it, i) => `
      <div class="hc-slide" role="group" aria-roledescription="slide" aria-label="${i + 1} dari ${items.length}">
        <button type="button" class="hc-photo" data-open="${i}" aria-label="Lihat ${esc(it.b.nama)} di katalog">
          <img src="${esc(it.b.gambar)}" alt="${esc(it.b.nama)}" draggable="false" ${i === 0 ? '' : 'loading="lazy"'} onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
        </button>
      </div>`).join('');
    dotsEl.innerHTML = items.map((it, i) =>
      `<button type="button" class="hc-dot" data-dot="${i}" aria-label="Tampilkan ${esc(it.slot.label)}: ${esc(it.b.nama)}"><i class="hc-bar"></i></button>`).join('');
    place(1);
    renderInfo();
    setActiveDot();
    root.classList.toggle('is-single', items.length < 2);
    document.getElementById('hc-prev').hidden = document.getElementById('hc-next').hidden = items.length < 2;
  }

  function renderInfo() {
    const {slot, b} = items[cur];
    catEl.textContent = slot.label;
    nameEl.textContent = b.nama;
    descEl.textContent = ringkas(b);
    ctaEl.textContent = 'Lihat ' + b.nama;
    ctaEl.title = 'Lihat ' + b.nama + ' di katalog';
    priceEl.textContent = rupiah(hargaAkhir(b));
  }
  function setActiveDot() {
    dotsEl.querySelectorAll('.hc-dot').forEach((d, i) => {
      const on = i === cur;
      d.classList.toggle('is-active', on);
      if (on) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
  }

  // data-pos: 0 = tampil, -1 = di kiri, 1 = di kanan
  function place(dir) {
    const n = items.length;
    slidesEl.querySelectorAll('.hc-slide').forEach((s, i) => {
      const rel = (i - cur + n) % n;
      const pos = rel === 0 ? 0 : (n > 2 && rel === 1) ? 1 : (n > 2 && rel === n - 1) ? -1 : (dir > 0 ? 1 : -1);
      s.dataset.pos = pos;
      s.setAttribute('aria-hidden', pos === 0 ? 'false' : 'true');
      const btn = s.firstElementChild; if (btn) btn.tabIndex = pos === 0 ? 0 : -1;
    });
  }

  let swapTimer = 0;
  function go(to, dir) {
    const n = items.length; if (n < 2) return;
    to = (to + n) % n;
    if (to === cur) return;
    if (dir == null) dir = to > cur ? 1 : -1;
    const slides = slidesEl.children;
    const target = slides[to];
    // slide tujuan dipasang dulu di sisi asalnya (tanpa transisi) supaya selalu masuk dari arah yang benar
    target.classList.add('no-tr'); target.dataset.pos = dir > 0 ? 1 : -1; void target.offsetWidth; target.classList.remove('no-tr');
    cur = to;
    place(dir);
    setActiveDot();
    clearTimeout(swapTimer);
    if (reducedMQ.matches) { renderInfo(); return; }
    infoEl.classList.add('is-swap');
    swapTimer = setTimeout(() => { renderInfo(); infoEl.classList.remove('is-swap'); }, 200);
  }
  const next = () => go(cur + 1, 1), prev = () => go(cur - 1, -1);

  // ---------- Navigasi ke katalog ----------
  function openProduct(i) {
    const it = items[i]; if (!it) return;
    const search = document.getElementById('search');
    if (search) search.value = '';                  // pastikan produk tidak tersaring pencarian
    setKategori(it.slot.cat);                       // filter kategori + render ulang katalog (home.js)
    const card = document.querySelector(`#grid .card[data-id="${it.b.id}"]`);
    const section = document.getElementById('produk');
    if (card) {
      card.scrollIntoView({behavior: reducedMQ.matches ? 'auto' : 'smooth', block: 'center'});
      card.classList.remove('fx-spot'); void card.offsetWidth; card.classList.add('fx-spot');
      setTimeout(() => card.classList.remove('fx-spot'), 2800);
    } else if (section) section.scrollIntoView({behavior: 'smooth'});
  }

  // ---------- Jeda otomatis ----------
  const flags = {hover: false, focus: false, drag: false, hidden: document.hidden, off: false};
  function syncPause() { root.classList.toggle('is-paused', Object.values(flags).some(Boolean)); }
  document.addEventListener('visibilitychange', () => { flags.hidden = document.hidden; syncPause(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { flags.off = !es[0].isIntersecting; syncPause(); }, {threshold: 0.25}).observe(root);
  root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { flags.hover = true; syncPause(); } });
  root.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { flags.hover = false; syncPause(); } });
  root.addEventListener('focusin', e => { if (e.target.matches(':focus-visible')) { flags.focus = true; syncPause(); } });
  root.addEventListener('focusout', () => { flags.focus = false; syncPause(); });
  // Penghitung waktu = animasi bar di dot aktif (5 detik); selesai -> slide berikutnya. Ikut berhenti saat dijeda.
  dotsEl.addEventListener('animationend', e => { if (e.animationName === 'hc-bar') next(); });

  // ---------- Klik ----------
  let suppressClick = false;
  root.addEventListener('click', e => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; return; }
    const t = e.target;
    const open = t.closest('[data-open]'); if (open) return openProduct(Number(open.dataset.open));
    if (t.closest('#hc-name') || t.closest('#hc-cta')) return openProduct(cur);
    const dot = t.closest('[data-dot]'); if (dot) return go(Number(dot.dataset.dot));
    if (t.closest('#hc-next')) return next();
    if (t.closest('#hc-prev')) return prev();
  }, true);
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });

  // ---------- Drag / swipe ----------
  let drag = null;
  stage.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (e.target.closest('.hc-arrow')) return;
    drag = {id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, active: false, w: stage.clientWidth};
  });
  stage.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;   // gerak vertikal = scroll halaman
      drag.active = true; flags.drag = true; syncPause();
      stage.classList.add('is-dragging');
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    }
    drag.dx = dx;
    const s = slidesEl.querySelector('.hc-slide[data-pos="0"]');
    if (s) { s.style.transform = `translateX(${dx}px) scale(${1 - Math.min(Math.abs(dx) / drag.w, 1) * 0.06})`; s.style.opacity = String(1 - Math.min(Math.abs(dx) / drag.w, 1) * 0.55); }
  });
  function endDrag(e, cancelled) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const d = drag; drag = null;
    if (!d.active) return;
    flags.drag = false; syncPause();
    stage.classList.remove('is-dragging');
    const s = slidesEl.querySelector('.hc-slide[data-pos="0"]');
    if (s) { s.style.transform = ''; s.style.opacity = ''; }       // animasi kembali/pindah lewat transisi CSS
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 60);
    const v = d.dx / Math.max(1, performance.now() - d.t);          // px/ms
    if (!cancelled && (Math.abs(d.dx) > d.w * 0.16 || Math.abs(v) > 0.45)) (d.dx < 0 ? next : prev)();
  }
  stage.addEventListener('pointerup', e => endDrag(e, false));
  stage.addEventListener('pointercancel', e => endDrag(e, true));

  // ---------- Tilt 3D mengikuti kursor (hanya mouse) ----------
  const T = {rx: 0, ry: 0, lift: 0, mx: 50, my: 50}, C = {rx: 0, ry: 0, lift: 0, mx: 50, my: 50};
  let raf = 0;
  function loop() {
    let moving = false;
    for (const k in T) { C[k] += (T[k] - C[k]) * 0.12; if (Math.abs(T[k] - C[k]) > 0.01) moving = true; else C[k] = T[k]; }
    stage.style.setProperty('--hrx', C.rx.toFixed(2)); stage.style.setProperty('--hry', C.ry.toFixed(2));
    stage.style.setProperty('--hlift', C.lift.toFixed(3)); stage.style.setProperty('--hmx', C.mx.toFixed(1)); stage.style.setProperty('--hmy', C.my.toFixed(1));
    raf = moving ? requestAnimationFrame(loop) : 0;
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || reducedMQ.matches || (drag && drag.active)) return;
    const r = stage.getBoundingClientRect();                         // stage tidak ber-transform -> rect stabil
    const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    T.ry = nx * 7; T.rx = -ny * 6; T.lift = 1; T.mx = (nx + 1) * 50; T.my = (ny + 1) * 50; kick();
  }, {passive: true});
  stage.addEventListener('pointerleave', () => { T.rx = T.ry = T.lift = 0; T.mx = T.my = 50; kick(); }, {passive: true});

  // ---------- Sinkron bila admin mengubah produk (tab lain) ----------
  window.addEventListener('storage', e => { if (!e.key || e.key === 'techzone_barang' || e.key === 'techzone_hidden_barang' || e.key === 'techzone_banner_config') build(); });
  window.addEventListener('focus', build);

  build();
})();
