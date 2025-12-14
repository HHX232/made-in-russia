import {useState, useEffect} from 'react'

/**
 * Хук для получения ширины окна браузера
 * Возвращает undefined до монтирования компонента (SSR-friendly)
 */
const useWindowWidth = (): number | undefined => {
  const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined)

  useEffect(() => {
    // Проверяем, что мы находимся в браузере
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Устанавливаем начальное значение
    setWindowWidth(window.innerWidth)

    // Добавляем слушатель события
    window.addEventListener('resize', handleResize)

    // Очищаем слушатель при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return windowWidth
}

export const useWindowWidthDebounced = (debounceMs: number = 150): number | undefined => {
  const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let timeoutId: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth)
      }, debounceMs)
    }

    // Устанавливаем начальное значение без дебаунса
    setWindowWidth(window.innerWidth)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [debounceMs])

  return windowWidth
}

export default useWindowWidth
