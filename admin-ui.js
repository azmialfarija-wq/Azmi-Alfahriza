// =====================================================
// TECHZONE ADMIN - RINGKASAN, GRAFIK, DAN MODE GELAP
// (data tetap dibaca dari script.js; CRUD ada di admin.html)
// =====================================================
(function () {
    const root = document.documentElement;
    const $ = (id) => document.getElementById(id);
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------------- Tema terang / gelap ----------------
    function setTheme(next, x, y) {
        const apply = () => {
            root.dataset.theme = next;
            try { localStorage.setItem('techzone_admin_theme', next); } catch (e) {}
        };
        if (!document.startViewTransition || reduce) return apply();
        const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        const t = document.startViewTransition(apply);
        t.ready.then(() => root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
            { duration: 650, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
        )).catch(() => {});
    }
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#theme-toggle');
        if (!btn) return;
        const b = btn.getBoundingClientRect();
        setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', b.left + b.width / 2, b.top + b.height / 2);
        redrawAfterTheme();
    });
    function redrawAfterTheme() { /* warna grafik memakai CSS variable, tidak perlu digambar ulang */ }

    // ---------------- Pembantu ----------------
    const DAY = 86400000;
    const short = (n) => n >= 1e9 ? (n / 1e9).toFixed(1).replace('.0', '') + ' M'
                       : n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '') + ' jt'
                       : n >= 1e3 ? Math.round(n / 1e3) + ' rb' : String(Math.round(n));
    const idr = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
    function saleDate(t) {
        if (t.tanggalISO) { const d = new Date(t.tanggalISO); return isNaN(d) ? null : d; }
        const m = String(t.tanggal || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
    }
    const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

    function countUp(el, to, fmt) {
        if (!el) return;
        if (reduce) { el.innerHTML = fmt(to); return; }
        const from = Number(el.dataset.v || 0); el.dataset.v = to;
        const t0 = performance.now(), dur = 800;
        (function tick(now) {
            const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
            el.innerHTML = fmt(from + (to - from) * e);
            if (p < 1) requestAnimationFrame(tick);
        })(t0);
    }
    function trendHtml(cur, prev) {
        if (!prev && !cur) return '<span class="trend flat">&ndash; 0%</span>';
        if (!prev) return '<span class="trend up"><i class="fa-solid fa-arrow-trend-up"></i> baru</span>';
        const pct = (cur - prev) / prev * 100;
        const cls = Math.abs(pct) < 0.5 ? 'flat' : pct > 0 ? 'up' : 'down';
        const ico = cls === 'up' ? 'fa-arrow-trend-up' : cls === 'down' ? 'fa-arrow-trend-down' : 'fa-minus';
        return `<span class="trend ${cls}"><i class="fa-solid ${ico}"></i> ${pct > 0 ? '+' : ''}${pct.toFixed(1)}%</span>`;
    }

    let range = 14;

    // ---------------- Ringkasan ----------------
    window.refreshDashboard = function () {
        if (!$('stat-revenue')) return;
        const sales = (typeof getPenjualan === 'function' ? getPenjualan() : []).filter(Boolean);
        const hidden = new Set(readStore('techzone_hidden_barang', []).map(String));
        const produk = getBarang().filter(b => !hidden.has(String(b.id)));
        const pelanggan = getPelanggan();

        const total = sales.reduce((s, t) => s + Number(t.total || 0), 0);
        const today = startOfDay(new Date());
        const inRange = (t, from, to) => { const d = saleDate(t); return d && d >= from && d < to; };
        const w1 = sales.filter(t => inRange(t, new Date(today - 6 * DAY), new Date(+today + DAY)));
        const w0 = sales.filter(t => inRange(t, new Date(today - 13 * DAY), new Date(today - 6 * DAY)));
        const sum = (a) => a.reduce((s, t) => s + Number(t.total || 0), 0);

        countUp($('stat-revenue'), total, v => `<small>Rp</small>${Math.round(v).toLocaleString('id-ID')}`);
        $('stat-revenue-trend').innerHTML = trendHtml(sum(w1), sum(w0)) + ' <span>vs 7 hari sebelumnya</span>';
        countUp($('stat-trx'), sales.length, v => Math.round(v).toLocaleString('id-ID'));
        $('stat-trx-foot').innerHTML = trendHtml(w1.length, w0.length) + ` <span>rata-rata ${idr(sales.length ? total / sales.length : 0)}</span>`;
        countUp($('stat-cust'), pelanggan.length, v => Math.round(v).toLocaleString('id-ID'));
        const buyers = new Set(sales.map(t => String(t.pelanggan || '').toLowerCase())).size;
        $('stat-cust-foot').innerHTML = `<span class="trend up"><i class="fa-solid fa-user-check"></i> ${buyers}</span> <span>pernah bertransaksi</span>`;
        countUp($('stat-prod'), produk.length, v => Math.round(v).toLocaleString('id-ID'));
        const low = produk.filter(b => Number(b.stok) <= 5).length;
        $('stat-prod-foot').innerHTML = low
            ? `<span class="trend down"><i class="fa-solid fa-triangle-exclamation"></i> ${low}</span> <span>stok menipis (≤ 5)</span>`
            : `<span class="trend up"><i class="fa-solid fa-circle-check"></i> Aman</span> <span>semua stok cukup</span>`;

        drawArea(sales);
        drawDonut(sales);
        drawRank(produk, sales);
        drawRecent(sales);
    };

    // ---------------- Grafik area ----------------
    function drawArea(sales) {
        const svg = $('area-chart'); if (!svg) return;
        const today = startOfDay(new Date());
        const days = Array.from({ length: range }, (_, i) => new Date(+today - (range - 1 - i) * DAY));
        const map = new Map(days.map(d => [keyOf(d), 0]));
        let periodTotal = 0, trxCount = 0;
        sales.forEach(t => { const d = saleDate(t); if (!d) return; const k = keyOf(d); if (map.has(k)) { map.set(k, map.get(k) + Number(t.total || 0)); periodTotal += Number(t.total || 0); trxCount++; } });
        const vals = days.map(d => map.get(keyOf(d)));
        $('area-sub').textContent = `${idr(periodTotal)} dari ${trxCount} transaksi dalam ${range} hari terakhir`;

        const W = 720, H = 270, L = 52, R = 14, T = 14, B = 30;
        const max = Math.max(...vals, 1);
        const step = Math.pow(10, Math.floor(Math.log10(max)));
        const top = Math.ceil(max / step) * step;
        const x = (i) => L + (range === 1 ? 0 : i * (W - L - R) / (range - 1));
        const y = (v) => T + (H - T - B) * (1 - v / top);
        const pts = vals.map((v, i) => [x(i), y(v)]);

        // kurva halus (Catmull-Rom -> Bezier)
        let d = `M${pts[0][0]},${pts[0][1]}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
            const lo = T, hi = H - B, cl = (v) => Math.max(lo, Math.min(hi, v));
            const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = cl(p1[1] + (p2[1] - p0[1]) / 6);
            const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = cl(p2[1] - (p3[1] - p1[1]) / 6);
            d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
        }
        const area = `${d} L${x(range - 1)},${H - B} L${x(0)},${H - B} Z`;
        let grid = '';
        for (let i = 0; i <= 4; i++) {
            const v = top * i / 4, yy = y(v);
            grid += `<line class="grid" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text x="${L - 10}" y="${yy + 4}" text-anchor="end">${short(v)}</text>`;
        }
        const every = range <= 7 ? 1 : range <= 14 ? 2 : 5;
        const labels = days.map((dd, i) => (i % every === 0 || i === range - 1) ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${dd.getDate()}/${dd.getMonth() + 1}</text>` : '').join('');

        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        svg.innerHTML = `
            <defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#ffd21f" stop-opacity=".38"/><stop offset="1" stop-color="#ffd21f" stop-opacity="0"/>
            </linearGradient></defs>
            ${grid}${labels}
            <path d="${area}" fill="url(#areaFill)"/>
            <path class="line" d="${d}"/>
            <line class="cursor" id="area-cursor" y1="${T}" y2="${H - B}"/>
            <circle class="dot" id="area-dot" r="5"/>`;
        const line = svg.querySelector('.line');
        line.style.setProperty('--len', Math.ceil(line.getTotalLength ? line.getTotalLength() : 2000) + 10);

        const tip = $('area-tip'), cursor = $('area-cursor'), dot = $('area-dot');
        const wrap = svg.parentElement;
        svg.onmousemove = svg.ontouchmove = (ev) => {
            const pt = ev.touches ? ev.touches[0] : ev;
            const rect = svg.getBoundingClientRect();
            const px = (pt.clientX - rect.left) / rect.width * W;
            let idx = Math.round((px - L) / ((W - L - R) / Math.max(range - 1, 1)));
            idx = Math.max(0, Math.min(range - 1, idx));
            const [cx, cy] = pts[idx];
            cursor.setAttribute('x1', cx); cursor.setAttribute('x2', cx); cursor.style.opacity = 1;
            dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.style.opacity = 1;
            tip.innerHTML = `${idr(vals[idx])}<small>${days[idx].toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</small>`;
            tip.style.left = (cx / W * rect.width + (svg.getBoundingClientRect().left - wrap.getBoundingClientRect().left)) + 'px';
            tip.style.top = (cy / H * rect.height) + 'px';
            tip.style.opacity = 1;
        };
        svg.onmouseleave = svg.ontouchend = () => { tip.style.opacity = 0; cursor.style.opacity = 0; dot.style.opacity = 0; };
    }

    // ---------------- Donut kategori ----------------
    function drawDonut(sales) {
        const cats = ['laptop', 'hp', 'mouse', 'ipad'];
        const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)'];
        const seedCat = new Map((typeof PRODUCT_SEED !== 'undefined' ? PRODUCT_SEED : []).map(p => [p.nama, p.kategori]));
        const by = Object.fromEntries(cats.map(c => [c, 0]));
        sales.forEach(t => {
            const c = t.kategori || seedCat.get(t.barang) || (getBarang().find(b => b.nama === t.barang) || {}).kategori;
            if (c in by) by[c] += Number(t.total || 0);
        });
        const sum = cats.reduce((s, c) => s + by[c], 0) || 1;
        let off = 0, rings = '';
        cats.forEach((c, i) => {
            const pct = by[c] / sum * 100;
            if (pct < 0.5) return;
            rings += `<circle r="15.9155" cx="18" cy="18" stroke="${colors[i]}" stroke-dasharray="${Math.max(pct - 0.8, 0)} ${100 - Math.max(pct - 0.8, 0)}" stroke-dashoffset="${-off}" stroke-linecap="round"/>`;
            off += pct;
        });
        $('donut-svg').innerHTML = `<circle class="ring-bg" r="15.9155" cx="18" cy="18"/>${rings}`;
        $('donut-total').textContent = short(sum === 1 && !sales.length ? 0 : sum);
        $('donut-legend').innerHTML = cats.map((c, i) =>
            `<div><i style="background:${colors[i]}"></i>${kategoriLabel(c)}<span>${(by[c] / sum * 100).toFixed(0)}%</span></div>`).join('');
    }

    // ---------------- Produk terfavorit ----------------
    function drawRank(produk, sales) {
        const sold = {};
        (sales || []).forEach(t => { sold[t.barang] = (sold[t.barang] || 0) + 1; });
        const score = (r) => r.sold * 3 + r.likes * 2 + r.cart;
        const rows = produk.map(b => ({ b, likes: getLikeCount(b.id), cart: getCartQty(b.id), sold: sold[b.nama] || 0 }))
            .sort((a, c) => score(c) - score(a)).slice(0, 5);
        const maxScore = Math.max(...rows.map(score), 1);
        $('rank-list').innerHTML = rows.some(r => score(r)) ? rows.map(r => `
            <div class="rank-row">
                <img src="${esc(r.b.gambar || FALLBACK_IMAGE)}" alt="" onerror="this.src='${FALLBACK_IMAGE}'">
                <div><b title="${esc(r.b.nama)}">${esc(r.b.nama)}</b><div class="bar"><i data-w="${score(r) / maxScore * 100}"></i></div></div>
                <em title="Terjual · Disukai · Di keranjang"><i class="fa-solid fa-bag-shopping" style="color:var(--ok)"></i>${r.sold} <i class="fa-solid fa-heart"></i>${r.likes} <i class="fa-solid fa-cart-shopping" style="color:var(--muted)"></i>${r.cart}</em>
            </div>`).join('') : '<div class="empty-note">Belum ada penjualan, produk disukai, atau keranjang.</div>';
        requestAnimationFrame(() => requestAnimationFrame(() =>
            document.querySelectorAll('#rank-list .bar i').forEach(i => i.style.width = i.dataset.w + '%')));
    }

    // ---------------- Transaksi terbaru ----------------
    function drawRecent(sales) {
        const latest = sales.slice().sort((a, b) => (saleDate(b) || 0) - (saleDate(a) || 0)).slice(0, 6);
        $('recent-body').innerHTML = latest.map(t => `
            <tr><td><b>${esc(t.id)}</b></td><td>${esc(t.pelanggan)}</td><td>${esc(t.barang)}</td>
            <td>${esc(t.metode || '-')}</td><td><span class="status-active">${esc(t.status || 'LUNAS')}</span></td><td><b>${rupiah(t.total)}</b></td></tr>`).join('')
            || '<tr><td colspan="6" class="empty-row">Belum ada transaksi.</td></tr>';
    }

    // ---------------- Kontrol ----------------
    document.addEventListener('click', (e) => {
        const b = e.target.closest('[data-range]'); if (!b) return;
        range = Number(b.dataset.range);
        document.querySelectorAll('[data-range]').forEach(x => x.classList.toggle('on', x === b));
        refreshDashboard();
    });
    document.addEventListener('input', (e) => {
        if (e.target.id !== 'search-barang') return;
        const q = e.target.value.trim().toLowerCase();
        document.querySelectorAll('#table-barang tr').forEach(tr => { tr.style.display = !q || tr.textContent.toLowerCase().includes(q) ? '' : 'none'; });
    });
})();
