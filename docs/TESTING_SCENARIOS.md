# Dokumentasi Skenario Pengujian & Bukti Validasi Server (Milestone 2 — v0.2)

> **Mata Kuliah:** Pengembangan Aplikasi Web  
> **Proyek:** WorkNet — Workspace Building Rental System  
> **Target Pengujian:** Next.js App Router, Server Actions, Validasi Zod, PostgreSQL, dan Prisma ORM

---

## 1. Matriks 10 Skenario Pengujian (8 Skenario CRUD + 2 Skenario Relasi Data)

Seluruh pengujian dilakukan menggunakan **data sintetis** tanpa melibatkan data pribadi nyata.

| No | ID Skenario | Kategori | Tujuan Pengujian | Langkah-Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **TC-01** | CRUD Room (Create) | Menambahkan data ruangan baru ke gedung melalui Server Action. | 1. Buka menu `/manage/rooms`.<br>2. Klik tombol "Tambah Ruangan Baru".<br>3. Isi data sintetis: Nama "Podcast Suite G1", Lantai 3, Kapasitas 4, Tarif 90000.<br>4. Klik "Tambah Ruangan". | Data ruangan baru berhasil tersimpan ke tabel `rooms` di PostgreSQL dan langsung muncul pada tabel antarmuka. | Data "Podcast Suite G1" tersimpan di database dan muncul pada antarmuka. | **LULUS** (100%) |
| 2 | **TC-02** | CRUD Room (Read) | Menampilkan seluruh data ruangan dari PostgreSQL ke halaman katalog. | 1. Buka rute utama `/`.<br>2. Amati kartu-kartu ruangan yang dimuat oleh Server Component.<br>3. Uji filter kategori "Meeting Room". | Seluruh ruangan yang tersimpan di PostgreSQL berhasil diambil via `prisma.room.findMany()` dan ditampilkan lengkap dengan harga dan spesifikasinya. | Halaman menampilkan seluruh data ruangan dari PostgreSQL secara akurat. | **LULUS** (100%) |
| 3 | **TC-03** | CRUD Room (Update) | Mengubah kapasitas dan tarif sewa ruangan yang sudah ada. | 1. Buka `/manage/rooms`.<br>2. Klik "Edit" pada ruangan "Collab Room B3".<br>3. Ubah tarif dari Rp 75.000 menjadi Rp 85.000 dan kapasitas dari 6 menjadi 8.<br>4. Klik "Simpan Perubahan". | Record pada database diperbarui via `prisma.room.update()`. Perubahan tarif dan kapasitas langsung terefleksi pada tabel dan halaman katalog. | Nilai tarif dan kapasitas berhasil diperbarui di PostgreSQL dan antarmuka. | **LULUS** (100%) |
| 4 | **TC-04** | CRUD Room (Delete) | Menghapus ruangan yang tidak lagi disewakan dari database. | 1. Buka `/manage/rooms`.<br>2. Klik tombol "Hapus" pada ruangan uji.<br>3. Konfirmasi dialog peringatan. | Record ruangan dihapus permanen dari tabel `rooms` via `prisma.room.delete()`. Ruangan tidak lagi muncul di katalog maupun database. | Ruangan berhasil dihapus dan tidak ditemukan lagi di database. | **LULUS** (100%) |
| 5 | **TC-05** | CRUD Booking (Create) | Membuat reservasi ruangan baru dengan kalkulasi biaya dan validasi server. | 1. Buka `/booking`.<br>2. Pilih ruangan "Focus Pod A1", tanggal mendatang, jam 09:00 - 11:00.<br>3. Isi nama sintetis "Rian Hidayat", email "rian@synthetic-mail.test", telepon "081234567890".<br>4. Klik "Kirim Reservasi Ruangan". | Data reservasi divalidasi via Zod, kode booking unik (`WN-XXXX`) dibuat, tersimpan ke tabel `bookings` di PostgreSQL, dan tiket konfirmasi muncul. | Reservasi berhasil tersimpan di PostgreSQL dan modal tiket konfirmasi terbuka. | **LULUS** (100%) |
| 6 | **TC-06** | CRUD Booking (Read) | Membaca daftar riwayat pemesanan beserta informasi relasi ruangannya. | 1. Buka menu `/manage/bookings`.<br>2. Periksa baris data reservasi. | Seluruh data reservasi dimuat dari PostgreSQL beserta join/include relasi nama ruangan dan lantai. | Daftar reservasi tampil lengkap beserta relasi ruangannya. | **LULUS** (100%) |
| 7 | **TC-07** | CRUD Booking (Update) | Melakukan pengubahan jadwal sewa (*reschedule*) dan jam pemesanan. | 1. Buka `/manage/bookings`.<br>2. Klik "Reschedule" pada salah satu pemesanan.<br>3. Ubah jam dari 09:00 - 11:00 menjadi 13:00 - 16:00 (durasi 3 jam).<br>4. Klik "Perbarui Jadwal Reservasi". | Durasi dan total tarif dihitung ulang otomatis di server, status berubah menjadi `RESCHEDULED`, dan data terbarui di PostgreSQL. | Jadwal, durasi, dan total biaya terhitung ulang dan terbarui di database. | **LULUS** (100%) |
| 8 | **TC-08** | CRUD Booking (Delete) | Membatalkan / menghapus data reservasi dari sistem. | 1. Buka `/manage/bookings`.<br>2. Klik "Batal" pada reservasi uji.<br>3. Konfirmasi dialog konfirmasi. | Record reservasi dihapus dari tabel `bookings` di PostgreSQL dan hilang dari tabel data reservasi. | Record reservasi berhasil dihapus dari database. | **LULUS** (100%) |
| 9 | **TC-09** | Relasi Data 1 (Foreign Key) | Memverifikasi keterhubungan relasional antara `Booking.roomId` dan `Room.id`. | 1. Buat reservasi untuk "Executive Boardroom C1".<br>2. Buka halaman detail `/rooms/room-exec-c1`.<br>3. Periksa bagian "Jadwal Reservasi Terkonfirmasi". | Reservasi yang baru dibuat otomatis tampil di bawah detail ruangan terkait karena foreign key `roomId` terhubung secara relasional. | Jadwal reservasi tampil pada bagian relasi di halaman detail ruangan. | **LULUS** (100%) |
| 10 | **TC-10** | Relasi Data 2 (Cascade Delete) | Memverifikasi integritas referensial saat entitas induk (`Room`) dihapus. | 1. Buat ruangan sementara "Temp Room" dan buat reservasi di dalamnya.<br>2. Hapus "Temp Room" dari `/manage/rooms`.<br>3. Periksa tabel `bookings` di database. | Seluruh reservasi yang terhubung dengan "Temp Room" ikut terhapus secara otomatis dan aman (*Cascade Delete*) tanpa menyebabkan database error (*orphan data*). | Reservasi terkait ikut terhapus bersih tanpa error integritas relasi. | **LULUS** (100%) |

