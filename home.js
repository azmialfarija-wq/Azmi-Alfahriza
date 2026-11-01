// =====================================================
// TECHZONE - HALAMAN USER (home.html)
// Data produk, diskon, stok, dan transaksi dibaca dari script.js
// (localStorage yang sama dengan admin.html), jadi semua perubahan
// admin langsung tampil di sini dan sebaliknya.
// =====================================================
const $ = id => document.getElementById(id);
const isUser = () => !!currentUser && currentUser.role === 'user';
const isAdmin = () => !!currentUser && currentUser.role === 'admin';

// Toko hanya untuk yang sudah login; tanpa sesi kembali ke halaman login.
if (!currentUser) { window.location.replace('index.html'); }

let kategoriAktif = 'semua';
let pending = null;      // {items, fromCart}
let metodeBayar = '';

const QR_FILES = {'QRIS':'qris-techzone.png','BCA':'qr-bca.png','BRI':'qr-bri.png','Mandiri':'qr-mandiri.png','BNI':'qr-bni.png','BSI':'qr-bsi.png','Bank Jago':'qr-bank-jago.png','Bank Lainnya':'qr-bank-lainnya.png'};
const REVIEWS = [
  ['Rizky Aditya','Mahasiswa','ROG Strix-nya mulus buat gaming dan coding. Packing aman, admin cepat membalas.'],
  ['Amelia Putri','Desainer grafis','MacBook Air-nya sesuai deskripsi. Proses belinya gampang dan jelas.'],
  ['Budi Santoso','Karyawan swasta','Harga transparan, stok dicek langsung. iPhone sampai dalam kondisi segel.'],
  ['Dian Pratama','Pelanggan tetap','Sudah tiga kali beli di sini, selalu original dan bergaransi. Recommended.'],
  ['Fajar Ramadhan','Konsultan IT','Ditanya kebutuhan dulu baru dikasih saran laptop. Tidak asal jualan.'],
  ['Sari Wulandari','Ibu rumah tangga','Beli iPad buat anak sekolah. Dibantu pilih yang pas dengan budget kami.'],
  ['Hendra Wijaya','Pengusaha','Pesan 3 laptop untuk kantor, semua datang tepat waktu dan sudah dicek.'],
  ['Maya Lestari','Content creator','Mouse dan tablet-nya awet dipakai harian. Pembayaran QRIS juga praktis.']
];

// ---------- Penyimpanan suka & keranjang (per akun) ----------
const KEY_SUKA = 'techzone_suka';
const cartKey = () => CART_PREFIX + (currentUser?.username || '');
const getSuka = () => (readStore(KEY_SUKA, {})[currentUser?.username] || []).map(Number);
function setSuka(list) {
  const all = readStore(KEY_SUKA, {}); all[currentUser.username] = list; writeStore(KEY_SUKA, all);
}
const getCart = () => { const c = readStore(cartKey(), []); return Array.isArray(c) ? c : []; };
const setCart = c => writeStore(cartKey(), c);

function perluLogin(aksi) {
  if (isUser()) return false;
  if (isAdmin()) { showToast('Kamu login sebagai admin. Masuk dengan akun pelanggan untuk berbelanja.', 'info'); return true; }
  showToast(`Masuk dulu untuk ${aksi}.`, 'info');
  setTimeout(() => { location.href = 'index.html'; }, 1100);
  return true;
}

// ---------- Data produk ----------
function produkTampil() {
  const hidden = new Set(readStore('techzone_hidden_barang', []).map(String));
  return getBarang().filter(b => !hidden.has(String(b.id)));
}
const cariProduk = id => produkTampil().find(b => b.id == id);
const hargaAkhir = b => getDiscountedPrice(b.harga, b.kategori);
function ringkas(b) {
  const s = b.spesifikasi; if (!s) return 'Produk original bergaransi.';
  const bagian = b.kategori === 'mouse' ? [s.sensor, s.koneksi, s.berat] : [s.prosesor, s.ram, s.penyimpanan];
  return bagian.filter(Boolean).join(' • ');
}

