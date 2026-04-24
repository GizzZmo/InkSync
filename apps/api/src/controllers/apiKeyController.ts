import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as apiKeyService from '../services/apiKeyService';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  expiresAt: z.string().datetime().optional(),
});

export async function createApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, expiresAt } = createSchema.parse(req.body);
    const key = await apiKeyService.createApiKey(req.user!.userId, name, expiresAt ? new Date(expiresAt) : undefined);
    res.status(201).json({ success: true, data: key });
  } catch (err) { next(err); }
}

export async function listApiKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const keys = await apiKeyService.listApiKeys(req.user!.userId);
    res.json({ success: true, data: keys });
  } catch (err) { next(err); }
}

export async function revokeApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await apiKeyService.revokeApiKey(req.params.id, req.user!.userId);
    res.json({ success: true, message: 'API key revoked' });
  } catch (err) { next(err); }
}
