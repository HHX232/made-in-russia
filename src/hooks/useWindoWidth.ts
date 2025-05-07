import {useState, useEffect} from 'react'

export const useWindowWidth = (): number => {
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Устанавливаем обработчик события
    window.addEventListener('resize', handleResize)

    // Вызываем handleResize сразу, чтобы установить начальное значение
    handleResize()

    // Убираем обработчик при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return windowWidth
}
