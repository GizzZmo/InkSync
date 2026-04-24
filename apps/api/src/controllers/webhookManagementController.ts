import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as webhookService from '../services/webhookService';
import { WEBHOOK_EVENTS } from '@inksync/shared';

const createSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

const updateSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function getWebhooks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const webhooks = await webhookService.getWebhooks(req.user!.userId);
    res.json({ success: true, data: webhooks });
  } catch (err) { next(err); }
}

export async function createWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createSchema.parse(req.body);
    const webhook = await webhookService.createWebhook(req.user!.userId, data);
    res.status(201).json({ success: true, data: webhook });
  } catch (err) { next(err); }
}

export async function updateWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateSchema.parse(req.body);
    const webhook = await webhookService.updateWebhook(req.params.id, req.user!.userId, data);
    res.json({ success: true, data: webhook });
  } catch (err) { next(err); }
}

export async function deleteWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await webhookService.deleteWebhook(req.params.id, req.user!.userId);
    res.json({ success: true, message: 'Webhook deleted' });
  } catch (err) { next(err); }
}

export function listWebhookEvents(_req: Request, res: Response): void {
  res.json({ success: true, data: WEBHOOK_EVENTS });
}
