import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export async function getAvailability(artistId: string) {
  const [availability, blockedDates] = await Promise.all([
    prisma.availability.findMany({ where: { artistId, isActive: true } }),
    prisma.blockedDate.findMany({
      where: { artistId, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
    }),
  ]);
  return { availability, blockedDates };
}

export async function setAvailability(artistId: string, userId: string, slots: Array<{
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}>) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw new AppError(404, 'Artist not found');
  if (artist.userId !== userId) throw new AppError(403, 'Not authorized');

  for (const slot of slots) {
    if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
      throw new AppError(400, 'Invalid day of week');
    }
  }

  const results = await Promise.all(
    slots.map((slot) =>
      prisma.availability.upsert({
        where: { artistId_dayOfWeek: { artistId, dayOfWeek: slot.dayOfWeek } },
        update: { startTime: slot.startTime, endTime: slot.endTime, isActive: slot.isActive },
        create: { artistId, ...slot },
      })
    )
  );

  return results;
}

export async function addBlockedDate(artistId: string, userId: string, data: {
  date: Date;
  reason?: string;
}) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw new AppError(404, 'Artist not found');
  if (artist.userId !== userId) throw new AppError(403, 'Not authorized');

  return prisma.blockedDate.create({ data: { artistId, ...data } });
}

export async function removeBlockedDate(blockedDateId: string, userId: string) {
  const blockedDate = await prisma.blockedDate.findUnique({
    where: { id: blockedDateId },
    include: { artist: true },
  });
  if (!blockedDate) throw new AppError(404, 'Blocked date not found');
  if (blockedDate.artist.userId !== userId) throw new AppError(403, 'Not authorized');

  await prisma.blockedDate.delete({ where: { id: blockedDateId } });
}
