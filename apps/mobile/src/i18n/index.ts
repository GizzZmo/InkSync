import { I18n } from 'i18n-js';
import { NativeModules, Platform } from 'react-native';

import en from './locales/en';
import es from './locales/es';
import de from './locales/de';
import fr from './locales/fr';
import pt from './locales/pt';
import ja from './locales/ja';

export type Translations = typeof en;
export type TranslationKey = keyof Translations;

export const SUPPORTED_LANGUAGES = ['en', 'es', 'de', 'fr', 'pt', 'ja'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  pt: 'Português',
  ja: '日本語',
};

export const i18n = new I18n({
  en,
  es,
  de,
  fr,
  pt,
  ja,
});

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

/**
 * Detect the device locale and set accordingly, falling back to 'en'.
 */
function getDeviceLocale(): string {
  try {
    const locale: string =
      Platform.OS === 'ios'
        ? (NativeModules.SettingsManager?.settings?.AppleLocale ||
           NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
           'en')
        : NativeModules.I18nManager?.localeIdentifier ?? 'en';
    return locale.split(/[-_]/)[0]; // e.g. 'en-US' → 'en'
  } catch {
    return 'en';
  }
}

export function setLocale(language: string): void {
  const lang = SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
    ? language
    : 'en';
  i18n.locale = lang;
}

export function initLocale(savedLanguage?: string): void {
  if (savedLanguage) {
    setLocale(savedLanguage);
  } else {
    setLocale(getDeviceLocale());
  }
}

export function getLanguageName(code: SupportedLanguage): string {
  return LANGUAGE_NAMES[code] ?? code;
}

export function isRTL(language: string): boolean {
  const RTL_LANGS = new Set(['ar', 'he', 'fa', 'ur']);
  return RTL_LANGS.has(language);
}

/**
 * Shorthand translation helper
 */
export function t(scope: string, options?: object): string {
  return i18n.t(scope, options);
}

export default i18n;
