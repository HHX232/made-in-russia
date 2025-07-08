// hooks/useCurrentLanguage.ts
import {useLocale} from 'next-intl'
import {usePathname} from 'next/navigation'
import {useMemo, useEffect, useState} from 'react'

export const useCurrentLanguage = () => {
  const locale = useLocale()
  const [cookieLocale, setCookieLocale] = useState<string | null>(null)

  useEffect(() => {
    const getCookieLocale = () => {
      if (typeof window !== 'undefined') {
        const cookieValue = document.cookie
          .split('; ')
          .find((row) => row.startsWith('NEXT_LOCALE='))
          ?.split('=')[1]
        return cookieValue || null
      }
      return null
    }

    setCookieLocale(getCookieLocale())
  }, [locale])

  return useMemo(() => {
    return cookieLocale || locale
  }, [cookieLocale, locale])
}

// Альтернативный вариант с подпиской на изменения куки
export const useCurrentLanguageWithCookie = () => {
  const locale = useLocale()
  const [currentLang, setCurrentLang] = useState(locale)
  const pathname = usePathname()
  useEffect(() => {
    const updateLanguage = () => {
      if (typeof window !== 'undefined') {
        const cookieValue = document.cookie
          .split('; ')
          .find((row) => row.startsWith('NEXT_LOCALE='))
          ?.split('=')[1]

        setCurrentLang(cookieValue || locale)
      }
    }

    updateLanguage()
  }, [locale, pathname])

  return currentLang
}

export const useCurrentLanguageFromCookie = () => {
  const locale = useLocale()

  return useMemo(() => {
    if (typeof window !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1]
      return cookieValue || locale
    }
    return locale
  }, [locale])
}

// Пример использования:
// import { useCurrentLanguage } from '@/hooks/useCurrentLanguage'
//
// const Component = () => {
//   const currentLang = useCurrentLanguage()
//
//   const fetchData = async () => {
//     // Язык автоматически подставится из next-intl
//     const response = await instance.get('/api/data')
//
//     // Или можно явно перебить:
//     const specificResponse = await instance.get('/api/data', {
//       headers: { 'Accept-Language': currentLang }
//     })
//   }
//
//   return <div>Current language: {currentLang}</div>
// }
