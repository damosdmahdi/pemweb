# WorkNet — Sistem Pemesanan Ruang Kerja Gedung (Workspace Rental)

> **Tugas 1 — Milestone 1: Pengembangan Antarmuka Produk Web Responsif dan Aksesibel**  
> **Mata Kuliah:** Pengembangan Aplikasi Web  
> **Sub-CPMK:** 2 (C3, P3) | **Versi Rilis:** `v0.1`

---

## 1. Konsep dan Deskripsi Produk

### 1.1 Nama Produk
**WorkNet** (*Smart Workspace Building Rental System*)

### 1.2 Latar Belakang & Permasalahan yang Diselesaikan
Pertumbuhan gaya kerja fleksibel (*hybrid/remote*) dan aktivitas kolaborasi akademik maupun profesional menciptakan kebutuhan tinggi akan ruang kerja yang tenang, representatif, dan dapat disewa secara fleksibel per jam atau harian. Pada sebuah gedung yang khusus disewakan per ruangannya, sistem reservasi manual (seperti lewat telepon atau chat WhatsApp resepsionis) kerap menimbulkan kendala:
* Terjadinya bentrok jadwal sewa (*double-booking*).
* Ketidakjelasan ketersediaan fasilitas penunjang (misal: kapasitas stopkontak, layar proyektor, kecepatan internet).
* Proses konfirmasi dan pencatatan data penyewa yang tidak efisien dan lambat.

**WorkNet** hadir sebagai antarmuka pemesanan ruang kerja terpadu untuk satu gedung rental. Melalui platform ini, calon penyewa dapat menelusuri katalog ruangan, membandingkan spesifikasi teknis, memeriksa tata tertib penggunaan gedung, serta melakukan reservasi dengan validasi data instan.

### 1.3 Sasaran Pengguna
1. **Freelancer & Remote Worker:** Membutuhkan *Focus Pod* privat yang tenang, kedap suara, dan memiliki koneksi internet andal untuk panggilan daring.
2. **Mahasiswa & Civitas Akademika:** Membutuhkan *Meeting/Collab Room* untuk kerja kelompok, diskusi riset, bimbingan, atau persiapan sidang.
3. **Komunitas Kreatif & Penggiat IT:** Memerlukan *Creative Studio* atau *Event Hall* serbaguna untuk workshop, seminar, dan meetup.
4. **Pekerja Profesional & Tim Startup:** Memerlukan *Team Suite* harian atau *Executive Boardroom* untuk presentasi formal dengan klien/investor.

### 1.4 Fitur Awal (Milestone 1)
* **Katalog Ruangan Interaktif:** Pencarian berbasis teks, filter kategori ruangan (*Focus Pod, Meeting Room, Team Office, Event Hall*), filter minimal kapasitas orang, dan filter status ketersediaan.
* **Detail Spesifikasi Ruangan:** Tampilan menyeluruh terkait dimensi ruangan, daya listrik/stopkontak, kecepatan koneksi WiFi dedicated, kelengkapan audio/visual, aturan gedung, serta rincian tarif per jam.
* **Formulir Reservasi Cerdas:** Pengisian jadwal, profil peminjam, jumlah peserta, dan catatan kebutuhan khusus yang dilengkapi dengan kalkulator estimasi biaya sewa otomatis.
* **Validasi Sisi Klien (*Client-Side Validation*):** Pengecekan instan terhadap keabsahan nama, format email, panjang digit nomor telepon, tanggal sewa (mencegah tanggal lampau), jam mulai & selesai (minimal durasi sewa 1 jam), serta validasi agar jumlah peserta tidak melebihi kapasitas ruangan terpilih.
* **Tiket Konfirmasi Reservasi:** Modal dialog interaktif yang menampilkan rangkuman ID pemesanan unik dan rincian transaksi setelah formulir berhasil diverifikasi.

---

## 2. Arsitektur Teknologi & Dependensi