// ---------- Katalog ----------
function kartu(b) {
  const habis = b.stok <= 0, diskon = getDiscountForCategory(b.kategori), suka = getSuka().includes(Number(b.id));
  const harga = diskon > 0
    ? `<div class="price-wrap"><del>${rupiah(b.harga)}</del><span class="price">${rupiah(hargaAkhir(b))}</span></div>`
    : `<div class="price-wrap"><span class="price">${rupiah(b.harga)}</span></div>`;
  const stok = habis ? '<span class="stock out">Stok habis</span>' : b.stok <= 5 ? `<span class="stock low">Tersisa ${b.stok} unit</span>` : `<span class="stock">Stok ${b.stok} unit</span>`;
  return `<article class="card" data-id="${b.id}">
    <div class="ph">
      <img src="${esc(b.gambar)}" alt="${esc(b.nama)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
      <span class="cat-badge">${kategoriLabel(b.kategori)}</span>
      ${diskon > 0 ? `<span class="disc-badge">-${diskon}%</span>` : ''}
      <button class="like-btn ${suka ? 'on' : ''}" data-act="like" aria-pressed="${suka}" aria-label="${suka ? 'Hapus dari favorit' : 'Suka'} ${esc(b.nama)}"><i class="fa-${suka ? 'solid' : 'regular'} fa-heart"></i></button>
    </div>
    <div class="body">
      <h3>${esc(b.nama)}</h3>
      <p>${esc(ringkas(b))}</p>
      ${stok}
      <div class="foot-row">${harga}${b.spesifikasi ? `<button class="mini" data-act="spec" aria-label="Spesifikasi ${esc(b.nama)}"><i class="fa-solid fa-circle-info"></i></button>` : ''}</div>
      <div class="actions">
        <button class="btn btn-sm ghost" data-act="cart" ${habis ? 'disabled' : ''}><i class="fa-solid fa-cart-plus"></i> Keranjang</button>
        <button class="btn btn-sm" data-act="buy" ${habis ? 'disabled' : ''}>${habis ? 'Habis' : 'Beli'}</button>
      </div>
    </div>
  </article>`;
}

function renderProduk() {
  const q = $('search').value.trim().toLowerCase(), urut = $('sort').value;
  const suka = new Set(getSuka());
  const urutKat = {laptop:0, hp:1, mouse:2, ipad:3};
  const seed = new Map(PRODUCT_SEED.map((p, i) => [Number(p.id), i]));
  const pos = b => seed.has(Number(b.id)) ? seed.get(Number(b.id)) : 10000 + Number(b.id);
  let list = produkTampil().filter(b =>
    (kategoriAktif === 'semua' || (kategoriAktif === 'favorit' ? suka.has(Number(b.id)) : b.kategori === kategoriAktif)) &&
    b.nama.toLowerCase().includes(q));
  list.sort((a, b) => {
    if (urut === 'murah') return hargaAkhir(a) - hargaAkhir(b);
    if (urut === 'mahal') return hargaAkhir(b) - hargaAkhir(a);
    if (urut === 'nama') return a.nama.localeCompare(b.nama);
    return ((urutKat[a.kategori] ?? 99) - (urutKat[b.kategori] ?? 99)) || (pos(a) - pos(b));
  });
  const label = kategoriAktif === 'semua' ? 'dari semua kategori' : kategoriAktif === 'favorit' ? 'di favorit kamu' : 'kategori ' + kategoriLabel(kategoriAktif);
  $('summary').innerHTML = `Menampilkan <b>${list.length}</b> produk ${label}.`;
  let kosong = '<div class="empty"><i class="fa-solid fa-box-open"></i><h3>Produk tidak ditemukan</h3><p>Coba kata kunci atau kategori lain.</p></div>';
  if (kategoriAktif === 'favorit' && !q) kosong = `<div class="empty"><i class="fa-regular fa-heart"></i><h3>Belum ada favorit</h3><p>${isUser() ? 'Tekan ikon hati pada produk untuk menyimpannya di sini.' : 'Masuk dulu, lalu tekan ikon hati pada produk yang kamu suka.'}</p></div>`;
  $('grid').innerHTML = list.map(kartu).join('') || kosong;
  updateBadges();
}

