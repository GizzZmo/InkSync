import { prisma } from '../config/database';
import { TattooStyle } from '@inksync/shared';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function searchArtists(query: {
  q?: string;
  style?: TattooStyle;
  city?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
}) {
  const { page, limit, skip } = getPaginationOptions(query);

  const where: Record<string, unknown> = {
    ...(query.style ? { styles: { has: query.style } } : {}),
    ...(query.city ? { city: { contains: query.city, mode: 'insensitive' } } : {}),
    ...(query.isAvailable !== undefined ? { isAvailable: query.isAvailable } : {}),
    ...(query.minPrice ? { hourlyRate: { gte: query.minPrice } } : {}),
    ...(query.maxPrice ? { hourlyRate: { ...(query.minPrice ? { gte: query.minPrice } : {}), lte: query.maxPrice } } : {}),
    ...(query.q ? {
      OR: [
        { bio: { contains: query.q, mode: 'insensitive' } },
        { city: { contains: query.q, mode: 'insensitive' } },
        { user: { firstName: { contains: query.q, mode: 'insensitive' } } },
        { user: { lastName: { contains: query.q, mode: 'insensitive' } } },
      ],
    } : {}),
  };

  const [artists, total] = await Promise.all([
    prisma.artistProfile.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
        portfolioImages: { where: { isPublic: true }, take: 3, orderBy: { sortOrder: 'asc' } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.artistProfile.count({ where }),
  ]);

  let results = artists;

  if (query.latitude !== undefined && query.longitude !== undefined && query.radiusKm !== undefined) {
    results = artists.filter((artist) => {
      if (artist.latitude === null || artist.longitude === null) return false;
      const dist = haversineKm(query.latitude!, query.longitude!, artist.latitude, artist.longitude);
      return dist <= query.radiusKm!;
    });
  }

  return { artists: results, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function getTrendingArtists(limit = 10) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const trending = await prisma.artistProfile.findMany({
    where: { isAvailable: true },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      portfolioImages: { where: { isPublic: true }, take: 3, orderBy: { sortOrder: 'asc' } },
      _count: {
        select: {
          appointments: { where: { createdAt: { gte: thirtyDaysAgo } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit * 3,
  });

  return trending
    .sort((a, b) => b._count.appointments - a._count.appointments)
    .slice(0, limit);
}
