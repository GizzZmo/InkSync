import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as enterpriseService from '../services/enterpriseService';

const createEnterpriseSchema = z.object({
  name: z.string().min(1).max(120),
  tier: z.enum(['enterprise', 'franchise']).optional(),
});

const updateEnterpriseSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  tier: z.enum(['enterprise', 'franchise']).optional(),
  isActive: z.boolean().optional(),
});

const brandSchema = z.object({
  logoUrl: z.string().url().optional(),
  logoS3Key: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  fontFamily: z.string().optional(),
  serviceMenu: z.array(z.object({ name: z.string(), price: z.number(), durationMinutes: z.number().int() })).optional(),
  depositPolicy: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  widgetEnabled: z.boolean().optional(),
  widgetOrigins: z.array(z.string().url()).optional(),
});

const addStudioSchema = z.object({
  studioId: z.string().uuid(),
  role: z.enum(['owner', 'admin', 'member']).optional(),
});

const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function createEnterprise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createEnterpriseSchema.parse(req.body);
    const enterprise = await enterpriseService.createEnterprise(req.user!.userId, data);
    res.status(201).json({ success: true, data: enterprise });
  } catch (err) { next(err); }
}

export async function getEnterprise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enterprise = await enterpriseService.getEnterprise(req.params.id);
    res.json({ success: true, data: enterprise });
  } catch (err) { next(err); }
}

export async function getMyEnterprises(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enterprises = await enterpriseService.getMyEnterprises(req.user!.userId);
    res.json({ success: true, data: enterprises });
  } catch (err) { next(err); }
}

export async function updateEnterprise(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateEnterpriseSchema.parse(req.body);
    const enterprise = await enterpriseService.updateEnterprise(req.params.id, req.user!.userId, data);
    res.json({ success: true, data: enterprise });
  } catch (err) { next(err); }
}

export async function upsertBrand(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = brandSchema.parse(req.body);
    const brand = await enterpriseService.upsertBrand(req.params.id, req.user!.userId, data);
    res.json({ success: true, data: brand });
  } catch (err) { next(err); }
}

export async function addStudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { studioId, role } = addStudioSchema.parse(req.body);
    const membership = await enterpriseService.addStudioToEnterprise(req.params.id, req.user!.userId, studioId, role);
    res.status(201).json({ success: true, data: membership });
  } catch (err) { next(err); }
}

export async function removeStudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await enterpriseService.removeStudioFromEnterprise(req.params.id, req.user!.userId, req.params.studioId);
    res.json({ success: true, message: 'Studio removed from enterprise' });
  } catch (err) { next(err); }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const result = await enterpriseService.getEnterpriseAnalytics(req.params.id, req.user!.userId, {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getWidgetConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = await enterpriseService.getWidgetConfig(req.params.slug);
    res.json({ success: true, data: config });
  } catch (err) { next(err); }
}
