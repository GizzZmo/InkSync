import { Request, Response, NextFunction } from 'express';
import { stripe } from '../config/stripe';
import { env } from '../config/env';
import * as paymentService from '../services/paymentService';

export async function handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sig = req.headers['stripe-signature'];
  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    res.status(400).json({ success: false, error: 'Webhook signature missing' });
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );

    await paymentService.handleStripeWebhook(event);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}
