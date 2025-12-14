import {getRequestConfig} from 'next-intl/server'
import {hasLocale} from 'next-intl'
import {routing} from './routing'
import {axiosClassic} from '@/api/api.interceptor'
import {getCurrentLocale} from '@/lib/locale-detection'
import {messages as allMessages} from './messages'

function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  const result = {...target} as Record<string, unknown>

  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue as Record<string, unknown>, sourceValue as Record<string, unknown>)
    } else {
      result[key] = sourceValue
    }
  }

  return result as T
}

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await getCurrentLocale()

  if (!locale) {
    const requested = await requestLocale
    locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  }

  if (!hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale
  }

  // Статический импорт сообщений
  const localMessages = allMessages[locale as keyof typeof allMessages] || allMessages.en

  try {
    const response = await axiosClassic.get(`localization/${locale}`, {
      headers: {
        'Accept-Language': locale,
        'X-Locale': locale
      }
    })

    const serverMessages = response.data as Record<string, unknown>

    return {
      locale,
      messages: deepMerge(localMessages, serverMessages)
    }
  } catch (error) {
    console.warn(`Failed to load server messages for ${locale}, using local fallback:`, error)
    return {
      locale,
      messages: localMessages
    }
  }
})
