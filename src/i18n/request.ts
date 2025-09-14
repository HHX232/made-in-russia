import {getRequestConfig} from 'next-intl/server'
import {hasLocale} from 'next-intl'
import {routing} from './routing'
import {axiosClassic} from '@/api/api.interceptor'
import {headers} from 'next/headers'
import {getCurrentLocale} from '@/lib/locale-detection'

export default getRequestConfig(async ({requestLocale}) => {
  const headersList = await headers()

  // Сначала пытаемся получить локаль из заголовков (установленных middleware)
  // let locale = headersList.get('x-locale') || headersList.get('x-next-intl-locale')
  let locale = await getCurrentLocale()

  // Если не найдено в заголовках, пытаемся извлечь из referer
  if (!locale) {
    const referer = headersList.get('referer')
    if (referer) {
      // const match = referer.match(/\/([a-z]{2})\//)
      // if (match && routing.locales.includes(match[1] as any)) {
      //   locale = match[1]
      // }
    }
  }

  // Если все еще не найдено, используем requestLocale
  if (!locale) {
    const requested = await requestLocale
    locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  }

  // Валидируем локаль
  if (!hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale
  }

  console.log('🌍 Final locale determined:', locale)

  const localMessages = (await import(`../../messages/${locale}.json`)).default

  try {
    // ВАЖНО: Добавляем локаль в заголовки запроса
    const response = await axiosClassic.get(`localization/${locale}`, {
      headers: {
        'Accept-Language': locale,
        'X-Locale': locale
      }
    })

    const serverMessages = response.data as Record<string, string>

    return {
      locale,
      messages: {
        ...localMessages,
        ...serverMessages
      }
    }
  } catch (error) {
    console.warn(`Failed to load server messages for ${locale}, using local fallback:`, error)
    return {
      locale,
      messages: localMessages
    }
  }
})
