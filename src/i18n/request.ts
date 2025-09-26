import {getRequestConfig} from 'next-intl/server'
import {hasLocale} from 'next-intl'
import {routing} from './routing'
import {axiosClassic} from '@/api/api.interceptor'
import {getCurrentLocale} from '@/lib/locale-detection'

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await getCurrentLocale()

  if (!locale) {
    const requested = await requestLocale
    locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  }

  if (!hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale
  }
  console.log('locale in request.ts', locale)
  const localMessages = (await import(`../../messages/${locale === 'en' ? 'en' : locale === 'ru' ? 'ru' : 'zh'}.json`))
    .default

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
