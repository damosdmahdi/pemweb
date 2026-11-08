import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '../../../lib/prisma';
import { Badge } from '../../../components/Badge';

export const dynamic = 'force-dynamic';

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      bookings: {
        where: { status: 'CONFIRMED' },
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!room) {
    notFound();
  }

  // Ambil semua ruangan lain untuk quick switcher
  const allRooms = await prisma.room.findMany({
    select: { id: true, name: true, floor: true, categoryLabel: true },
    orderBy: { floor: 'asc' },
  });

  return (
    <div className="space-y-6">
      {/* Tombol Kembali & Selector Ruangan Cepat */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded p-1"
          aria-label="Kembali ke katalog ruangan"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Kembali ke Katalog</span>
        </Link>

        {/* Quick Room Switcher Links */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Lihat Ruang Lain:</span>
          <div className="flex gap-1.5">
            {allRooms
              .filter((r) => r.id !== room.id)
              .map((r) => (
                <Link
                  key={r.id}
                  href={`/rooms/${r.id}`}
                  className="text-xs bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md shrink-0 transition-colors"
                >
                  {r.name} (Lt. {r.floor})
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Konten Utama Detail Ruangan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri & Tengah: Foto, Deskripsi, Spesifikasi */}
        <div className="lg:col-span-2 space-y-6">
          {/* Foto Ruangan */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video shadow-xs">
            <img
              src={room.imageUrl}
              alt={`Dokumentasi interior ruangan ${room.name} lantai ${room.floor}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant={room.available ? 'success' : 'danger'} dot>
                {room.available ? 'Status: Siap Dipesan' : 'Status: Sedang Penuh'}
              </Badge>
              <Badge variant="neutral">{room.categoryLabel}</Badge>
            </div>
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg font-medium">
              Gedung WorkNet — Lantai {room.floor}
            </div>
          </div>

          {/* Judul & Deskripsi Ruangan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Spesifikasi Ruangan
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {room.name}
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {room.description}
            </p>

            {/* Grid Spesifikasi Teknis */}
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Parameter & Fasilitas Teknis</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Luas Ruangan</span>
                  <span className="text-sm font-bold text-slate-800">{room.area}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Kapasitas Maksimal</span>
                  <span className="text-sm font-bold text-slate-800">{room.capacity} Orang</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Koneksi Internet</span>
                  <span className="text-sm font-bold text-slate-800">{room.wifiSpeed}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Stopkontak Listrik</span>
                  <span className="text-sm font-bold text-slate-800">{room.powerOutlets} Titik</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Proyektor / TV</span>
                  <span className="text-sm font-bold text-slate-800">
                    {room.hasProjector ? 'Tersedia' : 'Tidak Ada'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Papan Whiteboard</span>
                  <span className="text-sm font-bold text-slate-800">
                    {room.hasWhiteboard ? 'Tersedia' : 'Tidak Ada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Fasilitas Lengkap */}
            <div className="pt-4 border-t border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Fasilitas yang Termasuk</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {room.facilities.map((fac, idx) => (
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
              {room.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>

          {/* Relasi Database: Daftar Reservasi Terkini untuk Ruangan Ini */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Jadwal Reservasi Terkonfirmasi ({room.bookings.length})
              </h2>
              <span className="text-xs text-slate-500">Relasi Database PostgreSQL (1 Room → N Bookings)</span>
            </div>
            {room.bookings.length > 0 ? (
              <div className="space-y-2">
                {room.bookings.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{b.date}</span>
                      <span className="text-slate-500 ml-2">({b.startTime} - {b.endTime})</span>
                    </div>
                    <span className="text-slate-600">Oleh: <strong>{b.fullName}</strong></span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Belum ada reservasi aktif pada ruangan ini. Anda dapat memesan jadwal pertama!</p>
            )}
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
                  Rp {room.pricePerHour.toLocaleString('id-ID')}
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
                <span className="font-semibold text-slate-800">1 - {room.capacity} Orang</span>
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
              {room.available ? (
                <Link
                  href={`/booking?roomId=${room.id}`}
                  className="w-full inline-flex items-center justify-center font-medium rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white text-base px-5 py-2.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Pesan Ruangan Ini
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex items-center justify-center font-medium rounded-lg bg-slate-200 text-slate-500 text-base px-5 py-2.5 cursor-not-allowed"
                >
                  Ruangan Sedang Penuh
                </button>
              )}

              {!room.available && (
                <p className="text-xs text-rose-600 text-center font-medium">
                  Ruangan ini sedang dalam masa sewa aktif. Silakan pilih ruangan lain di katalog.
                </p>
              )}
            </div>

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
}
