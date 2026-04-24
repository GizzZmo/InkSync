import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as residencyService from '../services/residencyService';

const createSchema = z.object({
  studioId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  announcement: z.string().optional(),
});

const updateSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  announcement: z.string().optional(),
});

export async function getResidencies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await residencyService.getResidencies({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      artistId: req.query.artistId as string | undefined,
      studioId: req.query.studioId as string | undefined,
      active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getResidency(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const residency = await residencyService.getResidencyById(req.params.id);
    res.json({ success: true, data: residency });
  } catch (err) { next(err); }
}

export async function createResidency(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createSchema.parse(req.body);
    const residency = await residencyService.createResidency(req.user!.userId, {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
    res.status(201).json({ success: true, data: residency });
  } catch (err) { next(err); }
}

export async function updateResidency(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateSchema.parse(req.body);
    const residency = await residencyService.updateResidency(req.params.id, req.user!.userId, {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
    res.json({ success: true, data: residency });
  } catch (err) { next(err); }
}

export async function deleteResidency(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await residencyService.deleteResidency(req.params.id, req.user!.userId);
    res.json({ success: true, message: 'Residency deleted' });
  } catch (err) { next(err); }
}
