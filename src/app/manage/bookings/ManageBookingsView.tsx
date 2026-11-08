'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import type { Booking, Room } from '@prisma/client';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Modal } from '../../../components/Modal';
import { FormField } from '../../../components/FormField';
import { updateBookingAction, deleteBookingAction } from '../../../actions/bookingActions';

export type BookingWithRoom = Booking & { room: Room };

export interface ManageBookingsViewProps {
  bookings: BookingWithRoom[];
}

export const ManageBookingsView: React.FC<ManageBookingsViewProps> = ({ bookings }) => {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State Modal Reschedule / Ubah Jadwal
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<BookingWithRoom | null>(null);

  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    attendees: 1,
    notes: '',
  });

  const handleOpenReschedule = (booking: BookingWithRoom) => {
    setActiveBooking(booking);
    setRescheduleData({
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      attendees: booking.attendees,
      notes: booking.notes || '',
    });
    setErrors({});
    setMessage(null);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;

    setErrors({});
    setMessage(null);

    const formData = new FormData();
    formData.append('id', activeBooking.id);
    formData.append('date', rescheduleData.date);
    formData.append('startTime', rescheduleData.startTime);
    formData.append('endTime', rescheduleData.endTime);
    formData.append('attendees', String(rescheduleData.attendees));
    formData.append('notes', rescheduleData.notes);

    startTransition(async () => {
      const res = await updateBookingAction(null, formData);
      if (res.success) {
        setMessage(res.message || 'Jadwal reservasi berhasil diubah.');
        setIsRescheduleModalOpen(false);
      } else {
        if (res.errors) setErrors(res.errors);
        if (res.message) setMessage(res.message);
      }
    });
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Apakah Anda yakin ingin membatalkan/menghapus reservasi dengan kode ${code}?`)) {
      startTransition(async () => {
        const res = await deleteBookingAction(id);
        if (res.message) setMessage(res.message);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Panel Pengelolaan Reservasi
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Data Reservasi Ruangan (CRUD Entitas Booking)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Data pemesanan yang terhubung relasional dengan entitas Room (PostgreSQL). Mendukung Create, Read, Update (Reschedule), dan Delete (Cancel).
          </p>
        </div>

        <Link
          href="/booking"
          className="inline-flex items-center justify-center font-medium rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 shadow-xs"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Reservasi Baru
        </Link>
      </div>

      {/* Pesan Notifikasi */}
      {message && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-sm flex items-center justify-between">
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-blue-500 hover:text-blue-800 font-bold ml-2 text-xs"
          >
            ✕ Tutup
          </button>
        </div>
      )}

      {/* Tabel Data Reservasi (READ) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Kode Booking</th>
                <th className="py-3.5 px-4">Ruangan (Relasi)</th>
                <th className="py-3.5 px-4">Nama Pemesan</th>
                <th className="py-3.5 px-4">Jadwal & Durasi</th>
                <th className="py-3.5 px-4">Peserta</th>
                <th className="py-3.5 px-4">Total Biaya</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded">
                      {b.bookingCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Link
                      href={`/rooms/${b.roomId}`}
                      className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {b.room.name}
                    </Link>
                    <span className="text-xs text-slate-500 block">Lantai {b.room.floor}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">{b.fullName}</div>
                    <div className="text-xs text-slate-500">{b.email} • {b.phone}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{b.date}</span>
                    <span className="text-xs text-slate-500 block">
                      {b.startTime} - {b.endTime} ({b.durationHours} Jam)
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-slate-800 font-medium">{b.attendees} Org</span>
                    <span className="text-xs text-slate-500 block">Maks: {b.room.capacity}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-900">
                      Rp {b.totalCost.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      variant={
                        b.status === 'CONFIRMED'
                          ? 'success'
                          : b.status === 'RESCHEDULED'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {b.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReschedule(b)}
                      disabled={isPending}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(b.id, b.bookingCode)}
                      disabled={isPending}
                    >
                      Batal
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            Belum ada data reservasi tercatat di database.
          </div>
        )}
      </div>

      {/* Modal Reschedule / Ubah Jadwal (UPDATE) */}
      {activeBooking && (
        <Modal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          title={`Ubah Jadwal: ${activeBooking.bookingCode} (${activeBooking.room.name})`}
        >
          <form onSubmit={handleRescheduleSubmit} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
              <p>
                <strong>Pemesan:</strong> {activeBooking.fullName} ({activeBooking.email})
              </p>
              <p>
                <strong>Ruangan:</strong> {activeBooking.room.name} (Kapasitas: {activeBooking.room.capacity} orang)
              </p>
            </div>

            <FormField id="date" label="Tanggal Baru" required error={errors.date}>
              <input
                id="date"
                type="date"
                required
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField id="startTime" label="Jam Mulai Baru" required error={errors.startTime}>
                <input
                  id="startTime"
                  type="time"
                  required
                  value={rescheduleData.startTime}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, startTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </FormField>

              <FormField id="endTime" label="Jam Selesai Baru" required error={errors.endTime}>
                <input
                  id="endTime"
                  type="time"
                  required
                  value={rescheduleData.endTime}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, endTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </FormField>
            </div>

            <FormField
              id="attendees"
              label="Jumlah Peserta"
              required
              error={errors.attendees}
              helperText={`Maksimal kapasitas ${activeBooking.room.name} adalah ${activeBooking.room.capacity} orang.`}
            >
              <input
                id="attendees"
                type="number"
                min="1"
                max={activeBooking.room.capacity}
                value={rescheduleData.attendees}
                onChange={(e) => setRescheduleData({ ...rescheduleData, attendees: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <FormField id="notes" label="Catatan Perubahan (Opsional)">
              <textarea
                id="notes"
                rows={2}
                value={rescheduleData.notes}
                onChange={(e) => setRescheduleData({ ...rescheduleData, notes: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Perbarui Jadwal Reservasi'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
