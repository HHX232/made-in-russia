// i18n/routing.ts
import {SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale} from '@/lib/locale-detection'

// Простая конфигурация без next-intl routing
export const routing = {
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE
} as const

// Экспортируем типы для совместимости
export type Locale = SupportedLocale
