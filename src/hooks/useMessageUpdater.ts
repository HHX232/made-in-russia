import {useEffect, useState} from 'react'
import {useLocale} from 'next-intl'
import {axiosClassic} from '@/api/api.interceptor'
import {useCurrentLanguage} from './useCurrentLanguage'

const getCachedMessages = (locale: string) => {
  try {
    const cached = localStorage.getItem(`messages_${locale}`)
    const timestamp = localStorage.getItem(`messages_${locale}_timestamp`)

    if (!cached || !timestamp) return null

    const cacheAge = Date.now() - parseInt(timestamp)
    const threeHours = 3 * 60 * 60 * 1000

    if (cacheAge > threeHours) {
      localStorage.removeItem(`messages_${locale}`)
      localStorage.removeItem(`messages_${locale}_timestamp`)
      return null
    }

    return JSON.parse(cached)
  } catch (error) {
    console.warn('Failed to parse cached messages:', error)
    return null
  }
}

const setCachedMessages = (locale: string, messages: Record<string, string>) => {
  try {
    localStorage.setItem(`messages_${locale}`, JSON.stringify(messages))
    localStorage.setItem(`messages_${locale}_timestamp`, Date.now().toString())
  } catch (error) {
    console.warn('Failed to cache messages:', error)
  }
}

export const useMessageCache = () => {
  const locale = useLocale()
  const [updatedMessages, setUpdatedMessages] = useState<Record<string, string> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const currentLang = useCurrentLanguage()

  useEffect(() => {
    const updateMessages = async () => {
      // Проверяем кеш
      const cachedMessages = getCachedMessages(locale)

      if (cachedMessages) {
        console.log('Using cached messages for', locale)
        setUpdatedMessages(cachedMessages)
        return
      }

      // Если кеша нет или он устарел, запрашиваем с сервера
      try {
        setIsLoading(true)
        const response = await axiosClassic.get('localization/' + locale, {
          headers: {
            'Accept-Language': currentLang
          }
        })
        const serverMessages = response.data as Record<string, string>

        // Сохраняем в кеш
        setCachedMessages(locale, serverMessages)
        setUpdatedMessages(serverMessages)
      } catch (error) {
        console.warn(`Failed to load server messages for ${locale}:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    updateMessages()
  }, [locale])

  return {updatedMessages, isLoading}
}
