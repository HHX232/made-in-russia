export type Locale = (typeof locales)[number]

export const locales = ['en', 'ru', 'zh'] as const
export const defaultLocale: Locale = 'en'
