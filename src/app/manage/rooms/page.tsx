import prisma from '../../../lib/prisma';
import { ManageRoomsView } from './ManageRoomsView';

export const dynamic = 'force-dynamic';

export default async function ManageRoomsPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { floor: 'asc' },
  });

  return <ManageRoomsView rooms={rooms} />;
}
