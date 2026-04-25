import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination';

// ── Content Reporting ───────────────────────────────────────────────────────

export async function reportContent(reporterId: string, data: {
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
}) {
  return prisma.contentReport.create({
    data: {
      reporterId,
      targetType: data.targetType as any,
      targetId: data.targetId,
      reason: data.reason,
      details: data.details,
    },
  });
}

export async function listContentReports(adminId: string, query: {
  page?: number;
  limit?: number;
  status?: string;
  targetType?: string;
}) {
  // Verify admin
  const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
  if (!admin || admin.role !== 'ADMIN') throw new AppError(403, 'Admin access required');

  const { page, limit, skip } = getPaginationOptions(query);
  const where = {
    ...(query.status ? { status: query.status as any } : {}),
    ...(query.targetType ? { targetType: query.targetType as any } : {}),
  };

  const [reports, total] = await Promise.all([
    prisma.contentReport.findMany({
      where,
      include: { reporter: { select: { id: true, firstName: true, lastName: true, email: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contentReport.count({ where }),
  ]);

  return { reports, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function resolveContentReport(adminId: string, reportId: string, data: {
  status: string;
  resolution?: string;
}) {
  const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
  if (!admin || admin.role !== 'ADMIN') throw new AppError(403, 'Admin access required');

  const report = await prisma.contentReport.findUnique({ where: { id: reportId } });
  if (!report) throw new AppError(404, 'Report not found');

  return prisma.contentReport.update({
    where: { id: reportId },
    data: {
      status: data.status as any,
      resolution: data.resolution,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
  });
}

// ── Artist Verification & Badges ────────────────────────────────────────────

export async function requestBadge(artistUserId: string, badgeType: string) {
  const artist = await prisma.artistProfile.findUnique({ where: { userId: artistUserId } });
  if (!artist) throw new AppError(403, 'Artist profile required');

  const existing = await prisma.artistBadge.findUnique({
    where: { artistId_badgeType: { artistId: artist.id, badgeType: badgeType as any } },
  });
  if (existing && existing.status === 'APPROVED') throw new AppError(409, 'Badge already awarded');
  if (existing && existing.status === 'PENDING') throw new AppError(409, 'Badge request already pending');

  if (existing) {
    return prisma.artistBadge.update({
      where: { artistId_badgeType: { artistId: artist.id, badgeType: badgeType as any } },
      data: { status: 'PENDING', notes: null, reviewedBy: null },
    });
  }

  return prisma.artistBadge.create({
    data: { artistId: artist.id, badgeType: badgeType as any },
  });
}

export async function getArtistBadges(artistId: string) {
  return prisma.artistBadge.findMany({
    where: { artistId, status: 'APPROVED' },
    orderBy: { issuedAt: 'desc' },
  });
}

export async function listBadgeRequests(adminId: string, query: { page?: number; limit?: number; status?: string }) {
  const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
  if (!admin || admin.role !== 'ADMIN') throw new AppError(403, 'Admin access required');

  const { page, limit, skip } = getPaginationOptions(query);
  const where = query.status ? { status: query.status as any } : {};

  const [requests, total] = await Promise.all([
    prisma.artistBadge.findMany({
      where,
      include: { artist: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.artistBadge.count({ where }),
  ]);

  return { requests, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function reviewBadgeRequest(adminId: string, badgeId: string, data: {
  status: 'APPROVED' | 'REJECTED';
  notes?: string;
  expiresAt?: Date;
}) {
  const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { role: true } });
  if (!admin || admin.role !== 'ADMIN') throw new AppError(403, 'Admin access required');

  const badge = await prisma.artistBadge.findUnique({ where: { id: badgeId } });
  if (!badge) throw new AppError(404, 'Badge request not found');

  return prisma.artistBadge.update({
    where: { id: badgeId },
    data: {
      status: data.status,
      notes: data.notes,
      reviewedBy: adminId,
      issuedAt: data.status === 'APPROVED' ? new Date() : null,
      expiresAt: data.expiresAt,
    },
  });
}

// ── GDPR: Data Export ────────────────────────────────────────────────────────

export async function requestDataExport(userId: string) {
  // Limit to one active request at a time
  const existing = await prisma.dataExportRequest.findFirst({
    where: { userId, status: { in: ['REQUESTED', 'PROCESSING'] } },
  });
  if (existing) throw new AppError(409, 'A data export is already in progress');

  return prisma.dataExportRequest.create({ data: { userId } });
}

export async function getUserDataExports(userId: string) {
  return prisma.dataExportRequest.findMany({
    where: { userId },
    orderBy: { requestedAt: 'desc' },
  });
}

export async function getMyData(userId: string) {
  const [user, appointments, payments, reviews, messages, aftercares] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        artistProfile: { include: { portfolioImages: true } },
        notificationPrefs: true,
        userLocale: true,
      },
    }),
    prisma.appointment.findMany({ where: { clientId: userId } }),
    prisma.payment.findMany({ where: { appointment: { clientId: userId } } }),
    prisma.review.findMany({ where: { clientId: userId } }),
    prisma.message.findMany({ where: { senderId: userId } }),
    prisma.aftercare.findMany({ where: { artistId: userId } }),
  ]);

  return { user, appointments, payments, reviews, messages, aftercares };
}

// ── GDPR: Account Deletion ───────────────────────────────────────────────────

export async function requestAccountDeletion(userId: string) {
  // Soft-delete approach: anonymize PII and mark inactive
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: `deleted-${userId}@deleted.inksync.app`,
      firstName: 'Deleted',
      lastName: 'User',
      phone: null,
      avatarUrl: null,
      passwordHash: null,
      emailVerified: false,
      emailVerifyToken: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
    },
  });

  // Revoke all refresh tokens
  await prisma.refreshToken.updateMany({ where: { userId }, data: { isRevoked: true } });

  // Deactivate API keys
  await prisma.apiKey.updateMany({ where: { userId }, data: { isActive: false } });

  // Deactivate webhooks
  await prisma.webhook.updateMany({ where: { userId }, data: { isActive: false } });

  return { message: 'Account has been scheduled for deletion. Your data has been anonymized.' };
}
