import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination';

export async function getResidencies(query: { page?: number; limit?: number; artistId?: string; studioId?: string; active?: boolean }) {
  const { page, limit, skip } = getPaginationOptions(query);
  const where = {
    ...(query.artistId ? { artistId: query.artistId } : {}),
    ...(query.studioId ? { studioId: query.studioId } : {}),
    ...(query.active !== undefined ? { isActive: query.active } : {}),
  };

  const [residencies, total] = await Promise.all([
    prisma.artistResidency.findMany({
      where,
      include: {
        artist: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
        studio: { select: { id: true, name: true, city: true, state: true } },
      },
      skip,
      take: limit,
      orderBy: { startDate: 'desc' },
    }),
    prisma.artistResidency.count({ where }),
  ]);

  return { residencies, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function getResidencyById(id: string) {
  const residency = await prisma.artistResidency.findUnique({
    where: { id },
    include: {
      artist: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
      studio: true,
    },
  });
  if (!residency) throw new AppError(404, 'Residency not found');
  return residency;
}

export async function createResidency(userId: string, data: {
  studioId: string;
  startDate: Date;
  endDate?: Date;
  announcement?: string;
}) {
  const artist = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!artist) throw new AppError(404, 'Artist profile not found');

  const studio = await prisma.studio.findUnique({ where: { id: data.studioId } });
  if (!studio) throw new AppError(404, 'Studio not found');

  return prisma.artistResidency.create({
    data: { artistId: artist.id, ...data },
    include: {
      artist: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
      studio: { select: { id: true, name: true, city: true, state: true } },
    },
  });
}

export async function updateResidency(id: string, userId: string, data: {
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  announcement?: string;
}) {
  const residency = await prisma.artistResidency.findUnique({
    where: { id },
    include: { artist: true },
  });
  if (!residency) throw new AppError(404, 'Residency not found');
  if (residency.artist.userId !== userId) throw new AppError(403, 'Not authorized');

  return prisma.artistResidency.update({ where: { id }, data });
}

export async function deleteResidency(id: string, userId: string) {
  const residency = await prisma.artistResidency.findUnique({
    where: { id },
    include: { artist: true },
  });
  if (!residency) throw new AppError(404, 'Residency not found');
  if (residency.artist.userId !== userId) throw new AppError(403, 'Not authorized');
  await prisma.artistResidency.delete({ where: { id } });
}
