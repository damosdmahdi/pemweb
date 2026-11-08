# Panduan Pengujian & Format Bukti Pengerjaan (Milestone 1)

Dokumen ini memuat panduan lengkap untuk melakukan pengujian antarmuka, validasi formulir, dan audit Lighthouse Accessibility pada aplikasi **WorkNet**, sesuai dengan rubrik penilaian Tugas 1.

---

## 1. Pengujian Responsivitas Antarmuka

Buka aplikasi di Google Chrome, tekan `F12` (atau klik kanan > *Inspect*), aktifkan ikon **Toggle Device Toolbar** (`Ctrl + Shift + M`).

Ambil tangkapan layar (*screenshot*) pada 3 ukuran berikut dan simpan ke folder `docs/screenshots/`:

| No | Tampilan Perangkat | Lebar Layar | Halaman yang Ditangkap | Nama File Rekomendasi |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Ponsel (Mobile)** | `375px` atau `414px` (misal: iPhone / Galaxy) | Katalog Ruangan (menu navbar mobile) | `docs/screenshots/01-mobile-catalog.png` |
| 2 | **Ponsel (Mobile)** | `375px` | Formulir Pemesanan Ruangan | `docs/screenshots/02-mobile-booking.png` |
| 3 | **Tablet** | `768px` (misal: iPad Mini) | Katalog Ruangan (tampilan 2 kolom) | `docs/screenshots/03-tablet-catalog.png` |
| 4 | **Desktop** | $\ge 1024\text{px}$ (misal: `1280px` / `1440px`) | Katalog Ruangan (tampilan 3 kolom) | `docs/screenshots/04-desktop-catalog.png` |
| 5 | **Desktop** | $\ge 1024\text{px}$ | Detail Ruangan & Spesifikasi | `docs/screenshots/05-desktop-detail.png` |
| 6 | **Desktop** | $\ge 1024\text{px}$ | Formulir Booking & Sticky Sidebar Biaya | `docs/screenshots/06-desktop-booking.png` |

---

## 2. Pengujian Formulir & Validasi Sisi Klien (*Client-Side Validation*)

Buka halaman **Formulir Booking** (`http://localhost:5173/` > klik "Formulir Booking"):

### Skenario Uji 1: Validasi Kesalahan Masukan (Invalid Input)
1. Biarkan Nama Lengkap kosong atau ketik hanya 1 huruf (misal: `A`).
2. Masukkan email tidak valid (misal: `budi@`).
3. Masukkan nomor telepon kurang dari 10 digit atau berupa huruf.
4. Jangan pilih kategori pengguna.
5. Pilih jam selesai yang lebih awal daripada jam mulai (misal: mulai 14.00, selesai 12.00).
6. Masukkan jumlah peserta melebihi kapasitas ruangan (misal: ruangan berkapasitas 2 orang, diisi 10 orang).
7. Biarkan checkbox persetujuan tidak dicentang.
8. Klik tombol **"Kirim Reservasi Ruangan"**.
9. **Hasil:** Muncul pesan kesalahan berwarna merah dengan ikon peringatan di bawah tiap kolom yang tidak valid.
10. **Ambil Tangkapan Layar:** Simpan sebagai `docs/screenshots/07-form-validation-errors.png`.

### Skenario Uji 2: Pengisian Valid & Tiket Konfirmasi (Valid Input)
1. Isi Nama Lengkap: `Damos Kurniawan`
2. Isi Email: `damos@example.com`
3. Isi No. HP: `081234567890`
4. Pilih Kategori: `Pekerja Profesional / Startup Tim`
5. Pilih Ruangan: `Focus Pod A1`
6. Tanggal: Hari ini atau tanggal mendatang
7. Jam Mulai: `09:00`, Jam Selesai: `11:00` (durasi 2 jam)
8. Jumlah Peserta: `2` (sesuai kapasitas)
9. Centang persetujuan tata tertib.
10. Klik tombol **"Kirim Reservasi Ruangan"**.
11. **Hasil:** Muncul modal dialog konfirmasi reservasi lengkap dengan ID Pemesanan unik (`WN-XXXX`), rincian jadwal, durasi sewa, dan total tarif.
12. **Ambil Tangkapan Layar:** Simpan sebagai `docs/screenshots/08-form-success-modal.png`.

---

## 3. Pengujian Lighthouse Accessibility (Skor $\ge 85$)

Aplikasi telah dibangun menggunakan HTML semantik, kontras warna standar WCAG AA, dan atribut ARIA untuk memastikan skor Lighthouse Accessibility mencapai nilai tinggi (target $\ge 85$ hingga 100).

### Langkah Menjalankan Lighthouse:
1. Jalankan aplikasi produksi secara lokal:
   ```bash
   npm run preview
   ```
2. Buka jendela **Chrome Baru (Mode Penyamaran / Incognito)** pada URL yang muncul (misal: `http://localhost:4173/`).
   *(Menggunakan incognito dianjurkan agar ekstensi Chrome tidak memengaruhi hasil pengujian).*
3. Tekan `F12` untuk membuka DevTools, lalu pilih tab **Lighthouse**.
4. Atur konfigurasi pengujian:
   * **Mode:** *Navigation (Default)*
   * **Device:** *Desktop* atau *Mobile*
   * **Categories:** Centang **Accessibility** (opsional: Best Practices & SEO)
5. Klik **Analyze page load**.
6. Simpan laporan dengan cara klik ikon titik tiga (⋮) di pojok kanan atas laporan Lighthouse > **Save as PDF** atau **Save as JSON / HTML**, dan letakkan di `docs/screenshots/lighthouse-report.pdf` (atau screenshot).

### Contoh Format Catatan Kondisi Pengujian (Salin ke Lembar Pengumpulan):
```text
Kondisi Pengujian Lighthouse Accessibility:
- URL Diuji: http://localhost:4173/ (WorkNet)
- Halaman: Katalog Ruangan, Detail Ruangan, Formulir Booking
- Mode Pengujian: Navigation
- Perangkat yang Diemulasikan: Desktop / Mobile (Moto G Power)
- Versi Google Chrome: Chrome 131+ (Linux x86_64)
- Skor Lighthouse Accessibility: 100 / 100 (Lolos syarat minimal 85)
```
