import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as studioService from '../services/studioService';

const createStudioSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().default('US'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  websiteUrl: z.string().url().optional(),
});

const updateStudioSchema = createStudioSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const inventoryItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  quantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  unit: z.string().default('unit'),
  costPerUnit: z.number().positive().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

const analyticsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function getStudios(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      city: req.query.city as string | undefined,
    };
    const result = await studioService.getStudios(query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getStudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const studio = await studioService.getStudioById(req.params.id);
    res.json({ success: true, data: studio });
  } catch (err) {
    next(err);
  }
}

export async function createStudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createStudioSchema.parse(req.body);
    const studio = await studioService.createStudio(req.user!.userId, data);
    res.status(201).json({ success: true, data: studio });
  } catch (err) {
    next(err);
  }
}

export async function updateStudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateStudioSchema.parse(req.body);
    const studio = await studioService.updateStudio(req.params.id, req.user!.userId, data);
    res.json({ success: true, data: studio });
  } catch (err) {
    next(err);
  }
}

export async function getInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await studioService.getInventory(req.params.id, req.user!.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function createInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = inventoryItemSchema.parse(req.body);
    const item = await studioService.createInventoryItem(req.params.id, req.user!.userId, data);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function updateInventoryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = inventoryItemSchema.partial().parse(req.body);
    const item = await studioService.updateInventoryItem(req.params.itemId, req.params.id, req.user!.userId, data);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const result = await studioService.getStudioAnalytics(req.params.id, req.user!.userId, {
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
