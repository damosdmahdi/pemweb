# WorkNet — Sistem Pemesanan Ruang Kerja Gedung (Workspace Rental)

> **Tugas 2 — Milestone 2: Logika Server, Validasi Zod, dan Integrasi Database PostgreSQL via Prisma ORM**  
> **Mata Kuliah:** Pengembangan Aplikasi Web  
> **Versi Rilis Saat Ini:** `v0.2` (Melanjutkan rilis `v0.1`)

---

## 1. Perkembangan Produk (Evolusi dari v0.1 ke v0.2)

Pada **Milestone 1 (v0.1)**, WorkNet telah membangun antarmuka web responsif dan aksesibel berbasis React & Tailwind CSS dengan mock data. Pada **Milestone 2 (v0.2)**, WorkNet dikembangkan menjadi aplikasi *full-stack* berbasis **Next.js App Router**:

| Aspek Pengembangan | Milestone 1 (`v0.1`) | Milestone 2 (`v0.2`) |
| :--- | :--- | :--- |
| **Arsitektur Aplikasi** | Single Page Application (Vite + React) | **Next.js 15 App Router** (Server & Client Components) |
| **Penyimpanan Data** | Mock data statis (`mockRooms.ts`) | **Database Relasional PostgreSQL** (Persisten) |
| **Pengelolaan Basis Data** | Belum terintegrasi database | **Prisma ORM** (Model `Room` & `Booking` berelasi One-to-Many, migration, dan seeding) |
| **Logika Server** | Validasi sisi klien saja | **Next.js Server Actions** (`'use server'`) |
| **Validasi Sisi Server** | Belum ada | **Zod Schema Validation** (Penolakan masukan tidak sah di server) |
| **Operasi CRUD** | Read katalog & Form reservasi awal | **Full CRUD Lengkap** pada kedua entitas (`Room` dan `Booking`) |
| **Kesiapan Keamanan & Kriptografi** | Konsep produk awal | Struktur data relasional siap integrasi RBAC dan Digital Access Pass (QR signature) |

---

## 2. Fitur Utama & Operasi CRUD (Milestone 2)

### 2.1 CRUD Entitas Ruangan (`Room`)
1. **Create:** Menambahkan data ruangan baru (nama, kategori, lantai, kapasitas, tarif per jam, fasilitas, spesifikasi, aturan) melalui form modal di `/manage/rooms`.
2. **Read:** Menampilkan katalog seluruh ruangan pada halaman utama (`/`) dan rincian spesifikasi teknis lengkap pada `/rooms/[id]`.
3. **Update:** Memperbarui tarif sewa, kapasitas, atau deskripsi ruangan secara langsung melalui modal edit.
4. **Delete:** Menghapus ruangan dari gedung secara aman (*Cascade Delete* membersihkan reservasi terkait).
5. **Toggle Availability:** Tombol sakelar cepat untuk mengubah status ketersediaan (*Tersedia / Penuh*).

### 2.2 CRUD Entitas Reservasi (`Booking`)
1. **Create:** Calon penyewa memesan ruangan via `/booking` dengan kalkulator estimasi biaya otomatis dan validasi Zod.
2. **Read:** Membaca seluruh data reservasi beserta informasi relasi ruangannya di `/manage/bookings` dan di halaman detail ruangan.
3. **Update (Reschedule):** Mengubah jadwal tanggal dan jam sewa, durasi, serta jumlah peserta.
4. **Delete (Cancel):** Membatalkan dan menghapus data reservasi dari sistem database.

---

## 3. Pemodelan Database (Prisma ORM & PostgreSQL)

Database menggunakan dua entitas yang saling berelasi (*One-to-Many*):

```mermaid
erDiagram
    Room ||--o{ Booking : "has many"
    Room {
        String id PK
        String name
        String category
        String categoryLabel
        Int floor
        Int capacity
        Int pricePerHour
        String description
        String[] facilities
        Boolean available
        String imageUrl
        String area
        String wifiSpeed
        Int powerOutlets
        Boolean hasProjector
        Boolean hasWhiteboard
        Boolean hasSoundSystem
        Boolean hasCoffeeAccess
        String[] rules
        DateTime createdAt
        DateTime updatedAt
    }
    Booking {
        String id PK
        String bookingCode UK
        String fullName
        String email
        String phone
        String userCategory
        String date
        String startTime
        String endTime
        Int durationHours
        Int attendees
        Int totalCost
        String notes
        String status
        String roomId FK
        DateTime createdAt
        DateTime updatedAt
    }
```

* **Relasi:** Setiap `Booking` merujuk ke satu `Room` melalui foreign key `roomId` (`fields: [roomId], references: [id], onDelete: Cascade`).
* Berkas skema: [`prisma/schema.prisma`](prisma/schema.prisma)
* Berkas migrasi SQL: [`prisma/migrations/20261108165035_init/migration.sql`](prisma/migrations/20261108165035_init/migration.sql)

