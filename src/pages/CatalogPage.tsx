import React, { useState, useMemo } from 'react';
import type { Room, RoomCategory } from '../types';
import { RoomCard } from '../components/RoomCard';
import { Button } from '../components/Button';

export interface CatalogPageProps {
  rooms: Room[];
  onSelectRoom: (roomId: string) => void;
  onBookRoom: (roomId: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ rooms, onSelectRoom, onBookRoom }) => {
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  const categories: { id: RoomCategory; label: string }[] = [
    { id: 'all', label: 'Semua Ruangan' },
    { id: 'focus', label: 'Focus Pod' },
    { id: 'meeting', label: 'Meeting Room' },
    { id: 'team', label: 'Team Office' },
    { id: 'event', label: 'Event Hall' },
  ];

  // Logika filter ruangan
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchCategory = selectedCategory === 'all' || room.category === selectedCategory;
      const matchSearch =
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.facilities.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCapacity = minCapacity === 0 || room.capacity >= minCapacity;
      const matchAvailable = !onlyAvailable || room.available;

      return matchCategory && matchSearch && matchCapacity && matchAvailable;
    });
  }, [rooms, selectedCategory, searchQuery, minCapacity, onlyAvailable]);

  const handleResetFilter = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMinCapacity(0);
    setOnlyAvailable(false);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 sm:p-10 shadow-md">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-blue-100 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
            Gedung WorkNet Siap Digunakan
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Temukan Ruang Kerja Nyaman & Fleksibel di Gedung WorkNet
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Menyediakan ruang pod fokus, ruang rapat interaktif, kantor tim privat, hingga aula komunitas serbaguna. Didesain khusus untuk mendukung produktivitas freelancer, mahasiswa, komunitas, dan kalangan profesional.
          </p>
        </div>
      </section>

      {/* Filter & Kontrol Pencarian */}
      <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4" aria-label="Filter Katalog Ruangan">
        {/* Baris Atas: Kategori Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Baris Bawah: Input Cari, Dropdown Kapasitas, dan Checkbox Ketersediaan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Input Pencarian */}
          <div className="lg:col-span-2">
            <label htmlFor="search-input" className="sr-only">
              Cari nama atau fasilitas ruangan
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search-input"
                type="search"
                placeholder="Cari nama ruangan, fasilitas, atau lantai..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Filter Kapasitas */}
          <div>
            <label htmlFor="capacity-filter" className="sr-only">
              Filter Minimal Kapasitas
            </label>
            <select
              id="capacity-filter"
              value={minCapacity}
              onChange={(e) => setMinCapacity(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
            >
              <option value={0}>Semua Kapasitas</option>
              <option value={2}>Minimal 2 Orang</option>
              <option value={6}>Minimal 6 Orang</option>
              <option value={10}>Minimal 10 Orang</option>
              <option value={20}>Minimal 20+ Orang</option>
            </select>
          </div>

          {/* Checkbox Ketersediaan */}
          <div className="flex items-center px-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Tampilkan yang tersedia saja</span>
            </label>
          </div>
        </div>
      </section>

      {/* Ringkasan Hasil & Daftar Ruangan */}
      <section aria-labelledby="room-list-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="room-list-heading" className="text-xl font-bold text-slate-900">
            Daftar Ruangan Workspace
          </h2>
          <span className="text-xs text-slate-500">
            Menampilkan <strong>{filteredRooms.length}</strong> dari {rooms.length} ruangan
          </span>
        </div>

        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelectRoom={onSelectRoom}
                onBookRoom={onBookRoom}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-800">Ruangan tidak ditemukan</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Tidak ada ruangan yang cocok dengan filter atau kata kunci pencarian Anda. Coba atur ulang filter pencarian.
            </p>
            <Button variant="outline" size="sm" onClick={handleResetFilter}>
              Reset Semua Filter
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
