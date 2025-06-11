/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {FC, useState, useRef, useEffect, ReactNode, CSSProperties, useCallback} from 'react'
// import Image from 'next/image'
import styles from './DropList.module.scss'
import cn from 'clsx'
// const arrow = '/arrow-dark.svg'
// Обновленный интерфейс для поддержки строк и компонентов
type DropListItem = string | ReactNode

interface ArrowIconProps {
  color?: string
  width?: number | string
  height?: number | string
  className?: string
  style?: CSSProperties
  isActive?: boolean
  direction?: 'up' | 'down' | 'left' | 'right'
}

export const ArrowIcon: FC<ArrowIconProps> = ({
  color = '#2A2E46',
  width = 10,
  height = 5,
  className = '',
  style = {},
  direction = 'down'
}) => {
  const rotationMap = {
    up: 180,
    down: 0,
    left: 90,
    right: -90
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 10 5'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={`${styles.arrowIcon} ${className}`}
      style={{
        transform: `rotate(${rotationMap[direction]}deg)`,
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        minWidth: width,
        minHeight: height,
        ...style
      }}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M4.52599 4.77133L0.754657 0.999994L1.69732 0.0573269L4.99732 3.35733L8.29732 0.0573272L9.23999 0.999994L5.46866 4.77133C5.34364 4.89631 5.1741 4.96652 4.99732 4.96652C4.82055 4.96652 4.65101 4.89631 4.52599 4.77133Z'
        fill={color}
      />
    </svg>
  )
}

interface IDropListProps extends Pick<ArrowIconProps, 'color' | 'width' | 'height' | 'className' | 'style'> {
  title: string | ReactNode
  items: DropListItem[]
  direction?: 'left' | 'right' | 'bottom' | 'top'
  gap?: '0' | '5' | '10' | '15' | '20' | '25' | '30' | '35' | '40' | '45' | '50'
  extraClass?: string
  extraStyle?: React.CSSProperties
  extraListClass?: string
  positionIsAbsolute?: boolean
  arrowClassName?: string // Новый проп для классов стрелки
  isOpen?: boolean // Новый проп для внешнего управления состоянием
  onOpenChange?: (isOpen: boolean) => void // Коллбэк для оповещения родителя об изменении состояния
  trigger?: 'click' | 'hover' // Новый параметр для управления способом открытия
  hoverDelay?: number // Задержка для ховера в миллисекундах
  closeOnMouseLeave?: boolean // Будет ли закрываться при расховере (по умолчанию true)
  safeAreaEnabled?: boolean // Включить механизм безопасной зоны для навигации между списками
  safeAreaSize?: number // Размер безопасной зоны в пикселях
}

