export const getContentType = (overrideLang?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  const getCurrentLanguage = (): string => {
    if (typeof window !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1]

      if (cookieValue) {
        return cookieValue
      }

      const pathname = window.location.pathname
      const langMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
      if (langMatch) {
        return langMatch[1]
      }
    }
    return 'en'
  }

  const currentLang = overrideLang || getCurrentLanguage()
  headers['Accept-Language'] = currentLang

  return headers
}

type TAllLang = 'ru' | 'en' | 'zh'

export const getAbsoluteLanguage = async (): Promise<TAllLang> => {
  const isServer = typeof window === 'undefined'

  if (isServer) {
    // --- Серверная часть ---
    const {cookies, headers} = await import('next/headers')

    const cookieStore = await cookies()
    let locale = cookieStore.get('NEXT_LOCALE')?.value

    if (!locale) {
      const headersList = await headers()
      locale = headersList.get('x-next-intl-locale') || headersList.get('x-locale') || undefined

      if (!locale) {
        const referer = headersList.get('referer')
        if (referer) {
          const match = referer.match(/\/([a-z]{2})\//)
          if (match && ['en', 'ru', 'zh'].includes(match[1])) {
            locale = match[1]
          }
        }
      }
    }

    return (locale as TAllLang) || 'en'
  } else {
    // --- Клиентская часть ---
    // Пробуем взять из cookie
    const cookieMatch = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/)
    let locale = cookieMatch ? decodeURIComponent(cookieMatch[1]) : undefined

    // Если нет, пробуем URL
    if (!locale) {
      const match = window.location.pathname.match(/^\/([a-z]{2})(\/|$)/)
      if (match && ['en', 'ru', 'zh'].includes(match[1])) {
        locale = match[1]
      }
    }

    return (locale as TAllLang) || 'en'
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorCatch = (error: any): string =>
  error.response && error.response.data && error.response.data.message
    ? typeof error.response.data.message === 'object'
      ? error.response.data.message[0]
      : error.response.data.essage
    : error.message
