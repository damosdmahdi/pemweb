'use server';

import { revalidatePath } from 'next/cache';
import prisma from '../lib/prisma';
import { bookingSchema, updateBookingSchema } from '../lib/validations';

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
};

// 1. CREATE: Membuat Reservasi Baru
export async function createBookingAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      userCategory: formData.get('userCategory') as string,
      roomId: formData.get('roomId') as string,
      date: formData.get('date') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      attendees: formData.get('attendees'),
      notes: (formData.get('notes') as string) || '',
      agreeToTerms: formData.get('agreeToTerms') === 'true' || formData.get('agreeToTerms') === 'on',
    };

    // Validasi Zod sisi server
    const validationResult = bookingSchema.safeParse(rawData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        const fieldName = err.path[0]?.toString() || 'form';
        fieldErrors[fieldName] = err.message;
      });
      return {
        success: false,
        message: 'Validasi sisi server gagal. Periksa kembali isian formulir.',
        errors: fieldErrors,
      };
    }

    const validData = validationResult.data;

    // Verifikasi relasi ke entitas Room di PostgreSQL
    const room = await prisma.room.findUnique({
      where: { id: validData.roomId },
    });

    if (!room) {
      return {
        success: false,
        errors: { roomId: 'Ruangan yang dipilih tidak ditemukan dalam basis data.' },
      };
    }

    if (!room.available) {
      return {
        success: false,
        errors: { roomId: 'Ruangan ini sedang tidak tersedia untuk dipesan.' },
      };
    }

    if (validData.attendees > room.capacity) {
      return {
        success: false,
        errors: {
          attendees: `Jumlah peserta (${validData.attendees}) melebihi kapasitas ${room.name} (maks. ${room.capacity} orang).`,
        },
      };
    }

    // Hitung durasi dan total biaya
    const [startH, startM] = validData.startTime.split(':').map(Number);
    const [endH, endM] = validData.endTime.split(':').map(Number);
    const durationHours = Math.ceil((endH * 60 + endM - (startH * 60 + startM)) / 60);
    const totalCost = durationHours * room.pricePerHour;

    // Generate kode booking unik
    const bookingCode = `WN-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = await prisma.booking.create({
      data: {
        bookingCode,
        fullName: validData.fullName,
        email: validData.email,
        phone: validData.phone,
        userCategory: validData.userCategory,
        roomId: validData.roomId,
        date: validData.date,
        startTime: validData.startTime,
        endTime: validData.endTime,
        durationHours,
        attendees: validData.attendees,
        totalCost,
        notes: validData.notes,
        status: 'CONFIRMED',
      },
      include: {
        room: true,
      },
    });

    revalidatePath('/');
    revalidatePath('/manage/bookings');
    revalidatePath('/booking');

    return {
      success: true,
      message: 'Reservasi ruangan berhasil dibuat dan tersimpan ke basis data PostgreSQL!',
      data: newBooking,
    };
  } catch (error) {
    console.error('Error createBookingAction:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan pada server saat memproses reservasi.',
    };
  }
}

// 2. UPDATE: Mengubah Jadwal / Reschedule Reservasi
export async function updateBookingAction(
  _prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const rawData = {
      id: formData.get('id') as string,
      date: formData.get('date') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      attendees: formData.get('attendees'),
      notes: (formData.get('notes') as string) || '',
    };

    const validationResult = updateBookingSchema.safeParse(rawData);
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        const fieldName = err.path[0]?.toString() || 'form';
        fieldErrors[fieldName] = err.message;
      });
      return {
        success: false,
        message: 'Validasi server gagal saat mengubah jadwal.',
        errors: fieldErrors,
      };
    }

    const validData = validationResult.data;

    // Cari booking lama beserta relasi ruangannya
    const existingBooking = await prisma.booking.findUnique({
      where: { id: validData.id },
      include: { room: true },
    });

    if (!existingBooking) {
      return {
        success: false,
        message: 'Data reservasi tidak ditemukan.',
      };
    }

    if (validData.attendees > existingBooking.room.capacity) {
      return {
        success: false,
        errors: {
          attendees: `Jumlah peserta (${validData.attendees}) melebihi kapasitas ${existingBooking.room.name} (maks. ${existingBooking.room.capacity} orang).`,
        },
      };
    }

    const [startH, startM] = validData.startTime.split(':').map(Number);
    const [endH, endM] = validData.endTime.split(':').map(Number);
    const durationHours = Math.ceil((endH * 60 + endM - (startH * 60 + startM)) / 60);
    const totalCost = durationHours * existingBooking.room.pricePerHour;

    const updated = await prisma.booking.update({
      where: { id: validData.id },
      data: {
        date: validData.date,
        startTime: validData.startTime,
        endTime: validData.endTime,
        durationHours,
        attendees: validData.attendees,
        totalCost,
        notes: validData.notes,
        status: 'RESCHEDULED',
      },
      include: {
        room: true,
      },
    });

    revalidatePath('/manage/bookings');
    revalidatePath('/');

    return {
      success: true,
      message: 'Jadwal reservasi berhasil diperbarui di basis data.',
      data: updated,
    };
  } catch (error) {
    console.error('Error updateBookingAction:', error);
    return {
      success: false,
      message: 'Terjadi kegagalan server saat memperbarui data reservasi.',
    };
  }
}

// 3. DELETE: Menghapus / Membatalkan Reservasi
export async function deleteBookingAction(id: string): Promise<ActionResponse> {
  try {
    await prisma.booking.delete({
      where: { id },
    });

    revalidatePath('/manage/bookings');
    revalidatePath('/');

    return {
      success: true,
      message: 'Reservasi berhasil dihapus dari sistem.',
    };
  } catch (error) {
    console.error('Error deleteBookingAction:', error);
    return {
      success: false,
      message: 'Gagal menghapus data reservasi dari server.',
    };
  }
}
