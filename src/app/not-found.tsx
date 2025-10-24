'use client'
// import Footer from '@/components/MainComponents/Footer/Footer'
// import Header from '@/components/MainComponents/Header/Header'
// import Link from 'next/link'
import styles from '@/scss/notFound.module.scss'
import {useState, useEffect, useRef, useCallback} from 'react'
import Footer from '@/components/MainComponents/Footer/Footer'
import Header from '@/components/MainComponents/Header/Header'
import {useTranslations} from 'next-intl'
import Link from 'next/link'

interface Dot {
  id: string
  originalX: number
  originalY: number
  currentX: number
  currentY: number
  color: string
}

interface MousePosition {
  x: number
  y: number
}

export default function NotFound() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [mousePos, setMousePos] = useState<MousePosition>({x: -1000, y: -1000})
  const [dots, setDots] = useState<Dot[]>([])
  const [isMouseInside, setIsMouseInside] = useState<boolean>(false)
  const [windowWidth, setWindowWidth] = useState<number>(0)
  const animationFrameRef = useRef<number>(1)
  const lastUpdateTime = useRef<number>(0)

  // Отслеживаем размер окна
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Устанавливаем начальное значение
    setWindowWidth(window.innerWidth)

    // Добавляем слушатель изменения размера окна
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Создаем точки для формирования "404"
  useEffect(() => {
    const createDotsFor404 = (): Dot[] => {
      const newDots: Dot[] = []
      const spacing = 2 // Немного увеличили для производительности
      const dotDensity = 2 // Уменьшили плотность для производительности

      // Функция для создания точек в форме цифры
      const createDigit = (digit: '4' | '0', offsetX: number): void => {
        const patterns: Record<'4' | '0', number[][]> = {
          '4': [
            [1, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 0, 0],
            [1, 1, 0, 1, 0, 0],
            [1, 1, 0, 1, 0, 0],
            [1, 1, 0, 1, 0, 0],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [0, 0, 0, 1, 0, 0],
            [0, 0, 0, 1, 0, 0],
            [0, 0, 0, 1, 0, 0]
          ],
          '0': [
            [0, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1],
            [1, 1, 0, 0, 1, 1],
            [1, 1, 0, 0, 1, 1],
            [1, 1, 0, 0, 1, 1],
            [1, 1, 0, 0, 1, 1],
            [1, 1, 0, 0, 1, 1],
            [1, 1, 0, 0, 1, 1],
            [1, 1, 1, 1, 1, 1],
            [0, 1, 1, 1, 1, 0]
          ]
        }

        const pattern = patterns[digit]
        pattern.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell === 1) {
              // Создаем несколько точек в каждой "ячейке"
              for (let dy = 0; dy < dotDensity; dy++) {
                for (let dx = 0; dx < dotDensity; dx++) {
                  const subX = x * dotDensity + dx
                  const subY = y * dotDensity + dy

                  // Небольшая случайность
                  const randomOffset = 0.15
                  const randomX = (Math.random() - 0.5) * randomOffset
                  const randomY = (Math.random() - 0.5) * randomOffset

                  // Чередуем цвета
                  const colorIndex = (subX + subY) % 2
                  const color = colorIndex === 0 ? '#AC2525' : '#2A2E46'

                  const posX = offsetX + subX * spacing + randomX
                  const posY = subY * spacing + randomY

                  newDots.push({
                    id: `${offsetX}-${subX}-${subY}`,
                    originalX: posX,
                    originalY: posY,
                    currentX: posX,
                    currentY: posY,
                    color: color
                  })
                }
              }
            }
          })
        })
      }

      // Создаем три цифры: 4, 0, 4
      createDigit('4', 0)
      createDigit('0', 30)
      createDigit('4', 60)

      return newDots
    }

    setDots(createDotsFor404())
  }, [])

  // Throttled обработчик движения мыши
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>): void => {
    if (!svgRef.current) return

    const now = Date.now()
    if (now - lastUpdateTime.current < 16) return // ~60fps throttling
    lastUpdateTime.current = now

    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = 100 / rect.width
    const scaleY = 50 / rect.height

    const newX = (e.clientX - rect.left) * scaleX
    const newY = (e.clientY - rect.top) * scaleY

    setMousePos({x: newX, y: newY})
    setIsMouseInside(true)
  }, [])

  // Анимация точек с использованием requestAnimationFrame
  useEffect(() => {
    const animate = () => {
      const repelRadius = 20
      const maxDistance = 10

      setDots((prevDots) =>
        prevDots.map((dot) => {
          if (isMouseInside && mousePos.x !== -1000) {
            // Мышь внутри - отталкиваем точки
            const dx = dot.originalX - mousePos.x
            const dy = dot.originalY - mousePos.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < repelRadius && distance > 0) {
              const force = 1 - distance / repelRadius
              const angle = Math.atan2(dy, dx)

              const targetX = dot.originalX + Math.cos(angle) * force * maxDistance
              const targetY = dot.originalY + Math.sin(angle) * force * maxDistance

              // Плавная интерполяция к целевой позиции
              return {
                ...dot,
                currentX: dot.currentX + (targetX - dot.currentX) * 0.2,
                currentY: dot.currentY + (targetY - dot.currentY) * 0.2
              }
            } else {
              // Точки вне радиуса - медленно возвращаются к исходной позиции
              const returnSpeed = 0.05
              return {
                ...dot,
                currentX: dot.currentX + (dot.originalX - dot.currentX) * returnSpeed,
                currentY: dot.currentY + (dot.originalY - dot.currentY) * returnSpeed
              }
            }
          } else {
            // Мышь вне контейнера - быстрее возвращаем все точки на места
            const returnSpeed = 0.15
            const dx = dot.originalX - dot.currentX
            const dy = dot.originalY - dot.currentY
            const distance = Math.sqrt(dx * dx + dy * dy)

            // Если точка уже практически на месте, устанавливаем точное положение
            if (distance < 0.01) {
              return {
                ...dot,
                currentX: dot.originalX,
                currentY: dot.originalY
              }
            }

            return {
              ...dot,
              currentX: dot.currentX + dx * returnSpeed,
              currentY: dot.currentY + dy * returnSpeed
            }
          }
        })
      )

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [mousePos, isMouseInside])

  // Обработчики входа и выхода мыши
  const handleMouseEnter = useCallback(() => {
    setIsMouseInside(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsMouseInside(false)
    setMousePos({x: -1000, y: -1000})
  }, [])

  // Вычисляем размеры на основе состояния windowWidth
  const isMobile = windowWidth < 600
  const svgWidth = isMobile ? 300 : 500
  const svgHeight = isMobile ? 150 : 250
  const paddingStyle = isMobile ? '40px 20px' : ''
  const marginLeft = isMobile ? '40px' : '70px'
  const t = useTranslations('NotFoundPage')
  if (windowWidth === 0) {
    return (
      <div className={styles.notFoundContainer}>
        <Header />
        <main className={styles.mainContent}>
          <div className={styles.contentWrapper}>
            {/* <div style={{height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              Loading...
            </div> */}
            <p className={styles.description}>{t('mainText')}</p>
            <Link href='/' className={styles.homeButton}>
              {t('goBack')}{' '}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className={styles.notFoundContainer}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {/* SVG с интерактивными точками */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: paddingStyle,
              overflow: 'visible'
            }}
          >
            <svg
              ref={svgRef}
              width={svgWidth}
              height={svgHeight}
              viewBox='0 0 100 50'
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
                overflow: 'visible',
                marginLeft: marginLeft,
                maxHeight: '11.5rem',
                maxWidth: '100%',
                marginTop: '40px'
              }}
            >
              {dots.map((dot) => (
                <circle
                  key={dot.id}
                  cx={dot.currentX}
                  cy={dot.currentY}
                  r='0.6'
                  fill={dot.color}
                  style={{
                    opacity: 0.9,
                    transition: !isMouseInside ? 'all 0.3s ease-out' : 'none'
                  }}
                />
              ))}
            </svg>
          </div>

          {/* Контент */}
          <p className={styles.description}>{t('mainText')}</p>

          {/* Кнопка */}
          <Link href='/' className={styles.homeButton}>
            {t('goBack')}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
