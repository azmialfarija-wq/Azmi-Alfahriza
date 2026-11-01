TECHZONE - CATATAN PEMBARUAN

Pembaruan pada paket ini:
- Menambahkan fitur Customer Service dua arah untuk halaman pengguna dan admin.
- Percakapan memakai localStorage dengan key khusus `techzone_chats`, terpisah dari data produk/diskon.
- Pesan menampilkan nama pengirim dan waktu; admin bisa membuka percakapan pelanggan dan membalas.
- Ada indikator pesan belum dibaca dan sinkronisasi antar-tab melalui event storage (origin/browser yang sama).
- Menambahkan CSS responsif untuk panel chat.
- Menghubungkan tombol Konsultasi Gratis ke panel chat.

Cara menjalankan:
1. Ekstrak folder TechZone.
2. Jalankan melalui server lokal sederhana (disarankan VS Code Live Server) agar semua halaman memakai origin yang sama.
3. Masuk sebagai akun pengguna, buka Konsultasi Gratis dan kirim pesan.
4. Buka admin.html pada tab lain di browser dan masuk sebagai admin, lalu pilih Customer Service untuk membalas.

Batasan:
- localStorage hanya dibagi dalam origin/browser profile yang sama; tidak tersinkron ke perangkat/browser lain.
- Balasan admin adalah balasan yang benar-benar dikirim dari halaman admin, tidak dibuat otomatis.
- Paket sumber tidak berisi model GLB/GLTF 3D. Karena itu, viewer 3D asli belum dapat diaktifkan tanpa model 3D yang valid; gambar produk yang ada tetap dipakai sebagai visual produk.
- Carousel produk dan sistem animasi/scroll yang sudah ada dipertahankan.

Pembaruan tambahan (27 Oktober 2026):
- Memperbaiki kontras input balasan admin agar teks yang diketik langsung terlihat jelas sebelum dikirim.
- Menghapus daftar akun/password demo dari halaman login. Akun tetap dikelola oleh mekanisme login yang ada.
- Menghapus test.html yang kosong. index.html TIDAK dihapus karena merupakan halaman login dan masih dipakai oleh alur navigasi/autentikasi.