* **Library Utama:** [React](https://react.dev/) (v19)
* **Bahasa:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
* **Build Tool:** [Vite](https://vite.dev/) (v8)
* **Styling Framework:** [Tailwind CSS](https://tailwindcss.com/) (v4 via `@tailwindcss/vite`)
* **Standar Aksesibilitas:** Web Content Accessibility Guidelines (WCAG) 2.1 Level AA

---

## 3. Struktur Direktori Proyek

```text
pemweb/
├── docs/
│   └── screenshots/               # Bukti tangkapan layar responsivitas & formulir
├── public/                        # Aset publik statis
├── src/
│   ├── components/                # Komponen antarmuka yang dapat digunakan ulang (Reusable)
│   │   ├── Badge.tsx              # Komponen penanda status & kategori
│   │   ├── Button.tsx             # Komponen tombol multi-varian & accessible focus
│   │   ├── Footer.tsx             # Komponen footer semantik dengan informasi gedung
│   │   ├── FormField.tsx          # Komponen wrapper input, label semantik, dan pesan error
│   │   ├── Modal.tsx              # Komponen dialog modal pop-up (Trap focus, ESC close)
│   │   ├── Navbar.tsx             # Komponen header semantik & navigasi responsif
│   │   └── RoomCard.tsx           # Komponen kartu ruangan pada katalog
│   ├── data/
│   │   └── mockRooms.ts           # Mock data ruangan di gedung WorkNet
│   ├── pages/                     # Tiga halaman utama aplikasi
│   │   ├── BookingPage.tsx        # Halaman formulir reservasi & validasi klien
│   │   ├── CatalogPage.tsx        # Halaman katalog & filter ruangan
│   │   └── DetailPage.tsx         # Halaman spesifikasi detail ruangan & tata tertib
│   ├── types/
│   │   └── index.ts               # Definisi tipe data TypeScript
│   ├── App.tsx                    # Komponen root, routing state, dan skip-link
│   ├── index.css                  # Direktif Tailwind CSS & styling aksesibilitas
│   └── main.tsx                   # Entry point aplikasi React
├── index.html                     # Dokumen HTML semantik (lang="id")
├── package.json                   # Dependensi & script proyek
├── tsconfig.json                  # Konfigurasi TypeScript compiler
└── vite.config.ts                 # Konfigurasi Vite & Tailwind plugin
```

---

## 4. Komponen Reusable yang Dikembangkan

Aplikasi ini mengimplementasikan komponen modular yang dapat digunakan berulang kali:

1. **`Button` (`src/components/Button.tsx`):**
   * Mendukung varian tampilan: `primary`, `secondary`, `outline`, dan `danger`.
   * Mendukung berbagai ukuran (`sm`, `md`, `lg`) serta mode `fullWidth`.
   * Dilengkapi indikator fokus keyboard yang jelas (`focus-visible:ring-2`) dan penanganan status `disabled`.
2. **`FormField` (`src/components/FormField.tsx`):**
   * Mengintegrasikan elemen `<label>` dengan `id` input secara semantik.
   * Menampilkan tanda wajib (`*`) dengan atribut `aria-hidden="true"`.
   * Menyediakan wadah pesan error yang terhubung dengan `role="alert"` dan dihubungkan ke input melalui `aria-describedby`.
3. **`Badge` (`src/components/Badge.tsx`):**
   * Menampilkan label status ketersediaan (*Tersedia / Penuh*) dan kategori ruangan.
   * Menggunakan kombinasi warna kontras tinggi yang ramah pembaca disabilitas penglihatan (*WCAG Compliant*).
4. **`RoomCard` (`src/components/RoomCard.tsx`):**
   * Kartu ringkasan ruangan yang memuat gambar representatif, badge ketersediaan, kapasitas maksimal, kecepatan internet, harga sewa per jam, dan dua tombol aksi cepat.
5. **`Modal` (`src/components/Modal.tsx`):**
   * Jendela dialog modal yang memenuhi standar aksesibilitas (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
   * Mendukung penutupan via tombol keyboard `Escape` dan klik pada area backdrop.

---

## 5. Implementasi Formulir & Validasi Sisi Klien

Formulir reservasi ruangan berada di file [`src/pages/BookingPage.tsx`](src/pages/BookingPage.tsx) dengan aturan validasi sebagai berikut:

| Kolom Input | Aturan Validasi | Pesan Kesalahan (*Error Message*) |
| :--- | :--- | :--- |
| **Nama Lengkap** | Wajib diisi, minimal 3 karakter | *"Nama lengkap wajib diisi."* / *"Nama lengkap minimal terdiri dari 3 karakter."* |
| **Alamat Email** | Wajib diisi, format regex email valid | *"Alamat email wajib diisi."* / *"Format email tidak valid (contoh: nama@domain.com)."* |
| **Nomor Telepon/WA** | Wajib angka, panjang 10–14 digit | *"Nomor WhatsApp / telepon wajib diisi."* / *"Nomor telepon harus antara 10 sampai 14 digit angka."* |
| **Kategori Pengguna** | Wajib memilih salah satu profil pengguna | *"Silakan pilih kategori peminjam Anda."* |
| **Pilihan Ruangan** | Ruangan wajib dipilih & status tidak boleh penuh | *"Ruangan wajib dipilih."* / *"Ruangan ini sedang penuh dan tidak dapat dipesan."* |
| **Tanggal Pemesanan** | Wajib diisi, tidak boleh tanggal lampau ($< \text{hari ini}$) | *"Tanggal pemesanan wajib diisi."* / *"Tanggal pemesanan tidak boleh merupakan tanggal lampau."* |
| **Jam Mulai & Selesai** | Jam selesai $>$ jam mulai, durasi minimal 1 jam | *"Jam selesai harus lebih akhir dari jam mulai."* / *"Durasi pemesanan minimal adalah 1 jam (60 menit)."* |
| **Jumlah Peserta** | Minimal 1 orang, tidak boleh melebihi kapasitas ruangan terpilih | *"Jumlah peserta harus minimal 1 orang."* / *"Jumlah peserta (X) melebihi kapasitas [Nama Ruangan] (maks. Y orang)."* |
| **Persetujuan Ketentuan** | Checkbox syarat & tata tertib wajib dicentang | *"Anda wajib menyetujui tata tertib dan ketentuan gedung WorkNet."* |

---

## 6. Aksesibilitas Web (A11y) & Desain Responsif

### 6.1 Aksesibilitas
* **Struktur HTML Semantik:** Menggunakan elemen `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<fieldset>`, `<legend>`, `<label>`, dan `<footer>`.
* **Navigasi Keyboard:** Tersedia *Skip to Content Link* (`.skip-to-content`) di awal halaman agar pengguna pembaca layar (*screen reader*) dapat melompati navigasi header langsung ke konten utama.
* **Atribut ARIA Lengkap:** Penerapan `aria-label`, `aria-current`, `aria-invalid`, `aria-describedby`, `role="alert"`, dan `role="dialog"`.
* **Kontras Warna:** Seluruh teks menggunakan rasio kontras warna tinggi di atas latar belakang putih/abu-abu terang (memenuhi standar WCAG AA dengan skor audit Lighthouse $\ge 85$).

### 6.2 Desain Responsif
Antarmuka telah diuji dan dirancang adaptif untuk tiga ukuran layar:
* **Ponsel ($\le 640\text{ px}$):** Menu navigasi otomatis berubah menjadi dropdown hamburger yang mudah dijangkau satu tangan. Layout kartu dan formulir tersusun dalam 1 kolom vertikal.
* **Tablet ($768\text{ px}$):** Layout grid katalog menampilkan 2 kolom kartu ruangan; input formulir menggunakan grid 2–3 kolom untuk menghemat ruang vertikal.
* **Desktop ($\ge 1024\text{ px}$):** Navigasi penuh terlihat di header, katalog menampilkan grid 3 kolom kartu, halaman detail dan booking menampilkan layout sidebar ringkasan biaya yang melayang (*sticky position*).

---

## 7. Petunjuk Menjalankan Proyek Secara Lokal

Pastikan komputer Anda telah terpasang **Node.js** (versi 18 ke atas) dan **npm**.

1. **Clone repository ini:**
   ```bash
   git clone <URL_REPOSITORY_ANDA>
   cd pemweb
   ```

2. **Instal dependensi proyek:**
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan lokal:**
   ```bash
   npm run dev
   ```
   Buka peramban (*browser*) pada alamat: `http://localhost:5173/`

4. **Menjalankan pemeriksaan TypeScript & build produksi:**
   ```bash
   npm run build
   ```

5. **Menjalankan linter:**
   ```bash
   npm run lint
   ```

---

## 8. Rencana Integrasi Keberlanjutan (Milestone 2 & Seterusnya)

Produk **WorkNet** dirancang dengan struktur data dan alur kerja yang siap dilanjutkan pada tahapan berikutnya:
1. **Milestone 2 (Backend & Database):**
   * Mengganti `MOCK_ROOMS` dengan koneksi basis data relasional (misal: PostgreSQL / SQLite).
   * Membuat endpoint RESTful API untuk ketersediaan slot jam dan pencatatan reservasi.
   * Menangani *race condition* (mencegah dua pengguna memesan ruangan dan jam yang sama secara bersamaan).
2. **Integrasi Mata Kuliah Keamanan Siber:**
   * Penerapan *Role-Based Access Control* (RBAC) membedakan hak akses antara *Penyewa*, *Petugas Resepsionis*, dan *Manajer Gedung*.
   * Sanitasi masukan (*input sanitization*) dan mitigasi serangan umum seperti XSS, CSRF, dan SQL Injection.
   * Audit trail logging untuk mencatat aktivitas reservasi dan pembatalan sewa.
3. **Integrasi Mata Kuliah Kriptografi:**
   * **Digital Access Pass (QR Code Signature):** Tiket reservasi yang memuat tanda tangan digital berbasis HMAC atau RSA/ECDSA untuk diverifikasi saat penyewa memindai kode di pintu ruangan gedung.
   * **Enkripsi Data Sensitif (AES-256):** Melindungi data identitas pribadi penyewa dan catatan transaksi pada basis data.
