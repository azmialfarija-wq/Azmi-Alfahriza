// =====================================================
// TECHZONE STORE - DATA, LOGIN, DAN FUNGSI BERSAMA
// Dipakai oleh index.html, pengguna.html, dan admin.html
// =====================================================

const DEMO_PASSWORD = 'techzone123';

// Naikkan angka ini setiap kali PRODUCT_SEED diubah (foto, harga, stok, spesifikasi)
// supaya data lama di localStorage browser ikut diperbarui.
const DATA_VERSION = '10';

const FALLBACK_IMAGE = 'images/placeholder.svg';

// Label untuk tabel spesifikasi (urutan = urutan tampil)
const SPEC_LABELS = {
    prosesor: 'Prosesor',
    grafis: 'Grafis',
    ram: 'Memori (RAM)',
    penyimpanan: 'Penyimpanan',
    layar: 'Layar',
    kamera: 'Kamera',
    sensor: 'Sensor',
    dpi: 'DPI maksimum',
    koneksi: 'Koneksi',
    tombol: 'Jumlah tombol',
    berat: 'Berat',
    baterai: 'Baterai',
    os: 'Sistem operasi'
};

// Pembantu penulisan spesifikasi laptop
function spek(prosesor, grafis, ram, penyimpanan, layar, os = 'Windows 11 Home') {
    return { prosesor, grafis, ram, penyimpanan, layar, os };
}

// Pembantu penulisan spesifikasi HP
function spekHp(prosesor, ram, penyimpanan, layar, kamera, baterai, os = 'Android') {
    return { prosesor, ram, penyimpanan, layar, kamera, baterai, os };
}

// Pembantu penulisan spesifikasi tablet / iPad
function spekTablet(prosesor, ram, penyimpanan, layar, kamera, baterai, os) {
    return { prosesor, ram, penyimpanan, layar, kamera, baterai, os };
}

// Pembantu penulisan spesifikasi mouse (isi null kalau datanya tidak ada)
function spekMouse(sensor, dpi, koneksi, tombol, berat, baterai = null) {
    return { sensor, dpi, koneksi, tombol, berat, baterai };
}