function updateBadges() {
  const visible = new Set(produkTampil().map(b => Number(b.id)));
  $('fav-count').textContent = isUser() ? getSuka().filter(id => visible.has(id)).length : 0;
  $('cart-count').textContent = isUser() ? getCart().filter(x => visible.has(Number(x.id))).reduce((n, x) => n + Number(x.qty || 0), 0) : 0;
}

// ---------- Aksi suka / keranjang ----------
function toggleSuka(id, el) {
  if (perluLogin('menyimpan produk favorit')) return;
  const b = cariProduk(id); if (!b) return;
  let list = getSuka(); const n = Number(id);
  const sudah = list.includes(n);
  list = sudah ? list.filter(x => x !== n) : [...list, n];
  setSuka(list);
  showToast(sudah ? `${b.nama} dihapus dari favorit` : `${b.nama} disimpan ke favorit`, sudah ? 'info' : 'success');
  renderProduk();
}

function tambahKeranjang(id) {
  if (perluLogin('menambah ke keranjang')) return;
  const b = cariProduk(id); if (!b || b.stok <= 0) return;
  const cart = getCart(), ada = cart.find(x => x.id == id);
  if (ada) {
    if (Number(ada.qty) >= b.stok) { showToast(`Stok ${b.nama} hanya ${b.stok} unit.`, 'info'); return; }
    ada.qty = Number(ada.qty) + 1;
  } else cart.push({id: b.id, qty: 1});
  setCart(cart); updateBadges(); renderCart();
  showToast(`${b.nama} masuk keranjang`, 'success');
}

function itemKeranjang() {
  return getCart().map(x => {
    const b = cariProduk(x.id); if (!b || b.stok <= 0) return null;
    const qty = Math.min(Number(x.qty || 1), b.stok), diskon = getDiscountForCategory(b.kategori);
    return {id: b.id, nama: b.nama, kategori: b.kategori, gambar: b.gambar, stok: b.stok, harga: hargaAkhir(b), hargaAsli: b.harga, diskon, qty};
  }).filter(Boolean);
}

function renderCart() {
  const items = isUser() ? itemKeranjang() : [];
  $('cart-items').innerHTML = items.map(i => `<div class="ci" data-id="${i.id}">
      <img src="${esc(i.gambar)}" alt="" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
      <div class="ci-info"><b>${esc(i.nama)}</b><small>${kategoriLabel(i.kategori)}</small>
        <span class="price">${rupiah(i.harga)}</span>
        <div class="qty"><button data-q="-1" aria-label="Kurangi">−</button><span>${i.qty}</span><button data-q="1" aria-label="Tambah" ${i.qty >= i.stok ? 'disabled' : ''}>+</button></div></div>
      <button class="rm" data-rm="1" aria-label="Hapus ${esc(i.nama)}"><i class="fa-solid fa-trash"></i></button>
    </div>`).join('') || `<div class="empty small"><i class="fa-solid fa-cart-shopping"></i><p>${isUser() ? 'Keranjang masih kosong.' : 'Masuk untuk mulai belanja.'}</p></div>`;
  $('cart-total').textContent = rupiah(items.reduce((s, i) => s + i.harga * i.qty, 0));
  $('btn-checkout').disabled = !items.length;
  updateBadges();
}

