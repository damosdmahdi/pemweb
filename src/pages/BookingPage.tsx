import React, { useState, useMemo } from 'react';
import type { Room, BookingFormData, BookingFormErrors, BookingConfirmation } from '../types';
import { FormField } from '../components/FormField';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

export interface BookingPageProps {
  rooms: Room[];
  initialRoomId?: string;
  onNavigateToCatalog: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  rooms,
  initialRoomId,
  onNavigateToCatalog,
}) => {
  // Ambil tanggal hari ini dalam format YYYY-MM-DD sebagai batas minimal tanggal
  const todayStr = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const defaultRoomId = initialRoomId || (rooms.length > 0 ? rooms[0].id : '');

  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    email: '',
    phone: '',
    userCategory: '',
    roomId: defaultRoomId,
    date: todayStr,
    startTime: '09:00',
    endTime: '11:00',
    attendees: '1',
    notes: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof BookingFormData, boolean>>>({});
  const [confirmedBooking, setConfirmedBooking] = useState<BookingConfirmation | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Cari objek ruangan terpilih
  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === formData.roomId) || rooms[0];
  }, [rooms, formData.roomId]);

  // Hitung durasi dan estimasi biaya sewa
  const { durationHours, totalCost } = useMemo(() => {
    if (!formData.startTime || !formData.endTime || !selectedRoom) {
      return { durationHours: 0, totalCost: 0 };
    }

    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      return { durationHours: 0, totalCost: 0 };
    }

    const diffHours = (endMinutes - startMinutes) / 60;
    const roundedHours = Math.ceil(diffHours);
    const cost = roundedHours * selectedRoom.pricePerHour;

    return { durationHours: roundedHours, totalCost: cost };
  }, [formData.startTime, formData.endTime, selectedRoom]);

  // Fungsi validasi seluruh kolom formulir
  const validate = (data: BookingFormData): BookingFormErrors => {
    const newErrors: BookingFormErrors = {};

    // 1. Validasi Nama Lengkap
    if (!data.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi.';
    } else if (data.fullName.trim().length < 3) {
      newErrors.fullName = 'Nama lengkap minimal terdiri dari 3 karakter.';
    }

    // 2. Validasi Format Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim()) {
      newErrors.email = 'Alamat email wajib diisi.';
    } else if (!emailRegex.test(data.email.trim())) {
      newErrors.email = 'Format email tidak valid (contoh: nama@domain.com).';
    }

    // 3. Validasi Nomor Telepon / WhatsApp
    const phoneDigits = data.phone.replace(/[^0-9]/g, '');
    if (!data.phone.trim()) {
      newErrors.phone = 'Nomor WhatsApp / telepon wajib diisi.';
    } else if (phoneDigits.length < 10 || phoneDigits.length > 14) {
      newErrors.phone = 'Nomor telepon harus antara 10 sampai 14 digit angka.';
    }

    // 4. Validasi Kategori Peminjam
    if (!data.userCategory) {
      newErrors.userCategory = 'Silakan pilih kategori peminjam Anda.';
    }

    // 5. Validasi Pilihan Ruangan
    if (!data.roomId) {
      newErrors.roomId = 'Ruangan wajib dipilih.';
    } else if (selectedRoom && !selectedRoom.available) {
      newErrors.roomId = 'Ruangan ini sedang penuh dan tidak dapat dipesan.';
    }

    // 6. Validasi Tanggal
    if (!data.date) {
      newErrors.date = 'Tanggal pemesanan wajib diisi.';
    } else if (data.date < todayStr) {
      newErrors.date = 'Tanggal pemesanan tidak boleh merupakan tanggal lampau.';
    }

    // 7. Validasi Jam Mulai dan Jam Selesai
    if (!data.startTime) {
      newErrors.startTime = 'Jam mulai wajib diisi.';
    }
    if (!data.endTime) {
      newErrors.endTime = 'Jam selesai wajib diisi.';
    } else if (data.startTime && data.endTime) {
      const [startH, startM] = data.startTime.split(':').map(Number);
      const [endH, endM] = data.endTime.split(':').map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;

      if (endMin <= startMin) {
        newErrors.endTime = 'Jam selesai harus lebih akhir dari jam mulai.';
      } else if (endMin - startMin < 60) {
        newErrors.endTime = 'Durasi pemesanan minimal adalah 1 jam (60 menit).';
      }
    }

    // 8. Validasi Jumlah Peserta (Kapasitas)
    const attendeesNum = Number(data.attendees);
    if (!data.attendees || isNaN(attendeesNum) || attendeesNum <= 0) {
      newErrors.attendees = 'Jumlah peserta harus minimal 1 orang.';
    } else if (selectedRoom && attendeesNum > selectedRoom.capacity) {
      newErrors.attendees = `Jumlah peserta (${attendeesNum}) melebihi kapasitas ${selectedRoom.name} (maks. ${selectedRoom.capacity} orang).`;
    }

    // 9. Validasi Persetujuan Syarat & Ketentuan
    if (!data.agreeToTerms) {
      newErrors.agreeToTerms = 'Anda wajib menyetujui tata tertib dan ketentuan gedung WorkNet.';
    }

    return newErrors;
  };

  const handleBlur = (field: keyof BookingFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validationErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: validationErrors[field],
    }));
  };

  const handleChange = (
    field: keyof BookingFormData,
    value: string | boolean
  ) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    // Jika input sudah pernah disentuh, perbarui validasi secara langsung
    if (touched[field]) {
      const validationErrors = validate(updated);
      setErrors((prev) => ({
        ...prev,
        [field]: validationErrors[field],
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Tandai semua input sebagai disentuh
    const allTouched: Partial<Record<keyof BookingFormData, boolean>> = {};
    (Object.keys(formData) as (keyof BookingFormData)[]).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // Buat tiket konfirmasi reservasi
      const confirmation: BookingConfirmation = {
        bookingId: `WN-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
        roomName: selectedRoom.name,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        userCategory: formData.userCategory,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        durationHours: durationHours,
        attendees: Number(formData.attendees),
        totalCost: totalCost,
        createdAt: new Date().toLocaleString('id-ID'),
      };

      setConfirmedBooking(confirmation);
      setIsSuccessModalOpen(true);
    } else {
      // Fokus ke elemen error pertama untuk kenyamanan aksesibilitas
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
      }
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      userCategory: '',
      roomId: defaultRoomId,
      date: todayStr,
      startTime: '09:00',
      endTime: '11:00',
      attendees: '1',
      notes: '',
      agreeToTerms: false,
    });
    setTouched({});
    setErrors({});
    setIsSuccessModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Formulir Reservasi Ruangan
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Lengkapi data di bawah ini untuk memesan ruangan kerja di gedung WorkNet. Seluruh masukan diverifikasi secara instan sebelum pemesanan diproses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Formulir Pemesanan */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6"
            aria-label="Formulir Reservasi Ruangan WorkNet"
          >
            {/* Bagian 1: Identitas Peminjam */}
            <fieldset className="space-y-4">
              <legend className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 w-full">
                1. Data Diri Peminjam
              </legend>

              {/* Nama Lengkap */}
              <FormField
                id="fullName"
                label="Nama Lengkap"
                required
                error={touched.fullName ? errors.fullName : undefined}
                helperText="Masukkan nama lengkap sesuai kartu identitas (KTP/KTM)."
              >
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  aria-invalid={!!(touched.fullName && errors.fullName)}
                  aria-describedby={
                    touched.fullName && errors.fullName ? 'fullName-error' : 'fullName-desc'
                  }
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                    touched.fullName && errors.fullName
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-blue-600'
                  }`}
                />
              </FormField>

              {/* Baris Email & No Telepon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <FormField
                  id="email"
                  label="Alamat Email"
                  required
                  error={touched.email ? errors.email : undefined}
                  helperText="Bukti reservasi & tiket akses akan dikirimkan ke email ini."
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    aria-invalid={!!(touched.email && errors.email)}
                    aria-describedby={
                      touched.email && errors.email ? 'email-error' : 'email-desc'
                    }
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                      touched.email && errors.email
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </FormField>

                {/* Nomor Telepon / WA */}
                <FormField
                  id="phone"
                  label="Nomor WhatsApp / Telepon"
                  required
                  error={touched.phone ? errors.phone : undefined}
                  helperText="Format 10-14 digit angka aktif."
                >
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    aria-invalid={!!(touched.phone && errors.phone)}
                    aria-describedby={
                      touched.phone && errors.phone ? 'phone-error' : 'phone-desc'
                    }
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                      touched.phone && errors.phone
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </FormField>
              </div>

              {/* Kategori Peminjam */}
              <FormField
                id="userCategory"
                label="Kategori Pengguna"
                required
                error={touched.userCategory ? errors.userCategory : undefined}
                helperText="Pilih profil pengguna yang paling sesuai."
              >
                <select
                  id="userCategory"
                  name="userCategory"
                  value={formData.userCategory}
                  onChange={(e) => handleChange('userCategory', e.target.value)}
                  onBlur={() => handleBlur('userCategory')}
                  aria-invalid={!!(touched.userCategory && errors.userCategory)}
                  aria-describedby={
                    touched.userCategory && errors.userCategory
                      ? 'userCategory-error'
                      : 'userCategory-desc'
                  }
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                    touched.userCategory && errors.userCategory
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-blue-600'
                  }`}
                >
                  <option value="">-- Pilih Kategori Pengguna --</option>
                  <option value="freelancer">Freelancer / Remote Worker</option>
                  <option value="mahasiswa">Mahasiswa / Civitas Akademika</option>
                  <option value="komunitas">Komunitas / Penggiat Kreatif</option>
                  <option value="profesional">Pekerja Profesional / Startup Tim</option>
                </select>
              </FormField>
            </fieldset>

            {/* Bagian 2: Detail Peminjaman Ruangan */}
            <fieldset className="space-y-4 pt-2">
              <legend className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 w-full">
                2. Detail Reservasi Ruangan
              </legend>

              {/* Pilihan Ruangan */}
              <FormField
                id="roomId"
                label="Pilihan Ruangan di Gedung WorkNet"
                required
                error={touched.roomId ? errors.roomId : undefined}
                helperText="Pilih ruangan kerja sesuai kebutuhan kapasitas dan aktivitas Anda."
              >
                <select
                  id="roomId"
                  name="roomId"
                  value={formData.roomId}
                  onChange={(e) => handleChange('roomId', e.target.value)}
                  onBlur={() => handleBlur('roomId')}
                  aria-invalid={!!(touched.roomId && errors.roomId)}
                  aria-describedby={
                    touched.roomId && errors.roomId ? 'roomId-error' : 'roomId-desc'
                  }
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                    touched.roomId && errors.roomId
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-blue-600'
                  }`}
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id} disabled={!room.available}>
                      {room.name} (Lt. {room.floor} - Maks. {room.capacity} Org) - Rp{' '}
                      {room.pricePerHour.toLocaleString('id-ID')}/jam{' '}
                      {!room.available ? '[PENUH]' : ''}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Tanggal & Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tanggal */}
                <FormField
                  id="date"
                  label="Tanggal Pemesanan"
                  required
                  error={touched.date ? errors.date : undefined}
                  helperText="Minimal hari ini."
                >
                  <input
                    id="date"
                    name="date"
                    type="date"
                    min={todayStr}
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    onBlur={() => handleBlur('date')}
                    aria-invalid={!!(touched.date && errors.date)}
                    aria-describedby={touched.date && errors.date ? 'date-error' : 'date-desc'}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                      touched.date && errors.date
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </FormField>

                {/* Jam Mulai */}
                <FormField
                  id="startTime"
                  label="Jam Mulai"
                  required
                  error={touched.startTime ? errors.startTime : undefined}
                  helperText="Format 24 jam."
                >
                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    onBlur={() => handleBlur('startTime')}
                    aria-invalid={!!(touched.startTime && errors.startTime)}
                    aria-describedby={
                      touched.startTime && errors.startTime ? 'startTime-error' : 'startTime-desc'
                    }
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                      touched.startTime && errors.startTime
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </FormField>

                {/* Jam Selesai */}
                <FormField
                  id="endTime"
                  label="Jam Selesai"
                  required
                  error={touched.endTime ? errors.endTime : undefined}
                  helperText="Min. 1 jam durasi."
                >
                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    onBlur={() => handleBlur('endTime')}
                    aria-invalid={!!(touched.endTime && errors.endTime)}
                    aria-describedby={
                      touched.endTime && errors.endTime ? 'endTime-error' : 'endTime-desc'
                    }
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                      touched.endTime && errors.endTime
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </FormField>
              </div>

              {/* Jumlah Peserta */}
              <FormField
                id="attendees"
                label="Jumlah Peserta / Hadirin"
                required
                error={touched.attendees ? errors.attendees : undefined}
                helperText={`Kapasitas ruangan ini maksimal ${selectedRoom.capacity} orang.`}
              >
                <input
                  id="attendees"
                  name="attendees"
                  type="number"
                  min="1"
                  max={selectedRoom.capacity}
                  placeholder={`1 - ${selectedRoom.capacity}`}
                  value={formData.attendees}
                  onChange={(e) => handleChange('attendees', e.target.value)}
                  onBlur={() => handleBlur('attendees')}
                  aria-invalid={!!(touched.attendees && errors.attendees)}
                  aria-describedby={
                    touched.attendees && errors.attendees ? 'attendees-error' : 'attendees-desc'
                  }
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                    touched.attendees && errors.attendees
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-blue-600'
                  }`}
                />
              </FormField>

              {/* Catatan Tambahan (Opsional) */}
              <FormField
                id="notes"
                label="Catatan Tambahan atau Kebutuhan Khusus (Opsional)"
                helperText="Contoh: Permintaan kabel proyektor ekstra, seting tata letak meja, atau info tamu luar."
              >
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Tuliskan catatan kebutuhan di sini..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </FormField>
            </fieldset>

            {/* Bagian 3: Persetujuan Ketentuan */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
                  onBlur={() => handleBlur('agreeToTerms')}
                  aria-invalid={!!(touched.agreeToTerms && errors.agreeToTerms)}
                  aria-describedby={
                    touched.agreeToTerms && errors.agreeToTerms ? 'agreeToTerms-error' : undefined
                  }
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Saya menyetujui seluruh tata tertib dan kebijakan penggunaan gedung WorkNet, serta bertanggung jawab penuh atas fasilitas yang digunakan selama masa sewa.{' '}
                  <span className="text-rose-500 font-bold" aria-hidden="true">*</span>
                </span>
              </label>

              {touched.agreeToTerms && errors.agreeToTerms && (
                <p id="agreeToTerms-error" role="alert" className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1.5 pl-7">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.agreeToTerms}</span>
                </p>
              )}
            </div>

            {/* Tombol Aksi Submit */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleResetForm}>
                Atur Ulang Form
              </Button>
              <Button type="submit" variant="primary">
                Kirim Reservasi Ruangan
              </Button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Rincian Estimasi Biaya & Info Ruangan */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24 space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Ringkasan Estimasi Biaya
            </h2>

            {/* Info Ruangan yang Sedang Dipilih */}
            <div className="flex gap-3 items-center">
              <img
                src={selectedRoom.imageUrl}
                alt={selectedRoom.name}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">{selectedRoom.name}</h3>
                <p className="text-xs text-slate-500">Lantai {selectedRoom.floor} • {selectedRoom.categoryLabel}</p>
                <p className="text-xs font-semibold text-blue-600">
                  Rp {selectedRoom.pricePerHour.toLocaleString('id-ID')} / jam
                </p>
              </div>
            </div>

            {/* Rincian Perhitungan */}
            <div className="space-y-2.5 text-xs text-slate-600 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span>Tanggal Sewa:</span>
                <span className="font-semibold text-slate-800">{formData.date || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu Pemakaian:</span>
                <span className="font-semibold text-slate-800">
                  {formData.startTime} - {formData.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Durasi:</span>
                <span className="font-semibold text-slate-800">
                  {durationHours > 0 ? `${durationHours} Jam` : 'Jam Belum Valid'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Jumlah Peserta:</span>
                <span className="font-semibold text-slate-800">{formData.attendees || 0} Orang</span>
              </div>
            </div>

            {/* Total Pembayaran */}
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-sm font-bold text-slate-800">Total Estimasi:</span>
              <span className="text-xl font-extrabold text-blue-600">
                Rp {totalCost.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="bg-blue-50 text-blue-900 p-3 rounded-xl text-xs space-y-1">
              <p className="font-semibold">Informasi Validasi:</p>
              <p>• Tarif dihitung otomatis per jam penuh.</p>
              <p>• Pembayaran dan verifikasi kartu akses dilakukan di resepsionis Lantai 1.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Sukses Reservasi */}
      {confirmedBooking && (
        <Modal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          title="Reservasi Berhasil Dikonfirmasi!"
        >
          <div className="space-y-5">
            {/* Banner Sukses */}
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold">Pemesanan Anda Telah Dicatat</h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  ID Reservasi: <strong className="font-mono text-emerald-950">{confirmedBooking.bookingId}</strong>
                </p>
              </div>
            </div>

            {/* Detail Tiket Pemesanan */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Nama Pemesan:</span>
                <span className="font-bold text-slate-800">{confirmedBooking.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Ruangan:</span>
                <span className="font-bold text-slate-800">{confirmedBooking.roomName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Jadwal:</span>
                <span className="font-bold text-slate-800">
                  {confirmedBooking.date} ({confirmedBooking.startTime} - {confirmedBooking.endTime})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Durasi:</span>
                <span className="font-bold text-slate-800">{confirmedBooking.durationHours} Jam</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Jumlah Peserta:</span>
                <span className="font-bold text-slate-800">{confirmedBooking.attendees} Orang</span>
              </div>
              <div className="flex justify-between py-1 pt-2 text-sm">
                <span className="font-bold text-slate-800">Total Tarif:</span>
                <span className="font-extrabold text-blue-600">
                  Rp {confirmedBooking.totalCost.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Tunjukkan bukti ID reservasi ini ke resepsionis gedung WorkNet pada hari pemakaian untuk mengaktifkan kartu akses pintar ruangan Anda.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  onNavigateToCatalog();
                }}
              >
                Kembali ke Katalog
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleResetForm();
                }}
              >
                Pesan Ruangan Lain
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
