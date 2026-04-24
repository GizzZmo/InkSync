import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { TattooStyle } from '@inksync/shared';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination';
import { getPresignedUploadUrl, deleteFromS3 } from '../utils/s3Upload';

export async function getFlashDesigns(query: {
  page?: number;
  limit?: number;
  style?: TattooStyle;
  artistId?: string;
  status?: 'AVAILABLE' | 'SOLD' | 'RESERVED';
}) {
  const { page, limit, skip } = getPaginationOptions(query);
  const where = {
    ...(query.style ? { style: query.style } : {}),
    ...(query.artistId ? { artistId: query.artistId } : {}),
    ...(query.status ? { status: query.status } : { status: 'AVAILABLE' as const }),
  };

  const [designs, total] = await Promise.all([
    prisma.flashDesign.findMany({
      where,
      include: {
        artist: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.flashDesign.count({ where }),
  ]);

  return { designs, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function getFlashDesignById(id: string) {
  const design = await prisma.flashDesign.findUnique({
    where: { id },
    include: {
      artist: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
    },
  });
  if (!design) throw new AppError(404, 'Flash design not found');
  return design;
}

export async function createFlashDesign(userId: string, data: {
  title: string;
  description?: string;
  imageUrl: string;
  imageS3Key: string;
  price: number;
  style: TattooStyle;
  licensingTerms?: string;
}) {
  const artist = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!artist) throw new AppError(404, 'Artist profile not found');

  return prisma.flashDesign.create({
    data: { artistId: artist.id, ...data },
    include: {
      artist: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
    },
  });
}

export async function updateFlashDesign(id: string, userId: string, data: {
  title?: string;
  description?: string;
  price?: number;
  status?: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  licensingTerms?: string;
}) {
  const design = await prisma.flashDesign.findUnique({
    where: { id },
    include: { artist: true },
  });
  if (!design) throw new AppError(404, 'Flash design not found');
  if (design.artist.userId !== userId) throw new AppError(403, 'Not authorized');

  return prisma.flashDesign.update({ where: { id }, data });
}

export async function deleteFlashDesign(id: string, userId: string) {
  const design = await prisma.flashDesign.findUnique({
    where: { id },
    include: { artist: true },
  });
  if (!design) throw new AppError(404, 'Flash design not found');
  if (design.artist.userId !== userId) throw new AppError(403, 'Not authorized');

  await deleteFromS3(design.imageS3Key);
  await prisma.flashDesign.delete({ where: { id } });
}

export async function getPresignedFlashImageUrl(userId: string, mimeType: string) {
  const artist = await prisma.artistProfile.findUnique({ where: { userId } });
  if (!artist) throw new AppError(404, 'Artist profile not found');
  return getPresignedUploadUrl(`flash/${artist.id}`, mimeType);
}

export async function purchaseFlashDesign(designId: string, clientId: string) {
  const design = await prisma.flashDesign.findUnique({ where: { id: designId } });
  if (!design) throw new AppError(404, 'Flash design not found');
  if (design.status !== 'AVAILABLE') throw new AppError(400, 'Flash design is not available for purchase');

  const purchase = await prisma.$transaction(async (tx) => {
    await tx.flashDesign.update({ where: { id: designId }, data: { status: 'SOLD' } });
    return tx.flashPurchase.create({
      data: { designId, clientId, amount: design.price },
      include: { design: true },
    });
  });

  return purchase;
}

export async function getMyPurchases(clientId: string, query: { page?: number; limit?: number }) {
  const { page, limit, skip } = getPaginationOptions(query);
  const [purchases, total] = await Promise.all([
    prisma.flashPurchase.findMany({
      where: { clientId },
      include: {
        design: {
          include: { artist: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
        },
      },
      skip,
      take: limit,
      orderBy: { purchasedAt: 'desc' },
    }),
    prisma.flashPurchase.count({ where: { clientId } }),
  ]);

  return { purchases, meta: buildPaginationMeta(total, { page, limit, skip }) };
}