// ---------------------------------------------------------------
// KATALOG PRODUK
// - gambar      : path foto produk (taruh file di folder images/)
// - spesifikasi : opsional. Kalau diisi, kartu produk menampilkan
//                 tombol info (i). Spesifikasi laptop di bawah adalah
//                 konfigurasi umum tiap model, sesuaikan dengan varian
//                 yang kamu jual.
// ---------------------------------------------------------------
const PRODUCT_SEED = [
    // ---------- LAPTOP (10) ----------
    {
        id: 1, nama: 'ASUS ROG Strix G15', kategori: 'laptop', harga: 18500000, stok: 8,
        gambar: 'images/asus-rog-strix-g15.jpg',
        spesifikasi: spek('AMD Ryzen 7 6800H', 'NVIDIA GeForce RTX 3060 6GB', '16GB DDR5', '512GB SSD NVMe', '15.6" FHD 144Hz')
    },
    {
        id: 2, nama: 'MacBook Air M2 256GB', kategori: 'laptop', harga: 16999000, stok: 10,
        gambar: 'images/macbook-air-m2.jpg',
        spesifikasi: spek('Apple M2 (8-core CPU)', 'Apple GPU 8-core', '8GB Unified Memory', '256GB SSD', '13.6" Liquid Retina', 'macOS')
    },
    {
        id: 3, nama: 'Acer Nitro V15', kategori: 'laptop', harga: 12499000, stok: 12,
        gambar: 'images/acer-nitro-v15.jpg',
        spesifikasi: spek('Intel Core i5-13420H', 'NVIDIA GeForce RTX 3050 6GB', '16GB DDR5', '512GB SSD NVMe', '15.6" FHD 144Hz')
    },
    {
        id: 4, nama: 'Lenovo LOQ 15', kategori: 'laptop', harga: 14999000, stok: 9,
        gambar: 'images/lenovo-loq-15.jpg',
        spesifikasi: spek('Intel Core i5-12450HX', 'NVIDIA GeForce RTX 4050 6GB', '16GB DDR5', '512GB SSD NVMe', '15.6" FHD 144Hz')
    },
    {
        id: 5, nama: 'HP Victus 15', kategori: 'laptop', harga: 13299000, stok: 11,
        gambar: 'images/hp-victus-15.jpg',
        spesifikasi: spek('Intel Core i5-12450H', 'NVIDIA GeForce RTX 3050 4GB', '16GB DDR4', '512GB SSD NVMe', '15.6" FHD 144Hz')
    },
    {
        id: 6, nama: 'MSI Katana 15', kategori: 'laptop', harga: 15699000, stok: 7,
        gambar: 'images/msi-katana-15.jpg',
        spesifikasi: spek('Intel Core i7-13620H', 'NVIDIA GeForce RTX 4060 8GB', '16GB DDR5', '512GB SSD NVMe', '15.6" FHD 144Hz')
    },
    {
        id: 7, nama: 'Acer Aspire 5', kategori: 'laptop', harga: 8999000, stok: 15,
        gambar: 'images/acer-aspire-5.jpg',
        spesifikasi: spek('Intel Core i7-1355U', 'Intel Iris Xe Graphics', '16GB LPDDR5', '512GB SSD', '15.6" FHD IPS')
    },
    {
        id: 8, nama: 'Lenovo IdeaPad Slim 3', kategori: 'laptop', harga: 7499000, stok: 14,
        gambar: 'images/lenovo-ideapad-slim-3.jpg',
        spesifikasi: spek('Intel Core i7-13620H', 'Intel UHD Graphics', '16GB RAM', '512GB SSD', '15.6" FHD (1920x1080)')
    },
    {
        id: 9, nama: 'ASUS Vivobook 14', kategori: 'laptop', harga: 8299000, stok: 13,
        gambar: 'images/asus-vivobook-14.jpg',
        spesifikasi: spek('Intel Core i5-1235U', 'Intel Iris Xe Graphics', '8GB DDR4', '512GB SSD NVMe', '14" FHD IPS')
    },
    {
        id: 10, nama: 'Dell Inspiron 14', kategori: 'laptop', harga: 9299000, stok: 10,
        gambar: 'images/dell-inspiron-14.jpg',
        spesifikasi: spek('Intel Core Ultra 7', 'Intel Arc Graphics', '16GB LPDDR5x', '512GB SSD NVMe', '14" FHD+ IPS')
    },

    // ---------- HP (10) ----------
    {
        id: 11, nama: 'Samsung Galaxy S24 Ultra', kategori: 'hp', harga: 20499000, stok: 10,
        gambar: 'images/samsung-galaxy-s24-ultra.jpg',
        spesifikasi: spekHp('Snapdragon 8 Gen 3 for Galaxy', '12GB', '256GB', '6.8" QHD+ Dynamic AMOLED 2X 120Hz', '200MP utama + 50MP + 12MP + 10MP', '5000 mAh, 45W', 'Android (One UI)')
    },
    {
        id: 12, nama: 'iPhone 15 Pro 128GB', kategori: 'hp', harga: 17299000, stok: 10,
        gambar: 'images/iphone-15-pro.jpg',
        spesifikasi: spekHp('Apple A17 Pro', '8GB', '128GB', '6.1" Super Retina XDR OLED 120Hz', '48MP utama + 12MP + 12MP', 'Hingga 23 jam video', 'iOS')
    },
    {
        id: 13, nama: 'Google Pixel 9', kategori: 'hp', harga: 13999000, stok: 8,
        gambar: 'images/google-pixel-9.jpg',
        spesifikasi: spekHp('Google Tensor G4', '12GB', '128GB', '6.3" Actua OLED 120Hz', '50MP utama + 48MP ultrawide', '4700 mAh, 27W', 'Android')
    },
    {
        id: 14, nama: 'Xiaomi 14', kategori: 'hp', harga: 10999000, stok: 12,
        gambar: 'images/xiaomi-14.jpg',
        spesifikasi: spekHp('Snapdragon 8 Gen 3', '12GB', '256GB', '6.36" LTPO AMOLED 120Hz', '50MP Leica triple kamera', '4610 mAh, 90W', 'Android (HyperOS)')
    },
    {
        id: 15, nama: 'OPPO Find X8', kategori: 'hp', harga: 12499000, stok: 9,
        gambar: 'images/oppo-find-x8.jpg',
        spesifikasi: spekHp('MediaTek Dimensity 9400', '12GB', '256GB', '6.59" AMOLED 120Hz', '50MP Hasselblad triple kamera', '5630 mAh, 80W', 'Android (ColorOS)')
    },
    {
        id: 16, nama: 'vivo X200', kategori: 'hp', harga: 11999000, stok: 9,
        gambar: 'images/vivo-x200.jpg',
        spesifikasi: spekHp('MediaTek Dimensity 9400', '12GB', '256GB', '6.67" AMOLED 120Hz', '50MP ZEISS triple kamera', '5800 mAh, 90W', 'Android (Funtouch OS)')
    },
    {
        id: 17, nama: 'Samsung Galaxy A55', kategori: 'hp', harga: 5999000, stok: 16,
        gambar: 'images/samsung-galaxy-a55.jpg',
        spesifikasi: spekHp('Exynos 1480', '8GB', '256GB', '6.6" Super AMOLED 120Hz', '50MP utama + 12MP + 5MP', '5000 mAh, 25W', 'Android (One UI)')
    },
    {
        id: 18, nama: 'Redmi Note 13 Pro', kategori: 'hp', harga: 4299000, stok: 18,
        gambar: 'images/redmi-note-13-pro.jpg',
        spesifikasi: spekHp('MediaTek Helio G99-Ultra', '8GB', '256GB', '6.67" AMOLED 120Hz', '200MP utama + 8MP + 2MP', '5000 mAh, 67W', 'Android (HyperOS)')
    },
    {
        id: 19, nama: 'Realme GT 6', kategori: 'hp', harga: 7499000, stok: 13,
        gambar: 'images/realme-gt-6.jpg',
        spesifikasi: spekHp('Snapdragon 8s Gen 3', '12GB', '256GB', '6.78" LTPO AMOLED 120Hz', '50MP Sony LYT-808 + 50MP + 8MP', '5500 mAh, 120W', 'Android (realme UI)')
    },
    {
        id: 20, nama: 'Infinix GT 20 Pro', kategori: 'hp', harga: 4299000, stok: 17,
        gambar: 'images/infinix-gt-20-pro.jpg',
        spesifikasi: spekHp('MediaTek Dimensity 8200 Ultimate', '8GB', '256GB', '6.78" AMOLED 144Hz', '108MP utama + 2MP + 2MP', '5000 mAh, 45W', 'Android (XOS)')
    },

    // ---------- MOUSE (10) ----------
    {
        id: 21, nama: 'Logitech G Pro Wireless', kategori: 'mouse', harga: 1499000, stok: 15,
        gambar: 'images/logitech-g-pro-wireless.jpg',
        spesifikasi: spekMouse('HERO 25K', '25.600', 'Wireless LIGHTSPEED 2.4GHz', '8 tombol', '80 g', 'Hingga 60 jam')
    },
    {
        id: 22, nama: 'Logitech G502 Hero', kategori: 'mouse', harga: 899000, stok: 18,
        gambar: 'images/logitech-g502-hero.jpg',
        spesifikasi: spekMouse('HERO 25K', '25.600', 'USB berkabel', '11 tombol', '121 g (tanpa bobot tambahan)')
    },
    {
        id: 23, nama: 'Razer DeathAdder V2', kategori: 'mouse', harga: 799000, stok: 12,
        gambar: 'images/razer-deathadder-v2.jpg',
        spesifikasi: spekMouse('Razer Focus+ optik', '20.000', 'USB berkabel', '8 tombol', '82 g')
    },
    {
        id: 24, nama: 'Razer Basilisk V3', kategori: 'mouse', harga: 949000, stok: 11,
        gambar: 'images/razer-basilisk-v3.jpg',
        spesifikasi: spekMouse('Razer Focus+ optik', '26.000', 'USB berkabel', '11 tombol', '101 g')
    },
    {
        id: 25, nama: 'Fantech Helios XD5', kategori: 'mouse', harga: 599000, stok: 20,
        gambar: 'images/fantech-helios-xd5.jpg',
        spesifikasi: spekMouse('PixArt PAW3370', '19.000', 'Wireless 2.4GHz / kabel USB-C', '6 tombol', '72 g', 'Hingga 40 jam')
    },
    {
        id: 26, nama: 'Fantech Crypto VX7', kategori: 'mouse', harga: 449000, stok: 20,
        gambar: 'images/fantech-crypto-vx7.jpg',
        spesifikasi: spekMouse(null, '8.000', 'USB berkabel', '6 tombol (programmable)', '84 g')
    },
    {
        id: 27, nama: 'HyperX Pulsefire Haste', kategori: 'mouse', harga: 699000, stok: 14,
        gambar: 'images/hyperx-pulsefire-haste.jpg',
        spesifikasi: spekMouse('PixArt 3335', '16.000', 'USB berkabel', '6 tombol', '59 g')
    },
    {
        id: 28, nama: 'SteelSeries Rival 3', kategori: 'mouse', harga: 499000, stok: 16,
        gambar: 'images/steelseries-rival-3.jpg',
        spesifikasi: spekMouse('TrueMove Core', '8.500', 'USB berkabel', '6 tombol', '77 g')
    },
    {
        id: 29, nama: 'Corsair Harpoon RGB', kategori: 'mouse', harga: 579000, stok: 13,
        gambar: 'images/corsair-harpoon-rgb.jpg',
        spesifikasi: spekMouse('Optik', '6.000', 'USB berkabel', '6 tombol', '85 g')
    },
    {
        id: 30, nama: 'Aula SC580', kategori: 'mouse', harga: 299000, stok: 22,
        gambar: 'images/aula-sc580.jpg',
        spesifikasi: spekMouse(null, '10.000 - 12.000 (6 level)', 'Tri-mode: 2.4GHz, Bluetooth 5.0, USB-C', '6 tombol', '82 g', '500 mAh, hingga 10-14 hari')
    },

    // ---------- IPAD / TABLET (10) ---------- (foto & spesifikasi belum diisi)
    { id: 31, nama: 'iPad Pro 13 M4',          kategori: 'ipad', harga: 24999000, stok: 7,  gambar: 'images/ipad-pro-13-m4.jpg',
        spesifikasi: spekTablet('Apple M4 (CPU 9-10 core)', '8GB', '256GB', '13" Ultra Retina XDR OLED 120Hz', '12MP belakang + 12MP depan', 'Hingga 10 jam pemakaian, USB-C', 'iPadOS')
    },
    { id: 32, nama: 'iPad Air M2 11',          kategori: 'ipad', harga: 10999000, stok: 10, gambar: 'images/ipad-air-m2-11.jpg',
        spesifikasi: spekTablet('Apple M2 (CPU 8 core)', '8GB', '128GB', '11" Liquid Retina IPS 60Hz', '12MP belakang + 12MP depan', 'Hingga 10 jam pemakaian, USB-C', 'iPadOS')
    },
    { id: 33, nama: 'iPad 10th Gen 64GB',      kategori: 'ipad', harga: 7499000,  stok: 12, gambar: 'images/ipad-10th-gen-64gb.jpg',
        spesifikasi: spekTablet('Apple A14 Bionic', '4GB', '64GB', '10.9" Liquid Retina IPS 60Hz', '12MP belakang + 12MP depan', 'Hingga 10 jam pemakaian, USB-C', 'iPadOS')
    },
    { id: 34, nama: 'iPad Mini 7',             kategori: 'ipad', harga: 9499000,  stok: 9,  gambar: 'images/ipad-mini-7.jpg',
        spesifikasi: spekTablet('Apple A17 Pro', '8GB', '128GB', '8.3" Liquid Retina IPS 60Hz', '12MP belakang + 12MP depan', 'Hingga 10 jam pemakaian, USB-C', 'iPadOS')
    },
    { id: 35, nama: 'Samsung Galaxy Tab S10',  kategori: 'ipad', harga: 11999000, stok: 8,  gambar: 'images/samsung-galaxy-tab-s10.jpg',
        spesifikasi: spekTablet('Exynos 1580', '8GB', '128GB', '10.9" LCD 90Hz', '13MP belakang + 12MP depan', '8000 mAh, 45W (S Pen termasuk)', 'Android (One UI)')
    },
    { id: 36, nama: 'Samsung Galaxy Tab A9+',  kategori: 'ipad', harga: 3999000,  stok: 15, gambar: 'images/samsung-galaxy-tab-a9-plus.jpg',
        spesifikasi: spekTablet('Snapdragon 695', '4GB', '64GB', '11" LCD 90Hz', '8MP belakang + 5MP depan', '7040 mAh, 15W', 'Android (One UI)')
    },
    { id: 37, nama: 'Xiaomi Pad 7',            kategori: 'ipad', harga: 5999000,  stok: 13, gambar: 'images/xiaomi-pad-7.jpg',
        spesifikasi: spekTablet('Snapdragon 7+ Gen 3', '8GB', '128GB', '11.2" IPS 3.2K 144Hz', '13MP belakang + 8MP depan', '8850 mAh, 45W', 'Android (HyperOS 2)')
    },
    { id: 38, nama: 'Lenovo Tab P12',          kategori: 'ipad', harga: 4999000,  stok: 12, gambar: 'images/lenovo-tab-p12.jpg',
        spesifikasi: spekTablet('MediaTek Dimensity 7050', '8GB', '128GB', '12.7" LCD 3K 60Hz', '8MP belakang + 13MP depan', '10200 mAh, 45W', 'Android')
    },
    { id: 39, nama: 'Huawei MatePad 11.5',     kategori: 'ipad', harga: 5999000,  stok: 10, gambar: 'images/huawei-matepad-11-5.jpg',
        spesifikasi: spekTablet('Snapdragon 7 Gen 1', '8GB', '128GB', '11.5" IPS 2.2K 120Hz', '13MP belakang + 8MP depan', '7700 mAh, 22.5W', 'HarmonyOS')
    },
    { id: 40, nama: 'Redmi Pad Pro',           kategori: 'ipad', harga: 4499000,  stok: 14, gambar: 'images/redmi-pad-pro.jpg',
        spesifikasi: spekTablet('Snapdragon 7s Gen 2', '6GB', '128GB', '12.1" IPS 2.5K 120Hz', '8MP belakang + 8MP depan', '10000 mAh, 33W', 'Android (HyperOS)')
    }
];

