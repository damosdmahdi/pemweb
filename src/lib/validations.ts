import { z } from 'zod';

// Helper untuk validasi tanggal tidak boleh lampau
const isNotPastDate = (dateStr: string) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  return dateStr >= todayStr;
};

// 1. Schema Validasi Server untuk Pembuatan Reservasi (Booking)
export const bookingSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, { message: 'Nama lengkap minimal terdiri dari 3 karakter.' }),
    email: z
      .string()
      .trim()
      .email({ message: 'Format alamat email tidak valid (contoh: user@domain.com).' }),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9]{10,14}$/, {
        message: 'Nomor telepon harus terdiri dari 10 sampai 14 digit angka.',
      }),
    userCategory: z.enum(['freelancer', 'mahasiswa', 'komunitas', 'profesional'], {
      errorMap: () => ({ message: 'Pilih kategori pengguna yang sah.' }),
    }),
    roomId: z
      .string()
      .min(1, { message: 'Pilihan ruangan wajib diisi.' }),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD.' })
      .refine(isNotPastDate, {
        message: 'Tanggal pemesanan tidak boleh merupakan tanggal lampau.',
      }),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, { message: 'Format jam mulai tidak valid (HH:mm).' }),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, { message: 'Format jam selesai tidak valid (HH:mm).' }),
    attendees: z.coerce
      .number({ invalid_type_error: 'Jumlah peserta harus berupa angka.' })
      .int()
      .min(1, { message: 'Jumlah peserta minimal 1 orang.' }),
    notes: z.string().optional().default(''),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({
        message: 'Anda wajib menyetujui seluruh tata tertib penggunaan gedung WorkNet.',
      }),
    }),
  })
  .superRefine((data, ctx) => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (endTotal <= startTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTime'],
        message: 'Jam selesai harus lebih akhir daripada jam mulai.',
      });
    } else if (endTotal - startTotal < 60) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTime'],
        message: 'Durasi pemesanan ruangan minimal adalah 1 jam (60 menit).',
      });
    }
  });

export type BookingInput = z.infer<typeof bookingSchema>;

// 2. Schema Validasi Server untuk Pengubahan Jadwal Reservasi (Reschedule / Update Booking)
export const updateBookingSchema = z
  .object({
    id: z.string().min(1, { message: 'ID reservasi tidak valid.' }),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Format tanggal harus YYYY-MM-DD.' })
      .refine(isNotPastDate, {
        message: 'Tanggal baru tidak boleh merupakan tanggal lampau.',
      }),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, { message: 'Format jam mulai tidak valid (HH:mm).' }),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, { message: 'Format jam selesai tidak valid (HH:mm).' }),
    attendees: z.coerce
      .number({ invalid_type_error: 'Jumlah peserta harus berupa angka.' })
      .int()
      .min(1, { message: 'Jumlah peserta minimal 1 orang.' }),
    notes: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (endTotal <= startTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTime'],
        message: 'Jam selesai harus lebih akhir daripada jam mulai.',
      });
    } else if (endTotal - startTotal < 60) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTime'],
        message: 'Durasi pemesanan ruangan minimal adalah 1 jam (60 menit).',
      });
    }
  });

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

// 3. Schema Validasi Server untuk Entitas Ruangan (Room CRUD)
export const roomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Nama ruangan minimal terdiri dari 3 karakter.' }),
  category: z.enum(['focus', 'meeting', 'team', 'event'], {
    errorMap: () => ({ message: 'Pilih kategori ruangan yang valid.' }),
  }),
  categoryLabel: z.string().min(2, { message: 'Label kategori wajib diisi.' }),
  floor: z.coerce
    .number({ invalid_type_error: 'Nomor lantai harus berupa angka.' })
    .int()
    .min(1, { message: 'Lantai gedung minimal lantai 1.' })
    .max(10, { message: 'Lantai gedung maksimal lantai 10.' }),
  capacity: z.coerce
    .number({ invalid_type_error: 'Kapasitas harus berupa angka.' })
    .int()
    .min(1, { message: 'Kapasitas ruangan minimal 1 orang.' })
    .max(200, { message: 'Kapasitas maksimal ruangan adalah 200 orang.' }),
  pricePerHour: z.coerce
    .number({ invalid_type_error: 'Tarif sewa harus berupa angka.' })
    .int()
    .min(10000, { message: 'Tarif sewa minimal adalah Rp 10.000 / jam.' }),
  description: z
    .string()
    .trim()
    .min(10, { message: 'Deskripsi ruangan minimal terdiri dari 10 karakter.' }),
  facilities: z
    .array(z.string())
    .min(1, { message: 'Minimal cantumkan 1 fasilitas ruangan.' }),
  available: z.boolean().default(true),
  imageUrl: z
    .string()
    .url({ message: 'URL foto ruangan harus berupa tautan URL yang sah.' }),
  area: z.string().min(2, { message: 'Luas ruangan wajib diisi (contoh: 20 m²).' }),
  wifiSpeed: z.string().min(2, { message: 'Kecepatan internet wajib diisi (contoh: 200 Mbps).' }),
  powerOutlets: z.coerce
    .number({ invalid_type_error: 'Jumlah stopkontak harus angka.' })
    .int()
    .min(1, { message: 'Jumlah stopkontak minimal 1 titik.' }),
  hasProjector: z.boolean().default(false),
  hasWhiteboard: z.boolean().default(false),
  hasSoundSystem: z.boolean().default(false),
  hasCoffeeAccess: z.boolean().default(true),
  rules: z
    .array(z.string())
    .min(1, { message: 'Minimal cantumkan 1 aturan/kebijakan ruangan.' }),
});

export type RoomInput = z.infer<typeof roomSchema>;
