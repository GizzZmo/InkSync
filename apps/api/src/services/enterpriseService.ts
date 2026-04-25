import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination';
import { Prisma } from '@prisma/client';

type EnterpriseWithMembers = Prisma.EnterpriseAccountGetPayload<{
  include: { members: true };
}>;

type EnterpriseWithMembersAndStudios = Prisma.EnterpriseAccountGetPayload<{
  include: { brand: true; members: { include: { studio: true } } };
}>;

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ── Enterprise Account ──────────────────────────────────────────────────────

export async function createEnterprise(ownerId: string, data: {
  name: string;
  tier?: string;
}) {
  const base = toSlug(data.name);
  let slug = base;
  let suffix = 0;
  while (await prisma.enterpriseAccount.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return prisma.enterpriseAccount.create({
    data: { ownerId, name: data.name, slug, tier: data.tier ?? 'enterprise' },
    include: { brand: true, members: { include: { studio: true } } },
  });
}

export async function getEnterprise(enterpriseId: string) {
  const enterprise = await prisma.enterpriseAccount.findUnique({
    where: { id: enterpriseId },
    include: { brand: true, members: { include: { studio: true } } },
  });
  if (!enterprise) throw new AppError(404, 'Enterprise not found');
  return enterprise;
}

export async function getMyEnterprises(ownerId: string) {
  return prisma.enterpriseAccount.findMany({
    where: { ownerId },
    include: { brand: true, members: { include: { studio: true } } },
  });
}

export async function updateEnterprise(enterpriseId: string, ownerId: string, data: {
  name?: string;
  tier?: string;
  isActive?: boolean;
}) {
  const enterprise = await prisma.enterpriseAccount.findUnique({ where: { id: enterpriseId } });
  if (!enterprise) throw new AppError(404, 'Enterprise not found');
  if (enterprise.ownerId !== ownerId) throw new AppError(403, 'Not authorized');

  return prisma.enterpriseAccount.update({
    where: { id: enterpriseId },
    data,
    include: { brand: true, members: { include: { studio: true } } },
  });
}

// ── Brand Management ────────────────────────────────────────────────────────

export async function upsertBrand(enterpriseId: string, ownerId: string, data: {
  logoUrl?: string;
  logoS3Key?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  serviceMenu?: Prisma.InputJsonValue;
  depositPolicy?: string;
  cancellationPolicy?: string;
  widgetEnabled?: boolean;
  widgetOrigins?: string[];
}) {
  const enterprise = await prisma.enterpriseAccount.findUnique({ where: { id: enterpriseId } });
  if (!enterprise) throw new AppError(404, 'Enterprise not found');
  if (enterprise.ownerId !== ownerId) throw new AppError(403, 'Not authorized');

  return prisma.enterpriseBrand.upsert({
    where: { enterpriseId },
    update: data,
    create: { enterpriseId, ...data },
  });
}

// ── Studio Membership ───────────────────────────────────────────────────────

export async function addStudioToEnterprise(enterpriseId: string, ownerId: string, studioId: string, role = 'member') {
  const enterprise = await prisma.enterpriseAccount.findUnique({ where: { id: enterpriseId } });
  if (!enterprise) throw new AppError(404, 'Enterprise not found');
  if (enterprise.ownerId !== ownerId) throw new AppError(403, 'Not authorized');

  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio) throw new AppError(404, 'Studio not found');

  return prisma.enterpriseMembership.create({
    data: { enterpriseId, studioId, role },
    include: { studio: true },
  });
}

export async function removeStudioFromEnterprise(enterpriseId: string, ownerId: string, studioId: string) {
  const enterprise = await prisma.enterpriseAccount.findUnique({ where: { id: enterpriseId } });
  if (!enterprise) throw new AppError(404, 'Enterprise not found');
  if (enterprise.ownerId !== ownerId) throw new AppError(403, 'Not authorized');

  await prisma.enterpriseMembership.deleteMany({ where: { enterpriseId, studioId } });
}

// ── Cross-location Analytics ────────────────────────────────────────────────

export async function getEnterpriseAnalytics(enterpriseId: string, ownerId: string, opts: {
  startDate?: Date;
  endDate?: Date;
}) {
  const enterprise: EnterpriseWithMembers | null = await prisma.enterpriseAccount.findUnique({
    where: { id: enterpriseId },
    include: { members: true },
  });
  if (!enterprise) throw new AppError(404, 'Enterprise not found');
  if (enterprise.ownerId !== ownerId) throw new AppError(403, 'Not authorized');

  const studioIds = enterprise.members.map((m: EnterpriseWithMembers['members'][number]) => m.studioId);

  const where = {
    studioId: { in: studioIds },
    ...(opts.startDate || opts.endDate ? {
      startTime: {
        ...(opts.startDate ? { gte: opts.startDate } : {}),
        ...(opts.endDate ? { lte: opts.endDate } : {}),
      },
    } : {}),
  };

  const [appointments, payments] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { studio: { select: { id: true, name: true } } },
    }),
    prisma.payment.findMany({
      where: {
        appointment: where,
        status: 'PAID',
      },
    }),
  ]);

  const byStudio: Record<string, { studioId: string; studioName: string; appointments: number; revenue: number }> = {};
  for (const appt of appointments) {
    const key = appt.studioId ?? 'unassigned';
    if (!byStudio[key]) {
      byStudio[key] = { studioId: key, studioName: appt.studio?.name ?? 'Unassigned', appointments: 0, revenue: 0 };
    }
    byStudio[key].appointments += 1;
  }
  for (const pmt of payments) {
    const appt = appointments.find((a: (typeof appointments)[number]) => a.id === pmt.appointmentId);
    if (appt) {
      const key = appt.studioId ?? 'unassigned';
      if (byStudio[key]) byStudio[key].revenue += Number(pmt.amount);
    }
  }

  return {
    totalLocations: studioIds.length,
    totalAppointments: appointments.length,
    totalRevenue: payments.reduce((s: number, p: (typeof payments)[number]) => s + Number(p.amount), 0),
    byLocation: Object.values(byStudio),
  };
}

// ── Widget Config ───────────────────────────────────────────────────────────

export async function getWidgetConfig(slug: string) {
  const enterprise: EnterpriseWithMembersAndStudios | null = await prisma.enterpriseAccount.findUnique({
    where: { slug },
    include: { brand: true, members: { include: { studio: true } } },
  });
  if (!enterprise || !enterprise.isActive) throw new AppError(404, 'Enterprise not found');

  return {
    name: enterprise.name,
    brand: enterprise.brand,
    studios: enterprise.members.map((m: EnterpriseWithMembersAndStudios['members'][number]) => ({
      id: m.studio.id,
      name: m.studio.name,
      city: m.studio.city,
      address: m.studio.address,
    })),
  };
}
