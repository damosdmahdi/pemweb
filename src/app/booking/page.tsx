import prisma from '../../lib/prisma';
import { BookingFormView } from './BookingFormView';

export const dynamic = 'force-dynamic';

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ roomId?: string }>;
}) {
  const { roomId } = await searchParams;

  const rooms = await prisma.room.findMany({
    orderBy: { floor: 'asc' },
  });

  return <BookingFormView rooms={rooms} initialRoomId={roomId} />;
}
