// =====================================================
// TECHZONE - INTERAKSI HALAMAN LOGIN
// (proses login sebenarnya ada di script.js -> login())
// =====================================================
(function () {
    const card = document.getElementById('tz-card');
    const views = { login: document.getElementById('view-login'), register: document.getElementById('view-register') };
    const loginErr = document.getElementById('login-error');
    const regErr = document.getElementById('register-error');
    const userInput = document.getElementById('login-username');
    const passInput = document.getElementById('login-password');

    function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    // Ingat saya
    const saved = safeGet('techzone_remember_user');
    if (saved) userInput.value = saved;
    document.getElementById('login-form').addEventListener('submit', () => {
        if (document.getElementById('remember-me').checked) safeSet('techzone_remember_user', userInput.value.trim());
        else { try { localStorage.removeItem('techzone_remember_user'); } catch (e) {} }
    });

    // Animasi goyang saat error muncul
    // (dipicu hanya saat teks error berubah, bukan saat class berubah -> tidak looping)
    new MutationObserver(() => {
        if (loginErr.classList.contains('hidden') || loginErr.classList.contains('ok')) return;
        loginErr.classList.remove('shake'); void loginErr.offsetWidth; loginErr.classList.add('shake');
    }).observe(loginErr, { childList: true, characterData: true, subtree: true });

    // Pindah Masuk <-> Daftar: view lama geser+pudar+mengecil, tinggi kartu dianimasikan,
    // view baru masuk dari sisi berlawanan. Input tidak pernah di-reset / di-disable,
    // jadi data yang sudah diketik tetap ada saat bolak-balik.
    const wrap = document.getElementById('tz-views');
    const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const OUT_MS = 260, IN_MS = 460;
    let busy = false;

    function swapNow(name, after) {
        Object.keys(views).forEach(k => views[k].classList.toggle('active', k === name));
        loginErr.classList.add('hidden'); regErr.classList.add('hidden');
        if (after) after();
    }
    function go(name, after) {
        const from = views.login.classList.contains('active') ? 'login' : 'register';
        if (busy || from === name) { if (from === name && after) after(); return; }
        if (reduced()) { swapNow(name, after); return; }
        busy = true;
        const dir = name === 'register' ? 1 : -1;               // Daftar masuk dari kanan, Masuk dari kiri
        const cur = views[from], next = views[name];
        cur.classList.add(dir > 0 ? 'out-l' : 'out-r');
        const h0 = wrap.offsetHeight;
        wrap.style.height = h0 + 'px';
        setTimeout(() => {
            cur.classList.remove('out-l', 'out-r');
            swapNow(name, after);
            next.classList.add(dir > 0 ? 'in-r' : 'in-l');
            wrap.style.height = 'auto';
            const h1 = wrap.offsetHeight;                        // tinggi view baru
            wrap.style.height = h0 + 'px'; void wrap.offsetHeight;
            wrap.style.height = h1 + 'px';                       // animasikan tinggi kartu
            setTimeout(() => {
                next.classList.remove('in-r', 'in-l');
                wrap.style.height = '';
                busy = false;
            }, IN_MS + 60);
        }, OUT_MS);
    }
    document.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); go(a.dataset.go); }));

    // Lihat / sembunyikan password
    document.querySelectorAll('[data-eye]').forEach(btn => btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.eye);
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.firstElementChild.className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    }));

    // Lupa password
    document.getElementById('forgot-link').addEventListener('click', e => {
        e.preventDefault();
        loginErr.textContent = 'Hubungi admin TechZone untuk reset password.';
        loginErr.classList.remove('hidden');
        loginErr.classList.add('ok');
    });

    // Daftar akun baru (disimpan di browser, dipakai login() di script.js)
    document.getElementById('register-form').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const username = document.getElementById('reg-username').value.trim().toLowerCase();
        const p1 = document.getElementById('reg-pass').value;
        const p2 = document.getElementById('reg-pass2').value;
        const fail = msg => { regErr.textContent = msg; regErr.classList.remove('hidden', 'ok', 'shake'); void regErr.offsetWidth; regErr.classList.add('shake'); };

        if (p1 !== p2) return fail('Konfirmasi password tidak sama.');
        const extra = JSON.parse(safeGet('techzone_extra_accounts') || '[]');
        const taken = USER_ACCOUNTS.concat(extra).some(a => a.username === username) || username === 'admin';
        if (taken) return fail('Username sudah dipakai.');

        extra.push({ name, shortName: name.split(' ')[0], username, password: p1 });
        safeSet('techzone_extra_accounts', JSON.stringify(extra));

        go('login', () => {
            userInput.value = username; passInput.value = '';
            loginErr.textContent = 'Akun berhasil dibuat. Silakan masuk.';
            loginErr.classList.remove('hidden', 'shake'); loginErr.classList.add('ok');
            passInput.focus();
        });
        e.target.reset();
    });
})();
