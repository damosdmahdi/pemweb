'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../lib/prisma';
import { roomSchema } from '../lib/validations';
import type { ActionResponse } from './bookingActions';

// Helper untuk parsing fasilitas dan aturan dari textarea/input multi-line
const parseList = (input: unknown): string[] => {
  if (Array.isArray(input)) return input.map(String).filter((s) => s.trim().length > 0);
  if (typeof input === 'string') {
    return input
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [];
};

// 1. CREATE: Menambahkan Ruangan Baru ke Gedung
export async function createRoomAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      categoryLabel: formData.get('categoryLabel') as string,
      floor: formData.get('floor'),
      capacity: formData.get('capacity'),
      pricePerHour: formData.get('pricePerHour'),
      description: formData.get('description') as string,
      facilities: parseList(formData.get('facilities')),
      available: formData.get('available') === 'true' || formData.get('available') === 'on',
      imageUrl: formData.get('imageUrl') as string,
      area: formData.get('area') as string,
      wifiSpeed: formData.get('wifiSpeed') as string,
      powerOutlets: formData.get('powerOutlets'),
      hasProjector: formData.get('hasProjector') === 'true' || formData.get('hasProjector') === 'on',
      hasWhiteboard: formData.get('hasWhiteboard') === 'true' || formData.get('hasWhiteboard') === 'on',
      hasSoundSystem: formData.get('hasSoundSystem') === 'true' || formData.get('hasSoundSystem') === 'on',
      hasCoffeeAccess: formData.get('hasCoffeeAccess') === 'true' || formData.get('hasCoffeeAccess') === 'on',
      rules: parseList(formData.get('rules')),
    };

    const validationResult = roomSchema.safeParse(rawData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        const fieldName = err.path[0]?.toString() || 'form';
        fieldErrors[fieldName] = err.message;
      });
      return {
        success: false,
        message: 'Validasi sisi server gagal saat membuat ruangan baru.',
        errors: fieldErrors,
      };
    }

    const validData = validationResult.data;

    const newRoom = await prisma.room.create({
      data: validData,
    });

    revalidatePath('/');
    revalidatePath('/manage/rooms');

    return {
      success: true,
      message: `Ruangan "${newRoom.name}" berhasil ditambahkan ke database!`,
      data: newRoom,
    };
  } catch (error) {
    console.error('Error createRoomAction:', error);
    return {
      success: false,
      message: 'Terjadi kegagalan server saat menambahkan ruangan.',
    };
  }
}

// 2. UPDATE: Mengubah Data / Spesifikasi Ruangan
export async function updateRoomAction(
  id: string,
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      categoryLabel: formData.get('categoryLabel') as string,
      floor: formData.get('floor'),
      capacity: formData.get('capacity'),
      pricePerHour: formData.get('pricePerHour'),
      description: formData.get('description') as string,
      facilities: parseList(formData.get('facilities')),
      available: formData.get('available') === 'true' || formData.get('available') === 'on',
      imageUrl: formData.get('imageUrl') as string,
      area: formData.get('area') as string,
      wifiSpeed: formData.get('wifiSpeed') as string,
      powerOutlets: formData.get('powerOutlets'),
      hasProjector: formData.get('hasProjector') === 'true' || formData.get('hasProjector') === 'on',
      hasWhiteboard: formData.get('hasWhiteboard') === 'true' || formData.get('hasWhiteboard') === 'on',
      hasSoundSystem: formData.get('hasSoundSystem') === 'true' || formData.get('hasSoundSystem') === 'on',
      hasCoffeeAccess: formData.get('hasCoffeeAccess') === 'true' || formData.get('hasCoffeeAccess') === 'on',
      rules: parseList(formData.get('rules')),
    };

    const validationResult = roomSchema.safeParse(rawData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        const fieldName = err.path[0]?.toString() || 'form';
        fieldErrors[fieldName] = err.message;
      });
      return {
        success: false,
        message: 'Validasi sisi server gagal saat memperbarui data ruangan.',
        errors: fieldErrors,
      };
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: validationResult.data,
    });

    revalidatePath('/');
    revalidatePath(`/rooms/${id}`);
    revalidatePath('/manage/rooms');

    return {
      success: true,
      message: `Data ruangan "${updatedRoom.name}" berhasil diperbarui.`,
      data: updatedRoom,
    };
  } catch (error) {
    console.error('Error updateRoomAction:', error);
    return {
      success: false,
      message: 'Gagal memperbarui data ruangan.',
    };
  }
}

// 3. DELETE: Menghapus Ruangan dari Gedung
export async function deleteRoomAction(id: string): Promise<ActionResponse> {
  try {
    // Karena onDelete: Cascade pada relasi Booking, booking terkait akan ikut terhapus otomatis
    const deleted = await prisma.room.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/manage/rooms');
    revalidatePath('/manage/bookings');

    return {
      success: true,
      message: `Ruangan "${deleted.name}" beserta relasi reservasi terkait berhasil dihapus dari database.`,
    };
  } catch (error) {
    console.error('Error deleteRoomAction:', error);
    return {
      success: false,
      message: 'Gagal menghapus ruangan dari database.',
    };
  }
}

// 4. TOGGLE: Mengubah Status Ketersediaan Ruangan (Tersedia / Penuh)
export async function toggleRoomAvailabilityAction(id: string): Promise<ActionResponse> {
  try {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      return { success: false, message: 'Ruangan tidak ditemukan.' };
    }

    const updated = await prisma.room.update({
      where: { id },
      data: { available: !room.available },
    });

    revalidatePath('/');
    revalidatePath(`/rooms/${id}`);
    revalidatePath('/manage/rooms');

    return {
      success: true,
      message: `Status ruangan "${updated.name}" kini ${updated.available ? 'Tersedia' : 'Penuh'}.`,
      data: updated,
    };
  } catch (error) {
    console.error('Error toggleRoomAvailabilityAction:', error);
    return { success: false, message: 'Gagal mengubah status ruangan.' };
  }
}