function ubahQty(id, delta) {
  const cart = getCart(), x = cart.find(c => c.id == id), b = cariProduk(id);
  if (!x || !b) return;
  const baru = Number(x.qty) + delta;
  if (baru < 1) return;
  if (baru > b.stok) { showToast(`Stok ${b.nama} hanya ${b.stok} unit.`, 'info'); return; }
  x.qty = baru; setCart(cart); renderCart();
}
function hapusItem(id) { setCart(getCart().filter(x => x.id != id)); renderCart(); }

// ---------- Panel & modal ----------
function bukaDrawer() {
  if (perluLogin('membuka keranjang')) return;
  renderCart();
  $('drawer').classList.add('open'); $('drawer').setAttribute('aria-hidden', 'false'); $('overlay').classList.remove('hidden');
}
function tutup(id) {
  if (id === 'drawer') { $('drawer').classList.remove('open'); $('drawer').setAttribute('aria-hidden', 'true'); $('overlay').classList.add('hidden'); }
  else $(id).classList.add('hidden');
}
document.addEventListener('click', e => { const c = e.target.closest('[data-close]'); if (c) tutup(c.dataset.close); });
$('overlay').onclick = () => tutup('drawer');
document.addEventListener('keydown', e => { if (e.key === 'Escape') tutup('drawer'); });
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); }));

function showSpecModal(id) {
  const b = cariProduk(id); if (!b || !b.spesifikasi) return;
  const rows = Object.keys(SPEC_LABELS).filter(k => b.spesifikasi[k]).map(k => `<div class="spec-row"><span>${SPEC_LABELS[k]}</span><b>${esc(b.spesifikasi[k])}</b></div>`).join('');
  const diskon = getDiscountForCategory(b.kategori);
  $('spec-content').innerHTML = `<div class="spec-head"><img src="${esc(b.gambar)}" alt="${esc(b.nama)}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"><div><small>${kategoriLabel(b.kategori)}</small><h3>${esc(b.nama)}</h3>
    ${diskon > 0 ? `<del>${rupiah(b.harga)}</del> ` : ''}<strong class="price">${rupiah(hargaAkhir(b))}</strong></div></div>
    <div class="spec-list">${rows}</div>
    <button class="btn full-w" ${b.stok <= 0 ? 'disabled' : ''} data-spec-buy="${b.id}">${b.stok <= 0 ? 'Stok habis' : 'Beli Sekarang'}</button>`;
  $('modal-spec').classList.remove('hidden');
}
$('spec-content').addEventListener('click', e => {
  const t = e.target.closest('[data-spec-buy]'); if (!t) return;
  tutup('modal-spec'); beliLangsung(t.dataset.specBuy);
});

// ---------- Checkout & pembayaran ----------
function beliLangsung(id) {
  if (perluLogin('membeli produk')) return;
  const b = cariProduk(id); if (!b || b.stok <= 0) return;
  bukaPembayaran([{id: b.id, nama: b.nama, kategori: b.kategori, harga: hargaAkhir(b), hargaAsli: b.harga, diskon: getDiscountForCategory(b.kategori), qty: 1}], false);
}
function bukaPembayaran(items, fromCart) {
  pending = {items, fromCart};
  const total = items.reduce((s, i) => s + i.harga * i.qty, 0);
  $('pay-summary').innerHTML = items.map(i => `<div><span>${esc(i.nama)} <small>× ${i.qty}</small></span><b>${rupiah(i.harga * i.qty)}</b></div>`).join('');
  $('pay-total').textContent = rupiah(total);
  metodeBayar = '';
  document.querySelectorAll('.bank').forEach(b => b.classList.remove('active'));
  $('qrcode').innerHTML = '<span>Pilih metode untuk menampilkan QR</span>';
  $('pay-method').textContent = 'Metode: belum dipilih';
  $('btn-paid').disabled = true;
  tutup('drawer');
  $('modal-payment').classList.remove('hidden');
}
$('bank-grid').addEventListener('click', e => {
  const b = e.target.closest('.bank'); if (!b) return;
  metodeBayar = b.dataset.bank;
  document.querySelectorAll('.bank').forEach(x => x.classList.toggle('active', x === b));
  $('qrcode').innerHTML = `<img src="images/${QR_FILES[metodeBayar]}" alt="QR ${esc(metodeBayar)}" onerror="this.style.display='none'">`;
  $('pay-method').textContent = 'Metode: ' + metodeBayar;
  $('btn-paid').disabled = false;
});
$('btn-checkout').onclick = () => {
  const items = itemKeranjang();
  if (!items.length) { showToast('Keranjang masih kosong.', 'info'); return; }
  bukaPembayaran(items, true);
};

