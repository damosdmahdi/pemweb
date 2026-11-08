'use client';

import React, { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import type { Room, Booking } from '@prisma/client';
import { FormField } from '../../components/FormField';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { createBookingAction, type ActionResponse } from '../../actions/bookingActions';

export interface BookingFormViewProps {
  rooms: Room[];
  initialRoomId?: string;
}

export const BookingFormView: React.FC<BookingFormViewProps> = ({ rooms, initialRoomId }) => {
  const todayStr = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const defaultRoomId = initialRoomId || (rooms.length > 0 ? rooms[0].id : '');

  const [formData, setFormData] = useState({
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

  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === formData.roomId) || rooms[0];
  }, [rooms, formData.roomId]);

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

  const validateClient = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Nama lengkap wajib diisi.';
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'Nama lengkap minimal 3 karakter.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Format email tidak valid (contoh: nama@domain.com).';
    }

    const phoneDigits = formData.phone.replace(/[^0-9]/g, '');
    if (!formData.phone.trim()) {
      errors.phone = 'Nomor WhatsApp / telepon wajib diisi.';
    } else if (phoneDigits.length < 10 || phoneDigits.length > 14) {
      errors.phone = 'Nomor telepon harus 10 sampai 14 digit angka.';
    }

    if (!formData.userCategory) {
      errors.userCategory = 'Silakan pilih kategori peminjam Anda.';
    }

    if (!formData.roomId) {
      errors.roomId = 'Ruangan wajib dipilih.';
    } else if (selectedRoom && !selectedRoom.available) {
      errors.roomId = 'Ruangan ini sedang penuh dan tidak dapat dipesan.';
    }

    if (!formData.date) {
      errors.date = 'Tanggal pemesanan wajib diisi.';
    } else if (formData.date < todayStr) {
      errors.date = 'Tanggal pemesanan tidak boleh merupakan tanggal lampau.';
    }

    if (!formData.startTime) {
      errors.startTime = 'Jam mulai wajib diisi.';
    }
    if (!formData.endTime) {
      errors.endTime = 'Jam selesai wajib diisi.';
    } else if (formData.startTime && formData.endTime) {
      const [startH, startM] = formData.startTime.split(':').map(Number);
      const [endH, endM] = formData.endTime.split(':').map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;

      if (endMin <= startMin) {
        errors.endTime = 'Jam selesai harus lebih akhir dari jam mulai.';
      } else if (endMin - startMin < 60) {
        errors.endTime = 'Durasi pemesanan minimal adalah 1 jam (60 menit).';
      }
    }

    const attendeesNum = Number(formData.attendees);
    if (!formData.attendees || isNaN(attendeesNum) || attendeesNum <= 0) {
      errors.attendees = 'Jumlah peserta harus minimal 1 orang.';
    } else if (selectedRoom && attendeesNum > selectedRoom.capacity) {
      errors.attendees = `Jumlah peserta (${attendeesNum}) melebihi kapasitas ${selectedRoom.name} (maks. ${selectedRoom.capacity} orang).`;
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'Anda wajib menyetujui tata tertib dan ketentuan gedung WorkNet.';
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerErrors({});
    setServerMessage(null);

    const validationErrors = validateClient();
    setClientErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) element.focus();
      return;
    }

    // Buat FormData untuk dikirim ke Next.js Server Action
    const dataToSend = new FormData();
    dataToSend.append('fullName', formData.fullName);
    dataToSend.append('email', formData.email);
    dataToSend.append('phone', formData.phone);
    dataToSend.append('userCategory', formData.userCategory);
    dataToSend.append('roomId', formData.roomId);
    dataToSend.append('date', formData.date);
    dataToSend.append('startTime', formData.startTime);
    dataToSend.append('endTime', formData.endTime);
    dataToSend.append('attendees', formData.attendees);
    dataToSend.append('notes', formData.notes);
    dataToSend.append('agreeToTerms', String(formData.agreeToTerms));

    startTransition(async () => {
      const res: ActionResponse = await createBookingAction(null, dataToSend);
      if (res.success && res.data) {
        setConfirmedBooking(res.data as Booking);
        setIsSuccessModalOpen(true);
      } else {
        if (res.errors) {
          setServerErrors(res.errors);
        }
        if (res.message) {
          setServerMessage(res.message);
        }
      }
    });
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
    setClientErrors({});
    setServerErrors({});
    setServerMessage(null);
    setIsSuccessModalOpen(false);
  };

  // Menggabungkan pesan error dari klien dan server
  const getFieldError = (field: string) => serverErrors[field] || clientErrors[field];

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Formulir Reservasi Ruangan (Persisten ke PostgreSQL)
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Lengkapi data di bawah ini untuk memesan ruangan kerja di gedung WorkNet. Masukan divalidasi ganda: di sisi klien dan di sisi server via Zod Schema.
        </p>
      </div>

      {serverMessage && !isSuccessModalOpen && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{serverMessage}</span>
        </div>
      )}

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
                error={getFieldError('fullName')}
                helperText="Masukkan nama lengkap pemesan."
              >
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Contoh: Damos Kurniawan"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                    getFieldError('fullName')
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-blue-600'
                  }`}
                />
              </FormField>

              {/* Baris Email & No Telepon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  id="email"
                  label="Alamat Email"
                  required
                  error={getFieldError('email')}
                  helperText="Bukti reservasi akan dikirimkan ke email ini."
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                      getFieldError('email')
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </FormField>

                <FormField
                  id="phone"
                  label="Nomor WhatsApp / Telepon"
                  required
                  error={getFieldError('phone')}
                  helperText="Format 10-14 digit angka."
                >
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                      getFieldError('phone')
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
                error={getFieldError('userCategory')}
                helperText="Pilih kategori profil pengguna Anda."
              >
                <select
                  id="userCategory"
                  name="userCategory"
                  value={formData.userCategory}
                  onChange={(e) => setFormData({ ...formData, userCategory: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                    getFieldError('userCategory')
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

              <FormField
                id="roomId"
                label="Pilihan Ruangan di Gedung WorkNet"
                required
                error={getFieldError('roomId')}
                helperText="Data diambil langsung dari PostgreSQL via Prisma ORM."
              >
                <select
                  id="roomId"
                  name="roomId"
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                    getFieldError('roomId')
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
                <FormField
                  id="date"
                  label="Tanggal Pemesanan"
                  required
                  error={getFieldError('date')}
                  helperText="Minimal hari ini."
                >
                  <input
                    id="date"
                    name="date"
                    type="date"
                    min={todayStr}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                      getFieldError('date')
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </FormField>

                <FormField
                  id="startTime"
                  label="Jam Mulai"
                  required
                  error={getFieldError('startTime')}
                  helperText="Format 24 jam."
                >
                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                      getFieldError('startTime')
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-blue-600'
                    }`}
                  />
                </FormField>

                <FormField
                  id="endTime"
                  label="Jam Selesai"
                  required
                  error={getFieldError('endTime')}
                  helperText="Min. 1 jam durasi."
                >
                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                      getFieldError('endTime')
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
                error={getFieldError('attendees')}
                helperText={`Kapasitas maksimal ruangan ini adalah ${selectedRoom ? selectedRoom.capacity : 0} orang.`}
              >
                <input
                  id="attendees"
                  name="attendees"
                  type="number"
                  min="1"
                  max={selectedRoom ? selectedRoom.capacity : 50}
                  placeholder="Jumlah orang"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 text-slate-900 ${
                    getFieldError('attendees')
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-blue-600'
                  }`}
                />
              </FormField>

              {/* Catatan Kebutuhan Khusus */}
              <FormField
                id="notes"
                label="Catatan Tambahan (Opsional)"
                helperText="Contoh: Permintaan tata letak meja khusus atau penambahan proyektor."
              >
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Tuliskan catatan kebutuhan di sini..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Saya menyetujui seluruh tata tertib dan kebijakan penggunaan gedung WorkNet, serta bertanggung jawab penuh atas fasilitas yang digunakan selama masa sewa.{' '}
                  <span className="text-rose-500 font-bold" aria-hidden="true">*</span>
                </span>
              </label>

              {getFieldError('agreeToTerms') && (
                <p id="agreeToTerms-error" role="alert" className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-1.5 pl-7">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{getFieldError('agreeToTerms')}</span>
                </p>
              )}
            </div>

            {/* Tombol Aksi Submit */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleResetForm} disabled={isPending}>
                Atur Ulang Form
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? 'Menyimpan ke Server...' : 'Kirim Reservasi Ruangan'}
              </Button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Rincian Estimasi Biaya */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24 space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Ringkasan Estimasi Biaya
            </h2>

            {selectedRoom && (
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
            )}

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

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-sm font-bold text-slate-800">Total Estimasi:</span>
              <span className="text-xl font-extrabold text-blue-600">
                Rp {totalCost.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="bg-blue-50 text-blue-900 p-3 rounded-xl text-xs space-y-1">
              <p className="font-semibold">Integrasi Database PostgreSQL:</p>
              <p>• Data otomatis tersimpan persisten melalui Prisma ORM.</p>
              <p>• Periksa riwayat reservasi Anda di menu &quot;Data Reservasi&quot;.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Sukses Reservasi */}
      {confirmedBooking && (
        <Modal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          title="Reservasi Berhasil Tersimpan di Database!"
        >
          <div className="space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold">Pemesanan Tersimpan Persisten (PostgreSQL)</h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Kode Booking: <strong className="font-mono text-emerald-950 font-bold">{confirmedBooking.bookingCode}</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Nama Pemesan:</span>
                <span className="font-bold text-slate-800">{confirmedBooking.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Jadwal:</span>
                <span className="font-bold text-slate-800">
                  {confirmedBooking.date} ({confirmedBooking.startTime} - {confirmedBooking.endTime})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Durasi Sewa:</span>
                <span className="font-bold text-slate-800">{confirmedBooking.durationHours} Jam</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Jumlah Peserta:</span>
                <span className="font-bold text-slate-800">{confirmedBooking.attendees} Orang</span>
              </div>
              <div className="flex justify-between py-1 pt-2 text-sm">
                <span className="font-bold text-slate-800">Total Biaya:</span>
                <span className="font-extrabold text-blue-600">
                  Rp {confirmedBooking.totalCost.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Link
                href="/manage/bookings"
                className="inline-flex items-center justify-center font-medium rounded-lg transition-colors border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs px-3 py-2"
              >
                Lihat di Panel Reservasi
              </Link>
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
