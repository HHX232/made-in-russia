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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorCatch = (error: any): string =>
  error.response && error.response.data && error.response.data.message
    ? typeof error.response.data.message === 'object'
      ? error.response.data.message[0]
      : error.response.data.essage
    : error.message
