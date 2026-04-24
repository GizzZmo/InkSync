import Stripe from 'stripe';
import { env } from './env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
  typescript: true,
});
