import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as i18nService from '../services/i18nService';

const updateLocaleSchema = z.object({
  language: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
});

export async function getSupportedLocales(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const locales = i18nService.getSupportedLocales();
    res.json({ success: true, data: locales });
  } catch (err) { next(err); }
}

export async function getUserLocale(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const locale = await i18nService.getUserLocale(req.user!.userId);
    res.json({ success: true, data: locale });
  } catch (err) { next(err); }
}

export async function updateUserLocale(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateLocaleSchema.parse(req.body);
    const locale = await i18nService.upsertUserLocale(req.user!.userId, data);
    res.json({ success: true, data: locale });
  } catch (err) { next(err); }
}
