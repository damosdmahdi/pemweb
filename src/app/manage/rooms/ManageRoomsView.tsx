'use client';

import React, { useState, useTransition } from 'react';
import type { Room } from '@prisma/client';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Modal } from '../../../components/Modal';
import { FormField } from '../../../components/FormField';
import {
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
  toggleRoomAvailabilityAction,
} from '../../../actions/roomActions';

export interface ManageRoomsViewProps {
  rooms: Room[];
}

export const ManageRoomsView: React.FC<ManageRoomsViewProps> = ({ rooms }) => {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State Modal Tambah/Edit Ruangan
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form State
  const initialFormState = {
    name: '',
    category: 'focus',
    categoryLabel: 'Focus Pod',
    floor: 1,
    capacity: 2,
    pricePerHour: 50000,
    description: '',
    facilities: 'WiFi 100 Mbps\nStopkontak AC & USB\nMeja Ergonomis',
    imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
    area: '12 m²',
    wifiSpeed: '100 Mbps Dedicated',
    powerOutlets: 4,
    hasProjector: false,
    hasWhiteboard: true,
    hasSoundSystem: false,
    hasCoffeeAccess: true,
    rules: 'Menjaga kebersihan meja kerja.\nDilarang merokok di dalam gedung.\nCheck-out tepat waktu.',
  };

  const [roomFormData, setRoomFormData] = useState(initialFormState);

  const handleOpenAddModal = () => {
    setEditingRoom(null);
    setRoomFormData(initialFormState);
    setErrors({});
    setMessage(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    setRoomFormData({
      name: room.name,
      category: room.category,
      categoryLabel: room.categoryLabel,
      floor: room.floor,
      capacity: room.capacity,
      pricePerHour: room.pricePerHour,
      description: room.description,
      facilities: room.facilities.join('\n'),
      imageUrl: room.imageUrl,
      area: room.area,
      wifiSpeed: room.wifiSpeed,
      powerOutlets: room.powerOutlets,
      hasProjector: room.hasProjector,
      hasWhiteboard: room.hasWhiteboard,
      hasSoundSystem: room.hasSoundSystem,
      hasCoffeeAccess: room.hasCoffeeAccess,
      rules: room.rules.join('\n'),
    });
    setErrors({});
    setMessage(null);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);

    const formData = new FormData();
    formData.append('name', roomFormData.name);
    formData.append('category', roomFormData.category);
    formData.append('categoryLabel', roomFormData.categoryLabel);
    formData.append('floor', String(roomFormData.floor));
    formData.append('capacity', String(roomFormData.capacity));
    formData.append('pricePerHour', String(roomFormData.pricePerHour));
    formData.append('description', roomFormData.description);
    formData.append('facilities', roomFormData.facilities);
    formData.append('imageUrl', roomFormData.imageUrl);
    formData.append('area', roomFormData.area);
    formData.append('wifiSpeed', roomFormData.wifiSpeed);
    formData.append('powerOutlets', String(roomFormData.powerOutlets));
    formData.append('hasProjector', String(roomFormData.hasProjector));
    formData.append('hasWhiteboard', String(roomFormData.hasWhiteboard));
    formData.append('hasSoundSystem', String(roomFormData.hasSoundSystem));
    formData.append('hasCoffeeAccess', String(roomFormData.hasCoffeeAccess));
    formData.append('rules', roomFormData.rules);

    startTransition(async () => {
      let res;
      if (editingRoom) {
        res = await updateRoomAction(editingRoom.id, null, formData);
      } else {
        res = await createRoomAction(null, formData);
      }

      if (res.success) {
        setMessage(res.message || 'Operasi berhasil.');
        setIsFormModalOpen(false);
      } else {
        if (res.errors) setErrors(res.errors);
        if (res.message) setMessage(res.message);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ruangan "${name}"? Seluruh reservasi yang berelasi dengan ruangan ini juga akan ikut terhapus otomatis.`)) {
      startTransition(async () => {
        const res = await deleteRoomAction(id);
        if (res.message) setMessage(res.message);
      });
    }
  };

  const handleToggleAvailability = (id: string) => {
    startTransition(async () => {
      const res = await toggleRoomAvailabilityAction(id);
      if (res.message) setMessage(res.message);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Panel Pengelola Gedung
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Kelola Ruangan Workspace (CRUD Entitas Room)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Operasi Create, Read, Update, Delete data ruangan yang tersimpan secara persisten pada basis data PostgreSQL via Prisma ORM.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAddModal} disabled={isPending}>
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Ruangan Baru
        </Button>
      </div>

      {/* Pesan Notifikasi Sukses / Error */}
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

      {/* Tabel Data Ruangan (READ) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nama Ruangan</th>
                <th className="py-3.5 px-4">Kategori & Lt.</th>
                <th className="py-3.5 px-4">Kapasitas</th>
                <th className="py-3.5 px-4">Tarif Sewa</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{room.name}</div>
                    <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">{room.description}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-medium text-slate-700">{room.categoryLabel}</span>
                    <span className="text-xs text-slate-500 block">Lantai {room.floor}</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{room.capacity} Orang</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-blue-600">
                      Rp {room.pricePerHour.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-slate-500 block">/ jam</span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(room.id)}
                      title="Klik untuk mengubah status ketersediaan"
                      className="cursor-pointer"
                    >
                      <Badge variant={room.available ? 'success' : 'danger'} dot>
                        {room.available ? 'Tersedia' : 'Penuh'}
                      </Badge>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(room)}
                      disabled={isPending}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(room.id, room.name)}
                      disabled={isPending}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rooms.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm">
            Belum ada ruangan yang terdaftar di database.
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Ruangan (CREATE & UPDATE) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingRoom ? `Edit Ruangan: ${editingRoom.name}` : 'Tambah Ruangan Baru ke Gedung'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <FormField
            id="name"
            label="Nama Ruangan"
            required
            error={errors.name}
            helperText="Minimal 3 karakter."
          >
            <input
              id="name"
              type="text"
              required
              value={roomFormData.name}
              onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="category" label="Kategori" required error={errors.category}>
              <select
                id="category"
                value={roomFormData.category}
                onChange={(e) => {
                  const val = e.target.value;
                  const labels: Record<string, string> = {
                    focus: 'Focus Pod',
                    meeting: 'Meeting Room',
                    team: 'Team Office',
                    event: 'Event Hall',
                  };
                  setRoomFormData({
                    ...roomFormData,
                    category: val,
                    categoryLabel: labels[val] || val,
                  });
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="focus">Focus Pod</option>
                <option value="meeting">Meeting Room</option>
                <option value="team">Team Office</option>
                <option value="event">Event Hall</option>
              </select>
            </FormField>

            <FormField id="floor" label="Lantai Gedung" required error={errors.floor}>
              <input
                id="floor"
                type="number"
                min="1"
                max="10"
                value={roomFormData.floor}
                onChange={(e) => setRoomFormData({ ...roomFormData, floor: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField id="capacity" label="Kapasitas Maksimal (Orang)" required error={errors.capacity}>
              <input
                id="capacity"
                type="number"
                min="1"
                max="200"
                value={roomFormData.capacity}
                onChange={(e) => setRoomFormData({ ...roomFormData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <FormField id="pricePerHour" label="Tarif Sewa (Rp / jam)" required error={errors.pricePerHour}>
              <input
                id="pricePerHour"
                type="number"
                min="10000"
                step="5000"
                value={roomFormData.pricePerHour}
                onChange={(e) => setRoomFormData({ ...roomFormData, pricePerHour: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
          </div>

          <FormField id="description" label="Deskripsi Ruangan" required error={errors.description}>
            <textarea
              id="description"
              rows={2}
              value={roomFormData.description}
              onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <FormField id="imageUrl" label="URL Foto Ruangan" required error={errors.imageUrl}>
            <input
              id="imageUrl"
              type="url"
              value={roomFormData.imageUrl}
              onChange={(e) => setRoomFormData({ ...roomFormData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <FormField
            id="facilities"
            label="Daftar Fasilitas (Pisahkan dengan baris baru)"
            required
            error={errors.facilities}
          >
            <textarea
              id="facilities"
              rows={3}
              value={roomFormData.facilities}
              onChange={(e) => setRoomFormData({ ...roomFormData, facilities: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-xs"
            />
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Menyimpan...' : editingRoom ? 'Simpan Perubahan' : 'Tambah Ruangan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
