import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as communityService from '../services/communityService';

// ── Blog schemas ──────────────────────────────────────────────────────────

const createBlogSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  coverS3Key: z.string().optional(),
  tags: z.array(z.string()).optional(),
  publish: z.boolean().optional(),
});

const updateBlogSchema = createBlogSchema.partial().extend({
  archive: z.boolean().optional(),
});

// ── Event schemas ─────────────────────────────────────────────────────────

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  eventType: z.enum(['CONVENTION', 'EXPO', 'WORKSHOP', 'GUEST_SPOT', 'OTHER']).optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  websiteUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  imageS3Key: z.string().optional(),
  publish: z.boolean().optional(),
});

const updateEventSchema = createEventSchema.partial();

// ── Apprenticeship schemas ────────────────────────────────────────────────

const createApprenticeshipSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  requirements: z.string().optional(),
  duration: z.string().optional(),
  isPaid: z.boolean().optional(),
  compensation: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().optional(),
});

const updateApprenticeshipSchema = createApprenticeshipSchema.partial().extend({
  isOpen: z.boolean().optional(),
});

// ── Course schemas ────────────────────────────────────────────────────────

const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  coverS3Key: z.string().optional(),
  price: z.number().min(0).optional(),
  isFree: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  publish: z.boolean().optional(),
});

const addLessonSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  videoUrl: z.string().url().optional(),
  sortOrder: z.number().int().min(0).optional(),
  durationMin: z.number().int().min(1).optional(),
});

// ── Blog controllers ──────────────────────────────────────────────────────

export async function listBlogPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await communityService.listBlogPosts({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      artistId: req.query.artistId as string | undefined,
      tag: req.query.tag as string | undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await communityService.getBlogPost(req.params.id);
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function createBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createBlogSchema.parse(req.body);
    const post = await communityService.createBlogPost(req.user!.userId, data);
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function updateBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateBlogSchema.parse(req.body);
    const post = await communityService.updateBlogPost(req.params.id, req.user!.userId, data);
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
}

// ── Event controllers ─────────────────────────────────────────────────────

export async function listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await communityService.listEvents({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      eventType: req.query.eventType as string | undefined,
      country: req.query.country as string | undefined,
      upcoming: req.query.upcoming === 'true',
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await communityService.getEvent(req.params.id);
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
}

export async function createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createEventSchema.parse(req.body);
    const event = await communityService.createEvent(req.user!.userId, {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
    res.status(201).json({ success: true, data: event });
  } catch (err) { next(err); }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateEventSchema.parse(req.body);
    const event = await communityService.updateEvent(req.params.id, req.user!.userId, {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
    res.json({ success: true, data: event });
  } catch (err) { next(err); }
}

// ── Apprenticeship controllers ─────────────────────────────────────────────

export async function listApprenticeships(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await communityService.listApprenticeships({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      country: req.query.country as string | undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getApprenticeship(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const listing = await communityService.getApprenticeship(req.params.id);
    res.json({ success: true, data: listing });
  } catch (err) { next(err); }
}

export async function createApprenticeship(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createApprenticeshipSchema.parse(req.body);
    const listing = await communityService.createApprenticeship(req.user!.userId, data);
    res.status(201).json({ success: true, data: listing });
  } catch (err) { next(err); }
}

export async function updateApprenticeship(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = updateApprenticeshipSchema.parse(req.body);
    const listing = await communityService.updateApprenticeship(req.params.id, req.user!.userId, data);
    res.json({ success: true, data: listing });
  } catch (err) { next(err); }
}

// ── Course controllers ────────────────────────────────────────────────────

export async function listCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await communityService.listCourses({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      tag: req.query.tag as string | undefined,
      isFree: req.query.isFree !== undefined ? req.query.isFree === 'true' : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const course = await communityService.getCourse(req.params.id);
    res.json({ success: true, data: course });
  } catch (err) { next(err); }
}

export async function createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createCourseSchema.parse(req.body);
    const course = await communityService.createCourse(req.user!.userId, data);
    res.status(201).json({ success: true, data: course });
  } catch (err) { next(err); }
}

export async function addLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = addLessonSchema.parse(req.body);
    const lesson = await communityService.addLesson(req.user!.userId, req.params.courseId, data);
    res.status(201).json({ success: true, data: lesson });
  } catch (err) { next(err); }
}

export async function enrollInCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollment = await communityService.enrollInCourse(req.user!.userId, req.params.courseId);
    res.status(201).json({ success: true, data: enrollment });
  } catch (err) { next(err); }
}

export async function completeLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enrollment = await communityService.completeLesson(req.user!.userId, req.params.courseId);
    res.json({ success: true, data: enrollment });
  } catch (err) { next(err); }
}

export async function getUserEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await communityService.getUserEnrollments(req.user!.userId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}