$('btn-paid').onclick = () => {
  if (!pending || !metodeBayar || !isUser()) return;
  const daftar = getBarang();
  for (const it of pending.items) {
    const b = daftar.find(x => x.id == it.id);
    if (!b || b.stok < it.qty) { showToast(`Stok ${it.nama} tidak mencukupi.`, 'info'); return; }
  }
  pending.items.forEach(it => { daftar.find(x => x.id == it.id).stok -= it.qty; });
  const total = pending.items.reduce((s, i) => s + i.harga * i.qty, 0);
  const trx = {
    id: 'TRX-' + Date.now().toString().slice(-6), tanggal: new Date().toLocaleString('id-ID'), tanggalISO: new Date().toISOString(),
    pelanggan: currentUser.shortName || currentUser.name,
    barang: pending.items.length === 1 ? pending.items[0].nama : pending.items.map(x => `${x.nama} (${x.qty}x)`).join(', '),
    kategori: pending.items.length === 1 ? pending.items[0].kategori : 'campuran', total,
    hargaAsli: pending.items.reduce((s, i) => s + i.hargaAsli * i.qty, 0), diskon: 0,
    status: 'LUNAS', metode: metodeBayar, pengiriman: 'Siap diambil/diantar', items: pending.items
  };
  const sales = getPenjualan(); sales.unshift(trx);
  saveBarangList(daftar); writeStore('techzone_penjualan', sales);
  // hapus hanya item yang dibeli dari keranjang
  const dibeli = new Set(pending.items.map(i => String(i.id)));
  setCart(getCart().filter(x => !dibeli.has(String(x.id))));
  tutup('modal-payment'); showStruk(trx);
  showToast('Pembayaran berhasil. Struk lunas dibuka.', 'success');
  pending = null; metodeBayar = ''; renderProduk(); renderCart();
};

function showStruk(t) {
  $('struk-id').textContent = t.id; $('struk-tgl').textContent = t.tanggal;
  $('struk-pelanggan').textContent = t.pelanggan; $('struk-metode').textContent = t.metode;
  $('struk-items').innerHTML = (t.items || []).map(i => `<div><span>${esc(i.nama)} <small>× ${i.qty}</small></span><b>${rupiah(i.harga * i.qty)}</b></div>`).join('');
  $('struk-total').textContent = rupiah(t.total);
  $('modal-struk').classList.remove('hidden');
}

// Cetak struk: salin isi struk ke lembar cetak khusus di luar modal, supaya hasil cetak tidak kosong.
function cetakStruk() {
  const sumber = $('print-area');
  if (!sumber || !$('struk-id').textContent) { showToast('Struk belum tersedia.', 'info'); return; }
  const lembar = $('print-sheet');
  lembar.innerHTML = '<div class="receipt receipt-print">' + sumber.innerHTML + '</div>';
  const bersihkan = () => { lembar.innerHTML = ''; window.removeEventListener('afterprint', bersihkan); };
  window.addEventListener('afterprint', bersihkan);
  const gambar = [...lembar.querySelectorAll('img')];
  Promise.all(gambar.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })))
    .then(() => window.print());
}
$('btn-print-struk').onclick = cetakStruk;

