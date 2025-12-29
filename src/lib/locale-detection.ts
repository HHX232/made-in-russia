// lib/locale-detection.ts
// Универсальная функция для определения локали, работающая и на сервере, и на клиенте

export const SUPPORTED_LOCALES = ['en', 'ru', 'zh', 'hi'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: SupportedLocale = 'en'

// Маппинг поддоменов на локали
const SUBDOMAIN_LOCALE_MAP: Record<string, SupportedLocale> = {
  en: 'en',
  ru: 'ru',
  cn: 'zh', // китайский поддомен cn -> локаль zh
  in: 'hi' // индийский поддомен in -> локаль hi
}

// Маппинг языковых кодов из Accept-Language на наши локали
const ACCEPT_LANGUAGE_MAP: Record<string, SupportedLocale> = {
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  ru: 'ru',
  'ru-RU': 'ru',
  zh: 'zh',
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  hi: 'hi',
  'hi-IN': 'hi'
}

/**
 * Универсальная функция для определения текущей локали
 * Работает как на сервере (middleware, API routes), так и на клиенте
 */
export async function getCurrentLocale(): Promise<SupportedLocale> {
  if (typeof window === 'undefined') {
    // Серверная среда - используем серверные импорты
    try {
      const {headers} = await import('next/headers')
      const {cookies} = await import('next/headers')

      const cookieStore = await cookies()
      const headersList = await headers()

      // 1. Явное предпочтение пользователя из куки
      const nextLocaleCookie = cookieStore.get('NEXT_LOCALE')?.value
      if (nextLocaleCookie && SUPPORTED_LOCALES.includes(nextLocaleCookie as SupportedLocale)) {
        return nextLocaleCookie as SupportedLocale
      }

      const host = headersList.get('host')
      if (host) {
        const subdomainLocale = parseSubdomain(host)
        if (subdomainLocale) {
          return subdomainLocale
        }
      }

      const acceptLanguageHeader = headersList.get('Accept-Language')
      if (acceptLanguageHeader) {
        const preferredLocale = parseAcceptLanguage(acceptLanguageHeader)
        if (preferredLocale) {
          return preferredLocale
        }
      }

      return DEFAULT_LOCALE
    } catch {
      // console.warn('Ошибка при определении локали на сервере:', error)
      return DEFAULT_LOCALE
    }
  } else {
    // Клиентская среда - используем клиентские API
    try {
      // 1. Явное предпочтение пользователя из куки
      const nextLocaleCookie = getClientCookie('NEXT_LOCALE')
      if (nextLocaleCookie && SUPPORTED_LOCALES.includes(nextLocaleCookie as SupportedLocale)) {
        return nextLocaleCookie as SupportedLocale
      }

      const hostname = window.location.hostname
      if (hostname) {
        const subdomainLocale = parseSubdomain(hostname)
        if (subdomainLocale) {
          return subdomainLocale
        }
      }

      if (navigator.language) {
        const preferredLocale = parseAcceptLanguage(navigator.language)
        if (preferredLocale) {
          return preferredLocale
        }
      }

      return DEFAULT_LOCALE
    } catch (error) {
      console.warn('Ошибка при определении локали на клиенте:', error)
      return DEFAULT_LOCALE
    }
  }
}

/**
 * Парсинг заголовка Accept-Language или navigator.language
 * Возвращает первую подходящую локаль или null
 */
function parseAcceptLanguage(acceptLanguage: string): SupportedLocale | null {
  try {
    // Если это простой язык из navigator.language (например, "ru-RU")
    if (!acceptLanguage.includes(',')) {
      const mappedLocale = ACCEPT_LANGUAGE_MAP[acceptLanguage] || ACCEPT_LANGUAGE_MAP[acceptLanguage.split('-')[0]]
      if (mappedLocale && SUPPORTED_LOCALES.includes(mappedLocale)) {
        return mappedLocale
      }
      return null
    }

    // Парсим заголовок Accept-Language
    // Формат: "en-US,en;q=0.9,ru;q=0.8"
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const [code, qValue] = lang.trim().split(';')
        const quality = qValue ? parseFloat(qValue.split('=')[1]) : 1.0
        return {code: code.trim(), quality}
      })
      .sort((a, b) => b.quality - a.quality) // Сортируем по качеству (приоритету)

    // Ищем первое совпадение с нашими поддерживаемыми локалями
    for (const {code} of languages) {
      const mappedLocale = ACCEPT_LANGUAGE_MAP[code] || ACCEPT_LANGUAGE_MAP[code.split('-')[0]]
      if (mappedLocale && SUPPORTED_LOCALES.includes(mappedLocale)) {
        return mappedLocale
      }
    }
  } catch (error) {
    console.warn('Ошибка при парсинге Accept-Language:', error)
  }

  return null
}

/**
 * Определение локали по поддомену
 */
function parseSubdomain(hostname: string): SupportedLocale | null {
  try {
    // Убираем www. если есть
    const cleanHostname = hostname.replace(/^www\./, '')

    // Извлекаем поддомен (первую часть до первой точки)
    const parts = cleanHostname.split('.')

    // Если есть хотя бы 2 части (поддомен.домен), берем первую как поддомен
    if (parts.length >= 2) {
      const subdomain = parts[0]
      const mappedLocale = SUBDOMAIN_LOCALE_MAP[subdomain]

      if (mappedLocale && SUPPORTED_LOCALES.includes(mappedLocale)) {
        return mappedLocale
      }
    }
  } catch (error) {
    console.warn('Ошибка при парсинге поддомена:', error)
  }

  return null
}

/**
 * Получение куки на клиенте
 */
function getClientCookie(name: string): string | null {
  try {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift()
      return cookieValue || null
    }
  } catch (error) {
    console.warn('Ошибка при получении куки:', error)
  }

  return null
}

/**
 * Установка куки на клиенте (для смены языка пользователем)
 */
export function setLocalePreference(locale: SupportedLocale, days: number = 365): void {
  if (typeof document === 'undefined') {
    return
  }

  try {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `NEXT_LOCALE=${locale}; ${expires}; path=/; SameSite=Lax`
  } catch (error) {
    console.warn('Ошибка при установке куки:', error)
  }
}