---

## 4. Struktur Direktori Proyek (v0.2)

```text
pemweb/
├── docs/
│   ├── PENGUJIAN_DAN_BUKTI.md     # Panduan bukti Milestone 1
│   ├── TESTING_SCENARIOS.md       # Matriks 10 Skenario Pengujian & Bukti Validasi Server
│   └── screenshots/               # Folder tangkapan layar CRUD & database
├── prisma/
│   ├── migrations/                # Riwayat migrasi database PostgreSQL
│   │   └── 20261108165035_init/
│   │       └── migration.sql
│   ├── schema.prisma              # Skema Prisma ORM (Room & Booking)
│   └── seed.ts                    # Script seeding data sintetis
├── src/
│   ├── actions/                   # Next.js Server Actions
│   │   ├── bookingActions.ts      # Server Actions CRUD Reservasi & Validasi Zod
│   │   └── roomActions.ts         # Server Actions CRUD Ruangan & Validasi Zod
│   ├── app/                       # Next.js App Router (Halaman & Routing)
│   │   ├── booking/               # Halaman formulir pemesanan
│   │   ├── manage/
│   │   │   ├── bookings/          # Panel CRUD Manajemen Reservasi
│   │   │   └── rooms/             # Panel CRUD Manajemen Ruangan
│   │   ├── rooms/[id]/            # Halaman dinamis detail spesifikasi ruangan
│   │   ├── CatalogView.tsx        # Komponen interaktif filter katalog
│   │   ├── layout.tsx             # Root layout (Navbar, Footer, A11y skip-link)
│   │   └── page.tsx               # Server Component beranda (Katalog)
│   ├── components/                # Komponen antarmuka reusable
│   │   ├── Badge.tsx              # Komponen badge status & kategori
│   │   ├── Button.tsx             # Komponen tombol multi-varian & accessible focus
│   │   ├── Footer.tsx             # Komponen footer semantik
│   │   ├── FormField.tsx          # Wrapper input & pesan error
│   │   ├── Modal.tsx              # Dialog modal aksesibel
│   │   ├── Navbar.tsx             # Header navigasi responsif
│   │   └── RoomCard.tsx           # Kartu ruangan katalog
│   ├── lib/
│   │   ├── prisma.ts              # Singleton instance PrismaClient
│   │   └── validations.ts         # Zod Validation Schemas
│   └── index.css                  # Konfigurasi Tailwind CSS v4 & styling aksesibilitas
├── .env.example                   # Contoh konfigurasi environment tanpa kredensial
├── docker-compose.yml             # Konfigurasi container PostgreSQL lokal (Port 5434)
├── next.config.mjs                # Konfigurasi Next.js
├── package.json                   # Dependensi & skrip proyek
└── tsconfig.json                  # Konfigurasi TypeScript compiler
```

---

## 5. Petunjuk Menjalankan Proyek Secara Lokal

Pastikan komputer Anda telah terpasang **Node.js (v18+)** dan **Docker**.

### 1. Salin Environment Variables
```bash
cp .env.example .env
```
*(Secara default, URL koneksi diarahkan ke PostgreSQL lokal Docker pada port 5434)*:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5434/worknet_db?schema=public"
```

### 2. Nyalakan Database PostgreSQL via Docker
```bash
docker compose up -d
```

### 3. Instal Dependensi Proyek
```bash
npm install
```

### 4. Sinkronisasi Database & Jalankan Seeding Data Sintetis
Jalankan migrasi skema dan pengisian data sintetis:
```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Jalankan Server Pengembangan Next.js
```bash
npm run dev
```
Buka peramban di alamat: **`http://localhost:3000/`** (atau port yang ditunjuk terminal).

### 6. Build Produksi
```bash
npm run build
npm run start
```

---

## 6. Ringkasan Pengujian & Bukti Validasi Server

Dokumentasi lengkap skenario pengujian tersedia di file [`docs/TESTING_SCENARIOS.md`](docs/TESTING_SCENARIOS.md):
* **10 Skenario Pengujian:** 8 skenario CRUD pada entitas `Room` dan `Booking`, serta 2 skenario pengujian relasi data & *cascade delete*. Seluruh skenario dinyatakan **LULUS (100%)**.
* **Minimal 3 Bukti Validasi Server (Zod):**
  1. Penolakan tanggal sewa lampau & jam selesai yang tidak logis (`bookingSchema`).
  2. Penolakan jumlah peserta melebihi kapasitas maksimal ruangan terpilih.
  3. Penolakan format email tidak valid dan digit nomor telepon di luar rentang 10–14 digit.
* **Persistensi Data:** Seluruh mutasi data via antarmuka langsung tersimpan ke PostgreSQL dan tetap utuh saat halaman dimuat ulang.