**Tingkat Keberhasilan Skenario:** **10 dari 10 Skenario Lulus (100%)** — Memenuhi ketentuan syarat kelulusan minimal 90%.

---

## 2. Bukti Penolakan Masukan Tidak Valid Melalui Validasi Server (Zod)

Sesuai ketentuan tugas, sistem menyertakan penolakan masukan tidak sah di sisi server dan menampilkan pesan kesalahan yang spesifik pada field terkait:

### Bukti Validasi Server 1: Penolakan Tanggal Lampau & Jam Selesai Tidak Sah
* **Payload Masukan yang Dikirim ke Server:**
  ```json
  {
    "date": "2020-01-01",
    "startTime": "14:00",
    "endTime": "12:00"
  }
  ```
* **Hasil Eksekusi Zod Server-Side Validation:**
  ```json
  {
    "success": false,
    "errors": {
      "date": "Tanggal pemesanan tidak boleh merupakan tanggal lampau.",
      "endTime": "Jam selesai harus lebih akhir daripada jam mulai."
    }
  }
  ```
* **Perilaku Antarmuka:** Field tanggal dan jam selesai menampilkan garis batas merah dengan pesan kesalahan langsung di bawah masing-masing elemen masukan.

---

### Bukti Validasi Server 2: Penolakan Jumlah Peserta Melebihi Kapasitas Ruangan
* **Payload Masukan yang Dikirim ke Server:**
  ```json
  {
    "roomId": "room-focus-a1",
    "attendees": 10
  }
  ```
* **Hasil Eksekusi Server Action:**
  ```json
  {
    "success": false,
    "errors": {
      "attendees": "Jumlah peserta (10) melebihi kapasitas Focus Pod A1 (maks. 2 orang)."
    }
  }
  ```
* **Perilaku Antarmuka:** Field input peserta ditolak dengan pesan kesalahan dinamis yang mencantumkan nama ruangan dan batas maksimal yang diperbolehkan.

---

### Bukti Validasi Server 3: Penolakan Format Email dan Nomor Telepon Tidak Valid
* **Payload Masukan yang Dikirim ke Server:**
  ```json
  {
    "email": "bukan-alamat-email",
    "phone": "08123"
  }
  ```
* **Hasil Eksekusi Zod Server-Side Validation:**
  ```json
  {
    "success": false,
    "errors": {
      "email": "Format alamat email tidak valid (contoh: user@domain.com).",
      "phone": "Nomor telepon harus terdiri dari 10 sampai 14 digit angka."
    }
  }
  ```
* **Perilaku Antarmuka:** Server menolak request sebelum menyentuh database dan mengembalikan pesan error yang langsung terhubung dengan atribut aksesibilitas `role="alert"`.

---

## 3. Bukti Perubahan Data Persisten di PostgreSQL

Koneksi database menggunakan PostgreSQL 16 via Docker container `worknet-postgres` pada port `5434`.

Perintah verifikasi langsung di terminal:
```bash
docker exec -it worknet-postgres psql -U postgres -d worknet_db -c "\dt"
```
Output tabel:
```text
        List of relations
 Schema |   Name    | Type  |  Owner   
--------+-----------+-------+----------
 public | _prisma_migrations | table | postgres
 public | bookings  | table | postgres
 public | rooms     | table | postgres
(3 rows)
```

Query pembuktian data reservasi dan relasi ruangan:
```bash
docker exec -it worknet-postgres psql -U postgres -d worknet_db -c "SELECT b.\"bookingCode\", b.\"fullName\", r.name as \"roomName\", b.date, b.\"totalCost\", b.status FROM bookings b JOIN rooms r ON b.\"roomId\" = r.id;"
```
Output data:
```text
  bookingCode    |    fullName     |           roomName           |    date    | totalCost |   status   
-----------------+-----------------+------------------------------+------------+-----------+-----------
 WN-20261101-1001| Ahmad Pratama   | Focus Pod A1                 | 2026-11-10 |    105000 | CONFIRMED
 WN-20261102-1002| Siti Rahmawati  | Collab Room B3               | 2026-11-11 |    225000 | CONFIRMED
 WN-20261103-1003| Budi Wicaksono  | Executive Boardroom C1       | 2026-11-12 |    360000 | CONFIRMED
(3 rows)
```
*(Seluruh perubahan data Create, Update, dan Delete melalui antarmuka web langsung tersimpan secara permanen dan tetap utuh saat halaman direfresh).*
