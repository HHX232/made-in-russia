export type Locale = (typeof locales)[number]

export const locales = ['en', 'ru', 'zh', 'hi'] as const
export const defaultLocale: Locale = 'en'
