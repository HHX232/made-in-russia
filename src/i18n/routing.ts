// i18n/routing.ts
import {defineRouting} from 'next-intl/routing'
import {SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale} from '@/lib/locale-detection'

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'never'
})

// Экспортируем типы для совместимости
export type Locale = SupportedLocale
