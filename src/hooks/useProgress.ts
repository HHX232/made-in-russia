import {NProgressAPI} from '@/components/UI-kit/loaders/nprogress-provider'
import {useCallback, useRef} from 'react'

interface UseNProgressOptions {
  delay?: number // Задержка перед показом прогресса (мс)
  minimumDuration?: number // Минимальная длительность показа (мс)
  fastMode?: boolean // Быстрый режим без задержек
}

export const useNProgress = (options: UseNProgressOptions = {}) => {
  const {delay = 0, minimumDuration = 100, fastMode = false} = options // Сократили minimumDuration
  const startTimeRef = useRef<number | null>(null)
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    if (fastMode) {
      // Быстрый режим - без задержек
      NProgressAPI.start()
      startTimeRef.current = Date.now()
      return
    }

    if (delay > 0) {
      delayTimerRef.current = setTimeout(() => {
        NProgressAPI.start()
        startTimeRef.current = Date.now()
      }, delay)
    } else {
      NProgressAPI.start()
      startTimeRef.current = Date.now()
    }
  }, [delay, fastMode])

  const done = useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current)
      delayTimerRef.current = null
      return
    }

    if (fastMode) {
      // Быстрый режим - мгновенное завершение
      NProgressAPI.done()
      startTimeRef.current = null
      return
    }

    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    const remainingTime = Math.max(0, minimumDuration - elapsed)

    if (remainingTime > 0) {
      setTimeout(() => {
        NProgressAPI.done()
        startTimeRef.current = null
      }, remainingTime)
    } else {
      NProgressAPI.done()
      startTimeRef.current = null
    }
  }, [minimumDuration, fastMode])

  const hide = useCallback(() => {
    // Мгновенное скрытие для экстренных случаев
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current)
      delayTimerRef.current = null
    }
    NProgressAPI.hide()
    startTimeRef.current = null
  }, [])

  const set = useCallback((progress: number) => {
    NProgressAPI.set(progress)
  }, [])

  const inc = useCallback((amount?: number) => {
    NProgressAPI.inc(amount)
  }, [])

  const isStarted = useCallback(() => {
    return NProgressAPI.isStarted()
  }, [])

  return {
    start,
    done,
    hide, // Новый метод для мгновенного скрытия
    set,
    inc,
    isStarted
  }
}

// Быстрый хук для async операций без задержек
export const useAsyncProgress = (options: UseNProgressOptions = {}) => {
  const nprogress = useNProgress({...options, fastMode: true}) // Включен быстрый режим

  const execute = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      nprogress.start()

      try {
        const result = await asyncFn()
        return result
      } catch (error) {
        throw error
      } finally {
        nprogress.done()
      }
    },
    [nprogress]
  )

  return {
    execute,
    ...nprogress
  }
}

// Быстрый хук для навигации без задержек
export const useNavigationProgress = () => {
  const nprogress = useNProgress({fastMode: true})

  const handleNavigation = useCallback(
    (callback: () => void | Promise<void>) => {
      nprogress.start()

      const executeCallback = async () => {
        try {
          await callback()
        } finally {
          // Даем небольшое время для завершения навигации
          requestAnimationFrame(() => {
            nprogress.done()
          })
        }
      }

      executeCallback()
    },
    [nprogress]
  )

  return {
    handleNavigation,
    ...nprogress
  }
}

// Хук для отслеживания производительности
export const usePerformanceProgress = () => {
  const startTime = useRef<number | null>(null)

  const start = useCallback(() => {
    startTime.current = performance.now()
    NProgressAPI.start()
  }, [])

  const done = useCallback(() => {
    const endTime = performance.now()
    const duration = startTime.current ? endTime - startTime.current : 0

    // Логируем производительность в режиме разработки
    if (process.env.NODE_ENV === 'development' && duration > 0) {
      console.log(`NProgress duration: ${duration.toFixed(2)}ms`)
    }

    NProgressAPI.done()
    startTime.current = null
  }, [])

  return {
    start,
    done,
    hide: NProgressAPI.hide,
    set: NProgressAPI.set,
    inc: NProgressAPI.inc,
    isStarted: NProgressAPI.isStarted
  }
}
