import prisma from '../../../lib/prisma';
import { ManageBookingsView } from './ManageBookingsView';

export const dynamic = 'force-dynamic';

export default async function ManageBookingsPage() {
  // Read Data dari PostgreSQL via Prisma dengan Relasi One-to-Many ke Room
  const bookings = await prisma.booking.findMany({
    include: {
      room: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return <ManageBookingsView bookings={bookings} />;
}
