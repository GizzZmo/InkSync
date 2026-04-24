import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';

import { env } from './config/env';
import { initSentry } from './config/sentry';
import { connectDatabase } from './config/database';
import { initSocketServer } from './services/socketService';
import { initReminderScheduler } from './services/reminderService';

import { errorHandler, notFound } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import artistRoutes from './routes/artists';
import appointmentRoutes from './routes/appointments';
import availabilityRoutes from './routes/availability';
import waiverRoutes from './routes/waivers';
import paymentRoutes from './routes/payments';
import stripeRoutes from './routes/stripe';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import aftercareRoutes from './routes/aftercare';
import studioRoutes from './routes/studios';
import webhookRoutes from './routes/webhooks';

// Initialize Sentry before everything else
initSentry();

const app = express();
const httpServer = http.createServer(app);

// Sentry request handler must be first middleware
app.use(Sentry.Handlers.requestHandler());

// Security & utility middleware
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());

// Stripe webhook needs raw body — register before json parser
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/auth', authLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/artists', artistRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/availability', availabilityRoutes);
app.use('/waivers', waiverRoutes);
app.use('/payments', paymentRoutes);
app.use('/stripe', stripeRoutes);
app.use('/messages', messageRoutes);
app.use('/notifications', notificationRoutes);
app.use('/aftercare', aftercareRoutes);
app.use('/studios', studioRoutes);

// Sentry error handler must be before custom error handler
app.use(Sentry.Handlers.errorHandler());

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

// Initialize Socket.IO
initSocketServer(httpServer);

// Start server
async function start(): Promise<void> {
  await connectDatabase();
  initReminderScheduler();
  httpServer.listen(env.PORT, () => {
    console.log(`🚀 InkSync API running on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export { app, httpServer };