// ---------------------------------------------------------------
// PENYIMPANAN (localStorage)
// ---------------------------------------------------------------
function readStore(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (e) {
        return fallback;
    }
}

function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

const getBarang = () => readStore('techzone_barang');
const saveBarangList = (list) => writeStore('techzone_barang', list);
const getPelanggan = () => readStore('techzone_pelanggan');
const getPenjualan = () => readStore('techzone_penjualan');

const USER_ACCOUNTS = [
    { username: 'azmi', password: 'azmi123', name: 'Azmi Alfahriza', shortName: 'Azmi' },
    { username: 'davriel', password: 'davriel123', name: 'davriel saddad Eko saputra', shortName: 'davriel' },
    { username: 'dea', password: 'dea123', name: 'dea amellya', shortName: 'Dea' }
];

function initializeDatabase() {
    // Katalog bawaan selalu tersedia. Data custom tetap dipertahankan.
    const oldBarang = getBarang();
    const existing = Array.isArray(oldBarang) ? oldBarang : [];
    const existingById = new Map(existing.map(b => [Number(b.id), b]));
    const seeded = PRODUCT_SEED.map(seed => ({ ...seed, ...(existingById.get(seed.id) || {}) }));
    // Deduplikasi katalog berdasarkan nama produk. Produk bawaan (seed) selalu
    // menjadi sumber utama, sehingga produk seperti ASUS ROG Strix G15 tidak
    // bisa muncul dua kali akibat data lama/localStorage atau hasil tambah ulang.
    const seenNames = new Set();
    const uniqueSeeded = [];
    for (const item of seeded) {
        const key = String(item.nama || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (!key || seenNames.has(key)) continue;
        seenNames.add(key);
        uniqueSeeded.push(item);
    }
    const extras = existing.filter(b => Number(b.id) > 1000).filter(b => {
        const key = String(b.nama || '').trim().toLowerCase().replace(/\s+/g, ' ');
        if (!key || seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
    });
    const categoryOrder = { laptop: 0, hp: 1, mouse: 2, ipad: 3 };
    extras.sort((a,b) => (categoryOrder[a.kategori] ?? 99) - (categoryOrder[b.kategori] ?? 99) || Number(a.id)-Number(b.id));
    saveBarangList([...uniqueSeeded, ...extras]);
    localStorage.setItem('techzone_data_version', DATA_VERSION);

    // Tepat 20 pelanggan demo, termasuk 3 akun wajib.
    const customerNames = [
        ['USR-azmi','Azmi','Azmi Alfahriza','azmi'],
        ['USR-davriel','davriel','davriel saddad Eko saputra','davriel'],
        ['USR-dea','Dea','dea amellya','dea'],
        ['USR-004','Rizky','Rizky Pratama','rizky'],
        ['USR-005','Fajar','Fajar Ramadhan','fajar'],
        ['USR-006','Nabila','Nabila Putri','nabila'],
        ['USR-007','Dimas','Dimas Saputra','dimas'],
        ['USR-008','Aulia','Aulia Rahma','aulia'],
        ['USR-009','Bagas','Bagas Maulana','bagas'],
        ['USR-010','Salsa','Salsa Maharani','salsa'],
        ['USR-011','Raka','Raka Firmansyah','raka'],
        ['USR-012','Intan','Intan Permata','intan'],
        ['USR-013','Yoga','Yoga Kurniawan','yoga'],
        ['USR-014','Putri','Putri Amelia','putri'],
        ['USR-015','Arif','Arif Hidayat','arif'],
        ['USR-016','Citra','Citra Lestari','citra'],
        ['USR-017','Bima','Bima Aditya','bima'],
        ['USR-018','Vina','Vina Oktaviani','vina'],
        ['USR-019','Rian','Rian Akbar','rian'],
        ['USR-020','Maya','Maya Sari','maya']
    ];
    const oldCustomers = getPelanggan();
    const byUsername = new Map((Array.isArray(oldCustomers) ? oldCustomers : []).map(x => [x.username, x]));
    const deletedCustomers = new Set(readStore('techzone_deleted_customers', []).map(String));
    const pelanggan = customerNames
        .filter(([id]) => !deletedCustomers.has(id))
        .map(([id,nama,namaLengkap,username]) => ({
            ...(byUsername.get(username) || {}), id, nama, namaLengkap, username, status: 'Aktif'
        }));
    writeStore('techzone_pelanggan', pelanggan);

    // Pastikan ada riwayat untuk SEMUA 20 pelanggan, bukan hanya Azmi/davriel/Dea.
    const oldSales = getPenjualan();
    let sales = Array.isArray(oldSales) ? oldSales : [];
    const methods = ['BCA','BRI','Mandiri','BNI','BSI','QRIS','Bank Jago','Bank Lainnya'];
    const demoProducts = PRODUCT_SEED;
    const now = new Date();
    const existingCustomerNames = new Set(sales.map(x => String(x?.pelanggan || '').toLowerCase()));
    const fullByShort = new Map(customerNames.map(([,short,full]) => [short.toLowerCase(), full]));
    // Normalisasi transaksi lama ke nama yang sama dengan tabel pelanggan.
    sales = sales.map(t => {
        const raw = String(t?.pelanggan || '');
        const normalized = fullByShort.get(raw.toLowerCase()) || (raw === 'Azmi Alfahriza' ? 'Azmi Alfahriza' : raw);
        return normalized ? { ...t, pelanggan: normalized } : t;
    });
    const existingFullNames = new Set(sales.map(x => String(x?.pelanggan || '').toLowerCase()));
    customerNames.forEach(([id,short,full], index) => {
        if (existingFullNames.has(full.toLowerCase())) return;
        const product = demoProducts[index % demoProducts.length];
        const d = new Date(now);
        d.setDate(now.getDate() - (index % 10));
        d.setHours(9 + (index % 9), (index * 7) % 60, 0, 0);
        sales.push({
            id: `TRX-DEMO-${String(index + 1).padStart(3,'0')}`,
            tanggal: d.toLocaleString('id-ID'), tanggalISO: d.toISOString(),
            pelanggan: full, barang: product.nama, kategori: product.kategori,
            total: product.harga, hargaAsli: product.harga, diskon: 0,
            status: 'LUNAS', metode: methods[index % methods.length], pengiriman: 'Siap diambil/diantar'
        });
    });
    // Jika masih ada transaksi lama dengan nama user generik, sebar ke pelanggan yang tersedia.
    const customers = pelanggan.map(p => p.namaLengkap);
    sales = sales.map((t,i) => {
        const raw = String(t?.pelanggan || '').trim();
        if (!raw || raw.toLowerCase() === 'user' || raw.toLowerCase() === 'pelanggan') {
            return { ...t, pelanggan: customers[i % customers.length] };
        }
        return t;
    });
    writeStore('techzone_penjualan', sales);
}

initializeDatabase();

// ---------------------------------------------------------------
// LOGIN & SESI
// ---------------------------------------------------------------
let currentUser = readStore('techzone_current_user', null);

function login(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');

    if (username === 'admin' && password === DEMO_PASSWORD) {
        localStorage.removeItem('techzone_hidden_barang');
        currentUser = { name: 'Administrator', username: 'admin', role: 'admin' };
        writeStore('techzone_current_user', currentUser);
        window.location.href = 'admin.html';
        return;
    }

    localStorage.removeItem('techzone_hidden_barang');

    const akunBaru = readStore('techzone_extra_accounts', []);   // akun hasil "Daftar" di halaman login
    const akun = USER_ACCOUNTS.concat(akunBaru).find(a => a.username === username && a.password === password);
    if (!akun) {
        error.classList.remove('hidden');
        error.textContent = 'Username atau password salah.';
        return;
    }

    currentUser = { name: akun.name, shortName: akun.shortName, username: akun.username, role: 'user' };
    writeStore('techzone_current_user', currentUser);
    window.location.href = 'home.html';
}

function logout() {
    // Hapus sesi lalu langsung kembali ke halaman login (admin maupun user), 1 kali klik.
    try { localStorage.removeItem('techzone_current_user'); } catch (e) {}
    currentUser = null;
    window.location.replace('index.html');
}

// Jika halaman dibuka lewat tombol Back setelah logout (cache browser), paksa kembali ke login.
window.addEventListener('pageshow', (e) => {
    const onLogin = /(^|\/)(index\.html)?$/.test(window.location.pathname);
    let sesi = null;
    try { sesi = localStorage.getItem('techzone_current_user'); } catch (err) {}
    if (e.persisted && !sesi && !onLogin) window.location.replace('index.html');
});

function checkAuth(requiredRole) {
    if (!currentUser || currentUser.role !== requiredRole) {
        showToast('Akses ditolak. Silakan login terlebih dahulu.', 'info');
        window.location.replace('index.html');
        return false;
    }
    return true;
}

function updateNavbar(containerId) {
    const el = document.getElementById(containerId);
    if (el && currentUser) {
        el.innerHTML = `<span class="nav-greeting">Halo, <b>${esc(currentUser.name)}</b></span>` +
                       `<button onclick="logout()" class="btn-logout">Keluar</button>`;
    }
}

// ---------------------------------------------------------------
// PEMBANTU TAMPILAN
// ---------------------------------------------------------------
function rupiah(value) {
    return 'Rp ' + Number(value).toLocaleString('id-ID');
}

function kategoriLabel(k) {
    return ({ laptop: 'Laptop', hp: 'HP', mouse: 'Mouse', ipad: 'iPad' })[k] || k;
}

// Diskon banner/admin dibaca bersama oleh halaman admin dan user.
const DEFAULT_BANNER_CONFIG = {
    welcome: { enabled: false, percent: 0 },
    laptop:  { enabled: true, percent: 15 },
    hp:      { enabled: true, percent: 10 },
    ipad:    { enabled: true, percent: 12 },
    mouse:   { enabled: true, percent: 20 }
};

function getBannerConfig() {
    const saved = readStore('techzone_banner_config', null);
    if (!saved || typeof saved !== 'object') return JSON.parse(JSON.stringify(DEFAULT_BANNER_CONFIG));
    const merged = JSON.parse(JSON.stringify(DEFAULT_BANNER_CONFIG));
    Object.keys(merged).forEach(key => {
        if (saved[key]) {
            merged[key].enabled = !!saved[key].enabled;
            merged[key].percent = Math.max(0, Math.min(100, Number(saved[key].percent || 0)));
        }
    });
    return merged;
}

function getDiscountForCategory(category) {
    const item = getBannerConfig()[category];
    return item ? Math.max(0, Math.min(100, Number(item.percent || 0))) : 0;
}

function getDiscountedPrice(price, category) {
    const discount = getDiscountForCategory(category);
    return Math.round(Number(price) * (1 - discount / 100));
}

// ---------------------------------------------------------------
// SUKA & KERANJANG PER AKUN (ditulis home.html, dibaca admin.html)
// ---------------------------------------------------------------
const CART_PREFIX = 'techzone_keranjang_';

// Berapa pelanggan yang menyukai produk ini
function getLikeCount(id) {
    const all = readStore('techzone_suka', {});
    return Object.values(all).filter(list => Array.isArray(list) && list.map(Number).includes(Number(id))).length;
}

// Total unit produk ini yang sedang ada di keranjang semua pelanggan
function getCartQty(id) {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(CART_PREFIX)) continue;
        const cart = readStore(key, []);
        if (Array.isArray(cart)) cart.forEach(x => { if (Number(x.id) === Number(id)) total += Number(x.qty || 0); });
    }
    return total;
}

// Cegah teks dari input (mis. nama barang buatan admin) merusak HTML
function esc(text) {
    return String(text ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

function showToast(message, type='success') {
    let wrap = document.getElementById('tz-toast-wrap');
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'tz-toast-wrap';
        wrap.className = 'tz-toast-wrap';
        document.body.appendChild(wrap);
    }
    const toast = document.createElement('div');
    toast.className = `tz-toast tz-toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${type==='success'?'fa-circle-check':'fa-circle-info'}"></i><span>${esc(message)}</span>`;
    wrap.appendChild(toast);
    requestAnimationFrame(()=>toast.classList.add('show'));
    setTimeout(()=>{ toast.classList.remove('show'); setTimeout(()=>toast.remove(),250); }, 2200);
}

function animateAction(element, label='Berhasil') {
    if (!element) return;
    element.classList.remove('action-pop');
    void element.offsetWidth;
    element.classList.add('action-pop');
    showToast(label, 'success');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// Tekan Esc untuk menutup popup yang sedang terbuka
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(m => m.classList.add('hidden'));
    }
});
