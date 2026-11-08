import React from 'react';
import type { Room } from '../types';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

export interface DetailPageProps {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoomId: (id: string) => void;
  onNavigateToCatalog: () => void;
  onNavigateToBooking: (roomId: string) => void;
}

export const DetailPage: React.FC<DetailPageProps> = ({
  rooms,
  selectedRoomId,
  onSelectRoomId,
  onNavigateToCatalog,
  onNavigateToBooking,
}) => {
  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  return (
    <div className="space-y-6">
      {/* Tombol Kembali & Selector Ruangan Cepat */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={onNavigateToCatalog}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded p-1"
          aria-label="Kembali ke halaman katalog ruangan"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Kembali ke Katalog</span>
        </button>

        {/* Quick Room Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="quick-room-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Pilih Ruangan Lain:
          </label>
          <select
            id="quick-room-select"
            value={currentRoom.id}
            onChange={(e) => onSelectRoomId(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 w-full sm:w-auto"
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} (Lt. {room.floor} - {room.categoryLabel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Konten Utama Detail Ruangan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri & Tengah: Foto, Deskripsi, Spesifikasi */}
        <div className="lg:col-span-2 space-y-6">
          {/* Foto Ruangan */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video shadow-xs">
            <img
              src={currentRoom.imageUrl}
              alt={`Dokumentasi interior ruangan ${currentRoom.name} lantai ${currentRoom.floor}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant={currentRoom.available ? 'success' : 'danger'} dot>
                {currentRoom.available ? 'Status: Siap Dipesan' : 'Status: Sedang Penuh'}
              </Badge>
              <Badge variant="neutral">{currentRoom.categoryLabel}</Badge>
            </div>
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg font-medium">
              Gedung WorkNet — Lantai {currentRoom.floor}
            </div>
          </div>

          {/* Judul & Deskripsi Ruangan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Spesifikasi Ruangan
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {currentRoom.name}
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {currentRoom.description}
            </p>

            {/* Grid Spesifikasi Teknis */}
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Parameter & Fasilitas Teknis</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Luas Ruangan</span>
                  <span className="text-sm font-bold text-slate-800">{currentRoom.specifications.area}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Kapasitas Maksimal</span>
                  <span className="text-sm font-bold text-slate-800">{currentRoom.capacity} Orang</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Koneksi Internet</span>
                  <span className="text-sm font-bold text-slate-800">{currentRoom.specifications.wifiSpeed}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Stopkontak Listrik</span>
                  <span className="text-sm font-bold text-slate-800">{currentRoom.specifications.powerOutlets} Titik</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Proyektor / TV</span>
                  <span className="text-sm font-bold text-slate-800">
                    {currentRoom.specifications.hasProjector ? 'Tersedia' : 'Tidak Ada'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Papan Whiteboard</span>
                  <span className="text-sm font-bold text-slate-800">
                    {currentRoom.specifications.hasWhiteboard ? 'Tersedia' : 'Tidak Ada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Fasilitas Lengkap */}
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Fasilitas yang Termasuk</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentRoom.facilities.map((fac, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tata Tertib Penggunaan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Tata Tertib & Kebijakan Gedung WorkNet</span>
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600 leading-relaxed">
              {currentRoom.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Kolom Kanan: Kartu Harga & Aksi Booking */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24 space-y-6">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Biaya Sewa
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-blue-600">
                  Rp {currentRoom.pricePerHour.toLocaleString('id-ID')}
                </span>
                <span className="text-sm text-slate-500 font-medium">/ jam</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 border-t border-b border-slate-100 py-4">
              <div className="flex justify-between">
                <span>Minimal Sewa</span>
                <span className="font-semibold text-slate-800">1 Jam</span>
              </div>
              <div className="flex justify-between">
                <span>Kapasitas Rekomendasi</span>
                <span className="font-semibold text-slate-800">1 - {currentRoom.capacity} Orang</span>
              </div>
              <div className="flex justify-between">
                <span>Free Mineral Water</span>
                <span className="font-semibold text-slate-800">Tersedia di Pantry</span>
              </div>
              <div className="flex justify-between">
                <span>Akses Gedung</span>
                <span className="font-semibold text-slate-800">Pukul 07.00 - 22.00 WIB</span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="space-y-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!currentRoom.available}
                onClick={() => onNavigateToBooking(currentRoom.id)}
                aria-label={currentRoom.available ? `Lanjutkan pemesanan ruangan ${currentRoom.name}` : `Ruangan ${currentRoom.name} sedang tidak tersedia`}
              >
                {currentRoom.available ? 'Pesan Ruangan Ini' : 'Ruangan Sedang Penuh'}
              </Button>

              {!currentRoom.available && (
                <p className="text-xs text-rose-600 text-center font-medium">
                  Ruangan ini sedang dalam masa sewa aktif. Silakan pilih ruangan lain di katalog.
                </p>
              )}
            </div>

            {/* Jaminan Layanan */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Garansi Layanan WorkNet:</p>
              <p>• Jaringan internet cadangan (Failover link otomatis).</p>
              <p>• Bantuan teknisi resepsionis standby di Lantai 1.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
