import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as paymentService from '../services/paymentService';

const depositSchema = z.object({
  appointmentId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('usd'),
});

const refundSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});

export async function createDeposit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = depositSchema.parse(req.body);
    const result = await paymentService.createDepositPaymentIntent({
      ...data,
      clientId: req.user!.userId,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function createRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = refundSchema.parse(req.body);
    const payment = await paymentService.createRefund({
      ...data,
      requestedByUserId: req.user!.userId,
    });
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}

export async function getArtistPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await paymentService.getArtistPayments(req.user!.userId, query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function createStripeConnect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await paymentService.createStripeConnectAccount(req.user!.userId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getStripeConnectLink(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await paymentService.getStripeConnectOnboardingLink(req.user!.userId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