const DropList: FC<IDropListProps> = ({
  title = 'title',
  items = ['Hello1', 'Hello2'],
  direction = 'bottom',
  gap = '10',
  extraClass,
  extraStyle,
  extraListClass,
  positionIsAbsolute = true,
  color = '#2A2E46',
  width = 12,
  height = 7,
  arrowClassName,
  style,
  isOpen, // Внешнее состояние открытия/закрытия
  onOpenChange, // Коллбэк для оповещения родителя
  trigger = 'click', // По умолчанию клик
  hoverDelay = 200, // Задержка по умолчанию 200мс
  closeOnMouseLeave = true, // По умолчанию закрывается при расховере
  safeAreaEnabled = true, // По умолчанию включена безопасная зона
  safeAreaSize = 10 // Размер безопасной зоны в пикселях
}) => {
  // Используем внутреннее состояние только если внешнее не предоставлено
  const [internalOpenState, setInternalOpenState] = useState(false)

  // Определяем, какое состояние использовать
  const openList = isOpen !== undefined ? isOpen : internalOpenState

  // Рефы для таймеров ховера
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Используем рефы для хранения последней позиции мыши и траектории
  // чтобы избежать лишних рендеров
  const lastMousePosRef = useRef({x: 0, y: 0})
  const mouseTrajectoryRef = useRef<Array<{x: number; y: number; time: number}>>([])

  // Функция для переключения состояния
  const toggleList = () => {
    if (isOpen !== undefined) {
      // Если управление внешнее, вызываем коллбэк
      onOpenChange?.(!isOpen)
    } else {
      // Иначе используем внутреннее состояние
      setInternalOpenState(!internalOpenState)
    }
  }

  // Функция для открытия списка
  const openDropList = () => {
    if (isOpen !== undefined) {
      onOpenChange?.(true)
    } else {
      setInternalOpenState(true)
    }
  }

  // Функция для закрытия списка
  const closeDropList = () => {
    if (isOpen !== undefined) {
      onOpenChange?.(false)
    } else {
      setInternalOpenState(false)
    }
  }

  // Функция для проверки точки внутри прямоугольника
  const isPointInRect = (
    x: number,
    y: number,
    rect: DOMRect | {left: number; top: number; right: number; bottom: number}
  ) => {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }

  // Функция для проверки, движется ли мышь в сторону выпадающего списка
  const isMouseMovingTowardsList = useCallback(
    (currentX: number, currentY: number) => {
      if (!safeAreaEnabled || !listRef.current || !titleRef.current) return false

      const titleRect = titleRef.current.getBoundingClientRect()
      const listRect = listRef.current.getBoundingClientRect()

      // Проверяем, находится ли мышь в пределах заголовка или списка
      if (isPointInRect(currentX, currentY, listRect) || isPointInRect(currentX, currentY, titleRect)) {
        return true
      }

      // Создаем расширенную безопасную зону в зависимости от направления
      let safeZone: DOMRect

      switch (direction) {
        case 'bottom':
          // Расширяем зону вниз от заголовка до списка и по бокам
          safeZone = new DOMRect(
            Math.min(titleRect.left, listRect.left) - safeAreaSize,
            titleRect.bottom,
            Math.max(titleRect.width, listRect.width) + safeAreaSize * 2,
            listRect.top - titleRect.bottom + listRect.height + safeAreaSize
          )
          break
        case 'top':
          // Расширяем зону вверх от заголовка до списка и по бокам
          safeZone = new DOMRect(
            Math.min(titleRect.left, listRect.left) - safeAreaSize,
            listRect.top - safeAreaSize,
            Math.max(titleRect.width, listRect.width) + safeAreaSize * 2,
            titleRect.top - listRect.top + titleRect.height + safeAreaSize
          )
          break
        case 'right':
          // Расширяем зону вправо от заголовка, включая весь путь к списку
          const rightZoneWidth = Math.max(listRect.right - titleRect.right, safeAreaSize * 2)
          safeZone = new DOMRect(
            titleRect.right,
            Math.min(titleRect.top, listRect.top) - safeAreaSize,
            rightZoneWidth + listRect.width,
            Math.max(titleRect.height, listRect.height) + safeAreaSize * 2
          )
          break
        case 'left':
          // Расширяем зону влево от заголовка, включая весь путь к списку
          const leftZoneWidth = Math.max(titleRect.left - listRect.left, safeAreaSize * 2)
          safeZone = new DOMRect(
            listRect.left - safeAreaSize,
            Math.min(titleRect.top, listRect.top) - safeAreaSize,
            leftZoneWidth + titleRect.width + safeAreaSize,
            Math.max(titleRect.height, listRect.height) + safeAreaSize * 2
          )
          break
        default:
          return false
      }

      // Проверяем, находится ли мышь в безопасной зоне
      return isPointInRect(currentX, currentY, safeZone)
    },
    [direction, safeAreaEnabled, safeAreaSize]
  )

  // Отслеживание движения мыши для безопасной зоны
  // Используем useCallback чтобы функция не пересоздавалась каждый рендер
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!safeAreaEnabled || trigger !== 'hover') return

      const currentTime = Date.now()
      const newPoint = {x: e.clientX, y: e.clientY, time: currentTime}

      // Обновляем рефы вместо состояния
      lastMousePosRef.current = {x: e.clientX, y: e.clientY}

      // Фильтруем старые точки и добавляем новую
      const filtered = mouseTrajectoryRef.current.filter((point) => currentTime - point.time < 200)
      mouseTrajectoryRef.current = [...filtered, newPoint].slice(-5)
    },
    [safeAreaEnabled, trigger]
  )

  // Обработчики для ховера
  const handleMouseEnter = () => {
    if (trigger !== 'hover') return

    // Очищаем таймер закрытия если он был
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }

    // Устанавливаем таймер открытия
    hoverTimeoutRef.current = setTimeout(() => {
      openDropList()
    }, hoverDelay)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (trigger !== 'hover' || !closeOnMouseLeave) return

    // Очищаем таймер открытия если он был
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    // Если включена безопасная зона и список открыт, проверяем траекторию мыши
    if (safeAreaEnabled && openList) {
      const isMovingTowardsList = isMouseMovingTowardsList(e.clientX, e.clientY)

      if (isMovingTowardsList) {
        // Не закрываем список, если мышь движется в его сторону
        return
      }
    }

    // Устанавливаем таймер закрытия
    leaveTimeoutRef.current = setTimeout(() => {
      closeDropList()
    }, hoverDelay)
  }

  // Обработчик клика
  const handleClick = () => {
    if (trigger === 'click') {
      toggleList()
    }
  }

  const dropdownRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [listPosition, setListPosition] = useState({top: 0, left: 0})
  const [isVisible, setIsVisible] = useState(true)

  // Добавляем обработчик движения мыши для всего документа
  useEffect(() => {
    if (safeAreaEnabled && trigger === 'hover' && openList) {
      document.addEventListener('mousemove', handleMouseMove)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [safeAreaEnabled, trigger, openList, handleMouseMove])

  // Управление видимостью при скролле для fixed позиционирования
  useEffect(() => {
    if (!positionIsAbsolute && openList) {
      const checkVisibility = () => {
        if (dropdownRef.current) {
          const rect = dropdownRef.current.getBoundingClientRect()
          // Если родительский контейнер вышел за пределы экрана, скрываем выпадающий список
          if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
            setIsVisible(false)
          } else {
            setIsVisible(true)
            updateListPosition()
          }
        }
      }

      window.addEventListener('scroll', checkVisibility)
      return () => {
        window.removeEventListener('scroll', checkVisibility)
      }
    }
  }, [positionIsAbsolute, openList])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Закрываем список при клике вне его
        if (trigger === 'click' || (trigger === 'hover' && !closeOnMouseLeave)) {
          if (isOpen !== undefined) {
            onOpenChange?.(false)
          } else {
            setInternalOpenState(false)
          }
        }
      }
    }

    if (openList) {
      document.addEventListener('mousedown', handleClickOutside)
      if (!positionIsAbsolute) {
        updateListPosition()
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openList, positionIsAbsolute, isOpen, onOpenChange, trigger, closeOnMouseLeave])

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current)
      }
    }
  }, [])

  // Calculate position when dropdown opens
  const updateListPosition = () => {
    if (!titleRef.current) return

    const rect = titleRef.current.getBoundingClientRect()
    const gapSize = parseInt(gap, 10) || 0
    let top = 0
    let left = 0

    switch (direction) {
      case 'bottom':
        top = rect.bottom + gapSize
        left = rect.left
        break
      case 'top':
        top = rect.top - gapSize
        left = rect.left
        break
      case 'left':
        top = rect.top
        left = rect.left - gapSize
        break
      case 'right':
        top = rect.top
        left = rect.right + gapSize
        break
      default:
        top = rect.bottom + gapSize
        left = rect.left
    }

    setListPosition({top, left})
  }

  // Функция для определения, является ли элемент строкой или компонентом
  const renderItem = (item: DropListItem) => {
    if (typeof item === 'string') {
      return item
    } else {
      return item
    }
  }

  // Определяем дополнительные стили для позиционирования, если используется fixed
  const fixedPositionStyle: React.CSSProperties = !positionIsAbsolute
    ? {
        position: 'fixed',
        top: `${listPosition.top}px`,
        left: `${listPosition.left}px`,
        maxWidth: '300px',
        width: 'fit-content',
        zIndex: 1000,
        display: isVisible ? 'block' : 'none'
      }
    : {}

  return (
    <div
      ref={dropdownRef}
      className={cn(styles.list_box, extraClass)}
      style={extraStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={titleRef} onClick={handleClick} className={styles.list__title_box}>
        {typeof title === 'string' ? <span>{title}</span> : title}
        <ArrowIcon
          color={color}
          width={width}
          height={height}
          direction={getArrowDirection(direction, openList)}
          className={cn(styles.arrow, styles[`arrow_${direction}`], {[styles.open]: openList}, arrowClassName)}
          style={style}
          isActive={openList}
        />
      </div>

      {openList && (
        <ul
          ref={listRef}
          className={cn(extraListClass, styles.items__list, styles[`direction_${direction}`], styles[`gap_${gap}`])}
          style={fixedPositionStyle}
          onMouseEnter={trigger === 'hover' ? handleMouseEnter : undefined}
          onMouseLeave={trigger === 'hover' ? handleMouseLeave : undefined}
        >
          {items.map((item, i) => {
            return (
              <li key={i} className={styles.list__element}>
                {renderItem(item)}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const getArrowDirection = (
  listDirection: IDropListProps['direction'],
  isOpen: boolean
): ArrowIconProps['direction'] => {
  const closedDirections = {
    bottom: 'down',
    top: 'up',
    left: 'left',
    right: 'right'
  } as const

  const openedDirections = {
    bottom: 'up',
    top: 'down',
    left: 'right',
    right: 'left'
  } as const

  const direction = listDirection || 'bottom'

  if (!isOpen) {
    return closedDirections[direction as keyof typeof closedDirections]
  }

  return openedDirections[direction as keyof typeof openedDirections]
}

export default DropList