// ---------- Event katalog ----------
$('grid').addEventListener('click', e => {
  const btn = e.target.closest('[data-act]'); if (!btn) return;
  const id = btn.closest('.card').dataset.id;
  ({like: toggleSuka, cart: tambahKeranjang, buy: beliLangsung, spec: showSpecModal})[btn.dataset.act](id);
});
$('chips').addEventListener('click', e => {
  const c = e.target.closest('.chip'); if (!c) return;
  if (c.dataset.cat === 'favorit' && perluLogin('melihat favorit')) return;
  setKategori(c.dataset.cat);
});
function setKategori(k) {
  kategoriAktif = k;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.cat === k));
  renderProduk();
}
$('search').oninput = renderProduk; $('sort').onchange = renderProduk;
$('btn-cart').onclick = bukaDrawer;
$('btn-fav').onclick = () => {
  if (perluLogin('melihat favorit')) return;
  setKategori('favorit'); $('produk').scrollIntoView({behavior: 'smooth'});
};
$('cart-items').addEventListener('click', e => {
  const row = e.target.closest('.ci'); if (!row) return;
  const q = e.target.closest('[data-q]');
  if (q) return ubahQty(row.dataset.id, Number(q.dataset.q));
  if (e.target.closest('[data-rm]')) hapusItem(row.dataset.id);
});

// ---------- Akun di navbar ----------
function renderUser() {
  let html;
  if (isUser()) html = `<span class="hi">Halo, <b>${esc(currentUser.shortName || currentUser.name)}</b></span><button class="btn btn-sm ghost-dark js-logout">Keluar</button>`;
  else if (isAdmin()) html = `<a class="btn btn-sm" href="admin.html">Dashboard</a><button class="btn btn-sm ghost-dark js-logout">Keluar</button>`;
  else html = `<a class="btn btn-sm" href="index.html"><i class="fa-solid fa-right-to-bracket"></i> Masuk</a>`;
  $('user-slot').innerHTML = html; $('user-slot-m').innerHTML = html;
  document.querySelectorAll('.js-logout').forEach(b => b.onclick = logout);
  const fl = $('foot-login'); if (fl) { fl.textContent = currentUser ? 'Keluar' : 'Masuk ke akun'; fl.onclick = currentUser ? (e => { e.preventDefault(); logout(); }) : null; }
}

// ---------- Testimoni ----------
const colors = ['#ff7a18','#2563eb','#16a34a','#9333ea','#e11d48','#0891b2','#ca8a04','#475569'];
const rev = (r, i) => `<div class="rev-card"><div class="stars">★★★★★</div><q>“${r[2]}”</q><div class="who"><i style="background:${colors[i % 8]}">${r[0][0]}</i><div><b>${r[0]}</b><small>${r[1]}</small></div></div></div>`;
const fill = (el, list) => { const h = list.map(rev).join(''); el.innerHTML = h + h; };
fill($('row1'), REVIEWS.slice(0, 4)); fill($('row2'), REVIEWS.slice(4));

// ---------- Menu mobile ----------
const nav = $('menu'), tg = document.querySelector('.nav-toggle');
tg.onclick = () => { const o = nav.classList.toggle('open'); tg.setAttribute('aria-expanded', o); };
nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('open'); });
const links = [...nav.querySelectorAll('a')];
const io = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
}), {rootMargin: '-40% 0px -55% 0px'});
['beranda', 'produk', 'tentang', 'kontak'].forEach(id => io.observe($(id)));

// ---------- Sinkron dengan admin (tab lain) ----------
const KEYS_SINKRON = ['techzone_barang', 'techzone_hidden_barang', 'techzone_banner_config', KEY_SUKA];
window.addEventListener('storage', e => {
  if (!e.key || KEYS_SINKRON.includes(e.key) || e.key.startsWith(CART_PREFIX)) { renderProduk(); renderCart(); }
});
window.addEventListener('focus', () => { renderProduk(); renderCart(); });

renderUser(); renderProduk(); renderCart();
