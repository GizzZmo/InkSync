import { Request, Response, NextFunction } from 'express';
import * as searchService from '../services/searchService';
import { TattooStyle } from '@inksync/shared';

export async function searchArtists(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await searchService.searchArtists({
      q: req.query.q as string | undefined,
      style: req.query.style as TattooStyle | undefined,
      city: req.query.city as string | undefined,
      latitude: req.query.lat ? Number(req.query.lat) : undefined,
      longitude: req.query.lng ? Number(req.query.lng) : undefined,
      radiusKm: req.query.radius ? Number(req.query.radius) : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      isAvailable: req.query.isAvailable === 'true' ? true : req.query.isAvailable === 'false' ? false : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const artists = await searchService.getTrendingArtists(limit);
    res.json({ success: true, data: artists });
  } catch (err) { next(err); }
}
