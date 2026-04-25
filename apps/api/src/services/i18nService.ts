import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const SUPPORTED_LANGUAGES = ['en', 'es', 'de', 'fr', 'pt', 'ja'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'BRL', 'JPY', 'CAD', 'AUD', 'MXN'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

// RTL languages
const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur']);

export function getSupportedLocales() {
  return {
    languages: SUPPORTED_LANGUAGES,
    currencies: SUPPORTED_CURRENCIES,
    rtlLanguages: [...RTL_LANGUAGES],
  };
}

export async function getUserLocale(userId: string) {
  const locale = await prisma.userLocale.findUnique({ where: { userId } });
  return locale ?? {
    userId,
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    rtlEnabled: false,
  };
}

export async function upsertUserLocale(userId: string, data: {
  language?: string;
  currency?: string;
  timezone?: string;
}) {
  if (data.language && !SUPPORTED_LANGUAGES.includes(data.language as SupportedLanguage)) {
    throw new AppError(400, `Unsupported language: ${data.language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`);
  }
  if (data.currency && !SUPPORTED_CURRENCIES.includes(data.currency as SupportedCurrency)) {
    throw new AppError(400, `Unsupported currency: ${data.currency}. Supported: ${SUPPORTED_CURRENCIES.join(', ')}`);
  }

  const rtlEnabled = data.language ? RTL_LANGUAGES.has(data.language) : undefined;

  return prisma.userLocale.upsert({
    where: { userId },
    update: {
      ...(data.language ? { language: data.language } : {}),
      ...(data.currency ? { currency: data.currency } : {}),
      ...(data.timezone ? { timezone: data.timezone } : {}),
      ...(rtlEnabled !== undefined ? { rtlEnabled } : {}),
    },
    create: {
      userId,
      language: data.language ?? 'en',
      currency: data.currency ?? 'USD',
      timezone: data.timezone ?? 'UTC',
      rtlEnabled: rtlEnabled ?? false,
    },
  });
}

/**
 * Returns Stripe-compatible currency and amount for a given price.
 * JPY and similar zero-decimal currencies don't use cents.
 */
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'VND', 'BIF', 'CLP', 'GNF', 'MGA', 'PYG', 'RWF', 'UGX', 'XAF', 'XOF', 'XPF']);

export function toStripeAmount(amount: number, currency: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

export function fromStripeAmount(stripeAmount: number, currency: string): number {
  if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) {
    return stripeAmount;
  }
  return stripeAmount / 100;
}
