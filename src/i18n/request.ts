// import {getRequestConfig} from 'next-intl/server'
// import {hasLocale} from 'next-intl'
// import {routing} from './routing'
// import {axiosClassic} from '@/api/api.interceptor'

// const SERVER_TIMEOUT = 800 // 800ms на запрос к серверу

// export default getRequestConfig(async ({requestLocale}) => {
//   const requested = await requestLocale
//   const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

//   const localMessages = (await import(`../../messages/${locale}.json`)).default

//   try {
//     // Создаем Promise с таймаутом
//     const timeoutPromise = new Promise((_, reject) => {
//       setTimeout(() => reject(new Error('Server timeout')), SERVER_TIMEOUT)
//     })

//     const serverRequest = axiosClassic.get('language/' + locale)

//     // Гонка между запросом и таймаутом
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const response: any = await Promise.race([serverRequest, timeoutPromise])
//     const serverMessages = response?.data as Record<string, string>

//     console.log(`✅ Server messages loaded for ${locale}`)

//     return {
//       locale,
//       messages: {
//         ...localMessages,
//         ...serverMessages
//       },
//       // Передаем метаданные через специальные ключи
//       __translation_meta: {
//         source: 'server',
//         timestamp: Date.now(),
//         locale
//       }
//     }
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (error: any) {
//     console.warn(`⚠️ Server messages failed for ${locale}, using local:`, error.message)

//     return {
//       locale,
//       messages: localMessages,
//       __translation_meta: {
//         source: 'local',
//         timestamp: Date.now(),
//         locale
//       }
//     }
//   }
// })

import {getRequestConfig} from 'next-intl/server'
import {hasLocale} from 'next-intl'
import {routing} from './routing'
import {axiosClassic} from '@/api/api.interceptor'

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  const localMessages = (await import(`../../messages/${locale}.json`)).default

  try {
    const response = await axiosClassic.get('language/' + locale)
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
