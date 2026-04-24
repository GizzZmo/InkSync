import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { stripe } from '../config/stripe';
import { PaymentStatus } from '@inksync/shared';

export async function createDepositPaymentIntent(data: {
  appointmentId: string;
  clientId: string;
  amount: number;
  currency?: string;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: data.appointmentId },
    include: { artist: true },
  });
  if (!appointment) throw new AppError(404, 'Appointment not found');
  if (appointment.clientId !== data.clientId) throw new AppError(403, 'Not authorized');
  if (appointment.depositPaid) throw new AppError(400, 'Deposit already paid');

  const currency = data.currency ?? 'usd';
  const amountInCents = Math.round(data.amount * 100);

  const transferData = appointment.artist.stripeConnectId
    ? {
        transfer_data: {
          destination: appointment.artist.stripeConnectId,
        },
      }
    : {};

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency,
    metadata: {
      appointmentId: data.appointmentId,
      clientId: data.clientId,
      type: 'deposit',
    },
    ...transferData,
  });

  const payment = await prisma.payment.create({
    data: {
      appointmentId: data.appointmentId,
      amount: data.amount,
      currency,
      status: PaymentStatus.PENDING,
      stripePaymentIntentId: paymentIntent.id,
      metadata: { type: 'deposit' },
    },
  });

  return { payment, clientSecret: paymentIntent.client_secret };
}

export async function getArtistPayments(artistUserId: string, query: {
  page?: number;
  limit?: number;
}) {
  const artist = await prisma.artistProfile.findUnique({ where: { userId: artistUserId } });
  if (!artist) throw new AppError(404, 'Artist profile not found');

  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, query.limit ?? 20);
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { appointment: { artistId: artist.id } },
      include: {
        appointment: {
          include: { client: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where: { appointment: { artistId: artist.id } } }),
  ]);

  const totalRevenue = await prisma.payment.aggregate({
    where: { appointment: { artistId: artist.id }, status: PaymentStatus.PAID },
    _sum: { amount: true },
  });

  return {
    payments,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    summary: { totalRevenue: totalRevenue._sum.amount ?? 0 },
  };
}

export async function createRefund(data: {
  paymentId: string;
  amount?: number;
  reason?: string;
  requestedByUserId: string;
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: data.paymentId },
    include: {
      appointment: {
        include: { artist: true, client: true },
      },
    },
  });
  if (!payment) throw new AppError(404, 'Payment not found');

  const isClient = payment.appointment.clientId === data.requestedByUserId;
  const isArtist = payment.appointment.artist.userId === data.requestedByUserId;
  if (!isClient && !isArtist) throw new AppError(403, 'Not authorized');

  if (payment.status !== PaymentStatus.PAID) {
    throw new AppError(400, 'Payment is not eligible for refund');
  }
  if (!payment.stripePaymentIntentId) {
    throw new AppError(400, 'No Stripe payment intent found');
  }

  const amountInCents = data.amount ? Math.round(data.amount * 100) : undefined;

  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
    ...(amountInCents ? { amount: amountInCents } : {}),
    reason: 'requested_by_customer',
    metadata: { reason: data.reason ?? '' },
  });

  return prisma.payment.update({
    where: { id: data.paymentId },
    data: {
      status: PaymentStatus.REFUNDED,
      refundId: refund.id,
      refundAmount: data.amount ?? Number(payment.amount),
      refundReason: data.reason,
    },
  });
}

export async function handleStripeWebhook(event: import('stripe').Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as import('stripe').Stripe.PaymentIntent;
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: pi.id },
      });
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.PAID,
            stripeChargeId: pi.latest_charge as string | null,
          },
        });
        await prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: { depositPaid: true, paymentStatus: PaymentStatus.PAID },
        });
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as import('stripe').Stripe.PaymentIntent;
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: pi.id },
        data: { status: PaymentStatus.FAILED },
      });
      break;
    }
    case 'account.updated': {
      const account = event.data.object as import('stripe').Stripe.Account;
      if (account.charges_enabled) {
        await prisma.artistProfile.updateMany({
          where: { stripeConnectId: account.id },
          data: { stripeConnectStatus: 'active' },
        });
      }
      break;
    }
    default:
      break;
  }
}

export async function createStripeConnectAccount(artistUserId: string): Promise<{ accountId: string }> {
  const artist = await prisma.artistProfile.findUnique({
    where: { userId: artistUserId },
    include: { user: true },
  });
  if (!artist) throw new AppError(404, 'Artist profile not found');

  if (artist.stripeConnectId) {
    return { accountId: artist.stripeConnectId };
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: artist.user.email,
    capabilities: { transfers: { requested: true } },
    metadata: { artistId: artist.id, userId: artistUserId },
  });

  await prisma.artistProfile.update({
    where: { id: artist.id },
    data: { stripeConnectId: account.id, stripeConnectStatus: 'pending' },
  });

  return { accountId: account.id };
}

export async function getStripeConnectOnboardingLink(artistUserId: string, artistId: string): Promise<{ url: string }> {
  const artist = await prisma.artistProfile.findUnique({ where: { id: artistId } });
  if (!artist) throw new AppError(404, 'Artist not found');
  if (artist.userId !== artistUserId) throw new AppError(403, 'Not authorized');
  if (!artist.stripeConnectId) throw new AppError(400, 'Stripe Connect account not created yet');

  const accountLink = await stripe.accountLinks.create({
    account: artist.stripeConnectId,
    refresh_url: `${process.env.FRONTEND_URL}/stripe/refresh`,
    return_url: `${process.env.FRONTEND_URL}/stripe/return`,
    type: 'account_onboarding',
  });

  return { url: accountLink.url };
}
