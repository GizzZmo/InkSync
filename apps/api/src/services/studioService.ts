import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { getPaginationOptions, buildPaginationMeta } from '../utils/pagination';
import { AppointmentStatus, PaymentStatus } from '@inksync/shared';

export async function getStudios(query: { page?: number; limit?: number; city?: string }) {
  const { page, limit, skip } = getPaginationOptions(query);
  const where = {
    isActive: true,
    ...(query.city ? { city: { contains: query.city, mode: 'insensitive' as const } } : {}),
  };

  const [studios, total] = await Promise.all([
    prisma.studio.findMany({
      where,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        artists: { select: { id: true, user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        _count: { select: { appointments: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studio.count({ where }),
  ]);

  return { studios, meta: buildPaginationMeta(total, { page, limit, skip }) };
}

export async function getStudioById(studioId: string) {
  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      artists: {
        include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
      },
      inventory: { orderBy: { category: 'asc' } },
    },
  });
  if (!studio) throw new AppError(404, 'Studio not found');
  return studio;
}

export async function createStudio(ownerId: string, data: {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
}) {
  return prisma.studio.create({
    data: { ownerId, ...data },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function updateStudio(studioId: string, userId: string, data: {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  isActive?: boolean;
}) {
  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio) throw new AppError(404, 'Studio not found');
  if (studio.ownerId !== userId) throw new AppError(403, 'Not authorized');

  return prisma.studio.update({ where: { id: studioId }, data });
}

export async function getInventory(studioId: string, userId: string) {
  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio) throw new AppError(404, 'Studio not found');
  if (studio.ownerId !== userId) throw new AppError(403, 'Not authorized');

  const items = await prisma.inventoryItem.findMany({
    where: { studioId },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  const lowStockItems = items.filter((item: (typeof items)[0]) => item.quantity <= item.lowStockThreshold);

  return { items, lowStockItems, lowStockCount: lowStockItems.length };
}

export async function createInventoryItem(studioId: string, userId: string, data: {
  name: string;
  category: string;
  quantity: number;
  lowStockThreshold?: number;
  unit?: string;
  costPerUnit?: number;
  supplier?: string;
  notes?: string;
}) {
  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio) throw new AppError(404, 'Studio not found');
  if (studio.ownerId !== userId) throw new AppError(403, 'Not authorized');

  return prisma.inventoryItem.create({ data: { studioId, ...data } });
}

export async function updateInventoryItem(itemId: string, studioId: string, userId: string, data: {
  name?: string;
  category?: string;
  quantity?: number;
  lowStockThreshold?: number;
  unit?: string;
  costPerUnit?: number;
  supplier?: string;
  notes?: string;
}) {
  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio) throw new AppError(404, 'Studio not found');
  if (studio.ownerId !== userId) throw new AppError(403, 'Not authorized');

  const item = await prisma.inventoryItem.findFirst({ where: { id: itemId, studioId } });
  if (!item) throw new AppError(404, 'Inventory item not found');

  return prisma.inventoryItem.update({ where: { id: itemId }, data });
}

export async function getStudioAnalytics(studioId: string, userId: string, query: {
  period?: 'day' | 'week' | 'month';
  startDate?: Date;
  endDate?: Date;
}) {
  const studio = await prisma.studio.findUnique({ where: { id: studioId } });
  if (!studio) throw new AppError(404, 'Studio not found');
  if (studio.ownerId !== userId) throw new AppError(403, 'Not authorized');

  const endDate = query.endDate ?? new Date();
  const startDate = query.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [appointments, payments] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        studioId,
        startTime: { gte: startDate, lte: endDate },
      },
      include: {
        artist: { include: { user: { select: { firstName: true, lastName: true } } } },
        payments: { where: { status: PaymentStatus.PAID } },
      },
    }),
    prisma.payment.findMany({
      where: {
        status: PaymentStatus.PAID,
        appointment: { studioId, startTime: { gte: startDate, lte: endDate } },
      },
    }),
  ]);

  const totalRevenue = payments.reduce((sum: number, p: { amount: unknown }) => sum + Number(p.amount), 0);
  const completedAppointments = appointments.filter((a: (typeof appointments)[0]) => a.status === AppointmentStatus.COMPLETED);
  const cancelledAppointments = appointments.filter((a: (typeof appointments)[0]) => a.status === AppointmentStatus.CANCELLED);

  const artistRevMap = new Map<string, { name: string; bookings: number; revenue: number }>();
  for (const appt of appointments) {
    const artistId = appt.artistId;
    const name = `${appt.artist.user.firstName} ${appt.artist.user.lastName}`;
    const rev = appt.payments.reduce((s: number, p: { amount: unknown }) => s + Number(p.amount), 0);
    const existing = artistRevMap.get(artistId) ?? { name, bookings: 0, revenue: 0 };
    artistRevMap.set(artistId, {
      name,
      bookings: existing.bookings + 1,
      revenue: existing.revenue + rev,
    });
  }

  const appointmentsByDay = new Map<string, number>();
  const revenueByDay = new Map<string, number>();
  for (const appt of appointments) {
    const day = appt.startTime.toISOString().split('T')[0];
    appointmentsByDay.set(day, (appointmentsByDay.get(day) ?? 0) + 1);
  }
  for (const payment of payments) {
    const day = payment.createdAt.toISOString().split('T')[0];
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + Number(payment.amount));
  }

  return {
    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
    totalAppointments: appointments.length,
    completedAppointments: completedAppointments.length,
    cancelledAppointments: cancelledAppointments.length,
    totalRevenue,
    averageBookingValue: appointments.length > 0 ? totalRevenue / appointments.length : 0,
    topArtists: Array.from(artistRevMap.entries())
      .map(([artistId, data]) => ({ artistId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
    appointmentsByDay: Array.from(appointmentsByDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    revenueByDay: Array.from(revenueByDay.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}
