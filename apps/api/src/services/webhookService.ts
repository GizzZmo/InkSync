import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { WEBHOOK_EVENTS } from '@inksync/shared';
import crypto from 'crypto';
import axios from 'axios';

export async function getWebhooks(userId: string) {
  return prisma.webhook.findMany({
    where: { userId },
    select: { id: true, url: true, events: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createWebhook(userId: string, data: { url: string; events: string[] }) {
  const invalidEvents = data.events.filter((e) => !(WEBHOOK_EVENTS as readonly string[]).includes(e));
  if (invalidEvents.length > 0) {
    throw new AppError(400, `Invalid events: ${invalidEvents.join(', ')}`);
  }

  const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
  return prisma.webhook.create({
    data: { userId, url: data.url, secret, events: data.events },
    select: { id: true, url: true, events: true, isActive: true, secret: true, createdAt: true },
  });
}

export async function updateWebhook(id: string, userId: string, data: { url?: string; events?: string[]; isActive?: boolean }) {
  const webhook = await prisma.webhook.findUnique({ where: { id } });
  if (!webhook) throw new AppError(404, 'Webhook not found');
  if (webhook.userId !== userId) throw new AppError(403, 'Not authorized');

  if (data.events) {
    const invalid = data.events.filter((e) => !(WEBHOOK_EVENTS as readonly string[]).includes(e));
    if (invalid.length > 0) throw new AppError(400, `Invalid events: ${invalid.join(', ')}`);
  }

  return prisma.webhook.update({ where: { id }, data });
}

export async function deleteWebhook(id: string, userId: string) {
  const webhook = await prisma.webhook.findUnique({ where: { id } });
  if (!webhook) throw new AppError(404, 'Webhook not found');
  if (webhook.userId !== userId) throw new AppError(403, 'Not authorized');
  await prisma.webhook.delete({ where: { id } });
}

export async function dispatchWebhook(userId: string, event: string, payload: Record<string, unknown>): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: { userId, isActive: true, events: { has: event } },
  });

  for (const webhook of webhooks) {
    const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
    const sig = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');

    let responseStatus: number | undefined;
    let responseBody: string | undefined;
    let success = false;

    try {
      const res = await axios.post(webhook.url, JSON.parse(body), {
        headers: { 'Content-Type': 'application/json', 'X-InkSync-Signature': sig },
        timeout: 5000,
      });
      responseStatus = res.status;
      responseBody = JSON.stringify(res.data).slice(0, 500);
      success = res.status >= 200 && res.status < 300;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: unknown } };
      responseStatus = axiosErr?.response?.status;
      responseBody = String(axiosErr);
    }

    await prisma.webhookDelivery.create({
      data: { webhookId: webhook.id, event, payload, responseStatus, responseBody, success },
    }).catch(console.error);
  }
}
