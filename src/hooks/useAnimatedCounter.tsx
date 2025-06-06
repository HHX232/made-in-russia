import {useState, useEffect} from 'react'

interface UseAnimatedCounterProps {
  targetValue: number
  duration?: number // в миллисекундах
  startAnimation?: boolean
}

export const useAnimatedCounter = ({targetValue, duration = 2000, startAnimation = true}: UseAnimatedCounterProps) => {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    if (!startAnimation || targetValue === 0) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp

      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Используем easeOutCubic для более плавного завершения
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const newValue = Math.floor(targetValue * easeOutCubic)

      setCurrentValue(newValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCurrentValue(targetValue) // Убеждаемся, что достигли точного значения
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [targetValue, duration, startAnimation])

  return currentValue
}
