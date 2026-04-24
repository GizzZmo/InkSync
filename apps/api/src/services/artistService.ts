import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { TattooStyle } from '@inksync/shared';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination';
import { getPresignedUploadUrl, deleteFromS3 } from '../utils/s3Upload';

export async function getArtists(query: {
  page?: number;
  limit?: number;
  style?: TattooStyle;
  city?: string;
  isAvailable?: boolean;
}) {
  const { page, limit, skip } = getPaginationOptions(query);

  const where = {
    ...(query.style ? { styles: { has: query.style } } : {}),
    ...(query.city ? { city: { contains: query.city, mode: 'insensitive' as const } } : {}),
    ...(query.isAvailable !== undefined ? { isAvailable: query.isAvailable } : {}),
  };

  const [artists, total] = await Promise.all([
    prisma.artistProfile.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
        portfolioImages: { where: { isPublic: true }, take: 4, orderBy: { sortOrder: 'asc' } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.artistProfile.count({ where }),
  ]);

  return { artists, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function getArtistById(artistId: string) {
  const artist = await prisma.artistProfile.findUnique({
    where: { id: artistId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true, phone: true } },
      portfolioImages: { where: { isPublic: true }, orderBy: { sortOrder: 'asc' } },
      availability: { where: { isActive: true } },
    },
  });

  if (!artist) throw new AppError(404, 'Artist not found');
  return artist;
}

export async function getArtistByUserId(userId: string) {
  const artist = await prisma.artistProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true } },
    },
  });
  if (!artist) throw new AppError(404, 'Artist profile not found');
  return artist;
}

export async function updateArtistProfile(
  artistId: string,
  userId: string,
  data: {
    bio?: string;
    styles?: TattooStyle[];
    hourlyRate?: number;
    minimumDeposit?: number;
    depositPercentage?: number;
    city?: string;
    state?: string;
    country?: string;
    instagramHandle?: string;
    tiktokHandle?: string;
    websiteUrl?: string;
    yearsExperience?: number;
    isAvailable?: boolean;
  }
) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw new AppError(404, 'Artist not found');
  if (artist.userId !== userId) throw new AppError(403, 'Not authorized');

  return prisma.artistProfile.update({
    where: { id: artistId },
    data,
    include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
  });
}

export async function getPortfolioPresignedUrl(
  artistId: string,
  userId: string,
  mimeType: string
) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw new AppError(404, 'Artist not found');
  if (artist.userId !== userId) throw new AppError(403, 'Not authorized');

  return getPresignedUploadUrl(`portfolio/${artistId}`, mimeType);
}

export async function addPortfolioImage(
  artistId: string,
  userId: string,
  data: {
    s3Key: string;
    url: string;
    style: TattooStyle;
    title?: string;
    description?: string;
    thumbnailUrl?: string;
  }
) {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw new AppError(404, 'Artist not found');
  if (artist.userId !== userId) throw new AppError(403, 'Not authorized');

  const count = await prisma.portfolioImage.count({ where: { artistId } });

  return prisma.portfolioImage.create({
    data: { artistId, sortOrder: count, ...data },
  });
}

export async function getPortfolio(
  artistId: string,
  query: { page?: number; limit?: number; style?: TattooStyle }
) {
  const { page, limit, skip } = getPaginationOptions(query);
  const where = {
    artistId,
    isPublic: true,
    ...(query.style ? { style: query.style } : {}),
  };

  const [images, total] = await Promise.all([
    prisma.portfolioImage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.portfolioImage.count({ where }),
  ]);

  return { images, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function deletePortfolioImage(imageId: string, userId: string) {
  const image = await prisma.portfolioImage.findUnique({
    where: { id: imageId },
    include: { artist: true },
  });
  if (!image) throw new AppError(404, 'Image not found');
  if (image.artist.userId !== userId) throw new AppError(403, 'Not authorized');

  await deleteFromS3(image.s3Key);
  await prisma.portfolioImage.delete({ where: { id: imageId } });
}
