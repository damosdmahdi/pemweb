import prisma from '../lib/prisma';
import { CatalogView } from './CatalogView';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Read Data dari PostgreSQL via Prisma ORM
  const rooms = await prisma.room.findMany({
    orderBy: { floor: 'asc' },
  });

  return <CatalogView rooms={rooms} />;
}
