'use client'
import {FC, useState, useRef, useEffect, ReactNode, CSSProperties} from 'react'
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
  onOpenChange // Коллбэк для оповещения родителя
}) => {
  // Используем внутреннее состояние только если внешнее не предоставлено
  const [internalOpenState, setInternalOpenState] = useState(false)

  // Определяем, какое состояние использовать
  const openList = isOpen !== undefined ? isOpen : internalOpenState

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

  const dropdownRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [listPosition, setListPosition] = useState({top: 0, left: 0})
  const [isVisible, setIsVisible] = useState(true)

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
        if (isOpen !== undefined) {
          onOpenChange?.(false)
        } else {
          setInternalOpenState(false)
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
  }, [openList, positionIsAbsolute, isOpen, onOpenChange])

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
    <div ref={dropdownRef} className={cn(styles.list_box, extraClass)} style={extraStyle}>
      <div ref={titleRef} onClick={toggleList} className={styles.list__title_box}>
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
