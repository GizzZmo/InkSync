import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AppointmentStatus } from '@inksync/shared';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination';
import { getPresignedUploadUrl } from '../utils/s3Upload';

export async function getArtistReviews(artistId: string, query: { page?: number; limit?: number }) {
  const { page, limit, skip } = getPaginationOptions(query);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { artistId },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        photos: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where: { artistId } }),
  ]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return { reviews, meta: buildPaginationMeta(total, { page, limit, skip }), averageRating: Math.round(averageRating * 10) / 10 };
}

export async function createReview(clientId: string, data: {
  appointmentId: string;
  rating: number;
  content?: string;
  photoUrls?: Array<{ url: string; s3Key: string }>;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: data.appointmentId },
    include: { review: true },
  });
  if (!appointment) throw new AppError(404, 'Appointment not found');
  if (appointment.clientId !== clientId) throw new AppError(403, 'Not authorized');
  if (appointment.status !== AppointmentStatus.COMPLETED) throw new AppError(400, 'Can only review completed appointments');
  if (appointment.review) throw new AppError(409, 'Review already exists for this appointment');

  return prisma.review.create({
    data: {
      appointmentId: data.appointmentId,
      artistId: appointment.artistId,
      clientId,
      rating: data.rating,
      content: data.content,
      photos: data.photoUrls ? {
        create: data.photoUrls.map((p) => ({ url: p.url, s3Key: p.s3Key })),
      } : undefined,
    },
    include: {
      client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      photos: true,
    },
  });
}

export async function respondToReview(reviewId: string, artistUserId: string, response: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { artist: true },
  });
  if (!review) throw new AppError(404, 'Review not found');
  if (review.artist.userId !== artistUserId) throw new AppError(403, 'Not authorized');

  return prisma.review.update({
    where: { id: reviewId },
    data: { artistResponse: response, artistRespondedAt: new Date() },
  });
}

export async function reportReview(reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(404, 'Review not found');
  return prisma.review.update({ where: { id: reviewId }, data: { isModerated: true } });
}

export async function getPresignedReviewPhotoUrl(mimeType: string) {
  return getPresignedUploadUrl('review-photos', mimeType);
}
