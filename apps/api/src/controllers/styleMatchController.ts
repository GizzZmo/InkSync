import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as styleMatchService from '../services/styleMatchService';

const matchSchema = z.object({
  description: z.string().min(1).max(1000),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(20).optional(),
});

export async function getStyleMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = matchSchema.parse({
      description: req.body.description,
      page: req.body.page,
      limit: req.body.limit,
    });
    const result = await styleMatchService.getStyleMatchRecommendations(data.description, {
      page: data.page,
      limit: data.limit,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
