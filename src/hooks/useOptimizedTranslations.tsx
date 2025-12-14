/* eslint-disable @typescript-eslint/no-unused-vars */
import {useEffect, useState} from 'react'
import {useLocale} from 'next-intl'
import {axiosClassic} from '@/api/api.interceptor'

const CACHE_DURATION = 3 * 60 * 60 * 1000 // 3 часа

interface TranslationMeta {
  source: 'server' | 'local'
  timestamp: number
  locale: string
}

const getCachedMessages = (locale: string) => {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(`messages_${locale}`)
    const timestamp = localStorage.getItem(`messages_${locale}_timestamp`)

    if (!cached || !timestamp) return null

    const cacheAge = Date.now() - parseInt(timestamp)
    if (cacheAge > CACHE_DURATION) {
      // Кеш устарел, очищаем
      localStorage.removeItem(`messages_${locale}`)
      localStorage.removeItem(`messages_${locale}_timestamp`)
      return null
    }

    return {
      messages: JSON.parse(cached),
      age: cacheAge
    }
  } catch (error) {
    console.warn('Failed to parse cached messages:', error)
    return null
  }
}

const setCachedMessages = (locale: string, messages: Record<string, string>) => {
  if (typeof window === 'undefined') return

  try {
    const {__translation_meta, ...cleanMessages} = messages
    localStorage.setItem(`messages_${locale}`, JSON.stringify(cleanMessages))
    localStorage.setItem(`messages_${locale}_timestamp`, Date.now().toString())
    console.log(`💾 Cached messages for ${locale}`)
  } catch (error) {
    console.warn('Failed to cache messages:', error)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useOptimizedTranslations = (initialMessages: Record<string, any>) => {
  const locale = useLocale()
  const [messages, setMessages] = useState(initialMessages)
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState<'initial' | 'cached' | 'updated' | 'error'>('initial')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleTranslations = async () => {
      const meta = initialMessages.__translation_meta as TranslationMeta
      const cachedData = getCachedMessages(locale)

      // Если сервер уже загрузил данные
      if (meta?.source === 'server') {
        console.log(`✅ Using server data for ${locale}`)
        // Сохраняем серверные данные в кеш для следующего раза
        setCachedMessages(locale, initialMessages)
        setStatus('updated')
        return
      }

      // Если есть свежий кеш
      if (cachedData) {
        console.log(`📦 Using cached data for ${locale} (age: ${Math.round(cachedData.age / 1000 / 60)}m)`)
        setMessages((prev) => ({
          ...prev,
          ...cachedData.messages
        }))
        setStatus('cached')
        return
      }

      // Если сервер использовал локальные файлы И нет кеша - запрашиваем с сервера
      if (meta?.source === 'local') {
        try {
          setIsUpdating(true)
          console.log(`🔄 Fetching fresh data for ${locale}`)

          const response = await axiosClassic.get('localization/' + locale)
          const serverMessages = response.data as Record<string, string>

          const updatedMessages = {
            ...initialMessages,
            ...serverMessages
          }

          setMessages(updatedMessages)
          setCachedMessages(locale, updatedMessages)
          setStatus('updated')
        } catch (error) {
          console.warn(`❌ Failed to fetch fresh data for ${locale}:`, error)
          setStatus('error')
        } finally {
          setIsUpdating(false)
        }
      }
    }

    // Небольшая задержка для завершения гидратации
    const timer = setTimeout(handleTranslations, 50)
    return () => clearTimeout(timer)
  }, [locale, initialMessages])

  // Убираем метаданные из финальных сообщений
  const {__translation_meta, ...cleanMessages} = messages

  return {
    messages: cleanMessages,
    isUpdating,
    status
  }
}
