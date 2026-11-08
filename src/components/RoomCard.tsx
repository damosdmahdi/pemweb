import React from 'react';
import type { Room } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';

export interface RoomCardProps {
  room: Room;
  onSelectRoom: (roomId: string) => void;
  onBookRoom: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelectRoom, onBookRoom }) => {
  return (
    <article className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
      {/* Gambar Ruangan */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={room.imageUrl}
          alt={`Foto interior ${room.name} yang berlokasi di lantai ${room.floor}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={room.available ? 'success' : 'danger'} dot>
            {room.available ? 'Tersedia' : 'Penuh'}
          </Badge>
          <Badge variant="neutral">{room.categoryLabel}</Badge>
        </div>
      </div>

      {/* Konten Kartu */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{room.name}</h3>
          <span className="text-xs font-medium text-slate-500 shrink-0 bg-slate-100 px-2 py-1 rounded">
            Lt. {room.floor}
          </span>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {room.description}
        </p>

        {/* Spesifikasi Singkat */}
        <div className="flex items-center gap-4 text-xs text-slate-600 border-t border-b border-slate-100 py-3 mb-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Maks. <strong>{room.capacity}</strong> Orang</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span>{room.specifications.wifiSpeed}</span>
          </div>
        </div>

        {/* Harga & Tombol Aksi */}
        <div className="mt-auto pt-2 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500 font-medium">Tarif Sewa</span>
            <span className="text-base font-bold text-blue-600">
              Rp {room.pricePerHour.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-normal text-slate-500">/ jam</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectRoom(room.id)}
              aria-label={`Lihat detail lengkap ruangan ${room.name}`}
            >
              Lihat Detail
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!room.available}
              onClick={() => onBookRoom(room.id)}
              aria-label={room.available ? `Pesan ruangan ${room.name}` : `Ruangan ${room.name} sedang penuh`}
            >
              {room.available ? 'Pesan Sekarang' : 'Penuh'}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};
