'use client'
import React, {FC, useState, useRef, useEffect, ReactNode, CSSProperties, useCallback} from 'react'

import styles from './DropList.module.scss'
import cn from 'clsx'

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
  arrowClassName?: string
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  trigger?: 'click' | 'hover'
  hoverDelay?: number
  closeOnMouseLeave?: boolean
  safeAreaEnabled?: boolean
  safeAreaSize?: number
  dropListId?: string // Новый проп для идентификации списка
  parentDropListId?: string // ID родительского списка для вложенных
  onChildHover?: (childId: string) => void // Коллбэк для уведомления родителя о ховере на дочерний элемент
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
  isOpen,
  onOpenChange,
  trigger = 'click',
  hoverDelay = 200,
  closeOnMouseLeave = true,
  safeAreaEnabled = true,
  safeAreaSize = 10,
  dropListId,
  parentDropListId,
  onChildHover
}) => {
  const [internalOpenState, setInternalOpenState] = useState(false)
  const openList = isOpen !== undefined ? isOpen : internalOpenState

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastMousePosRef = useRef({x: 0, y: 0})
  const mouseTrajectoryRef = useRef<Array<{x: number; y: number; time: number}>>([])

  // Реф для отслеживания активного дочернего элемента
  const activeChildRef = useRef<string | null>(null)

  // Генерируем уникальный ID если не предоставлен
  const listIdRef = useRef(dropListId || `droplist-${Math.random().toString(36).substr(2, 9)}`)
  const listId = listIdRef.current

  const toggleList = () => {
    if (isOpen !== undefined) {
      onOpenChange?.(!isOpen)
    } else {
      setInternalOpenState(!internalOpenState)
    }
  }

  const openDropList = () => {
    if (isOpen !== undefined) {
      onOpenChange?.(true)
    } else {
      setInternalOpenState(true)
    }
  }

  const closeDropList = () => {
    if (isOpen !== undefined) {
      onOpenChange?.(false)
    } else {
      setInternalOpenState(false)
    }
    // Сбрасываем активный дочерний элемент при закрытии
    activeChildRef.current = null
  }

  const isPointInRect = (
    x: number,
    y: number,
    rect: DOMRect | {left: number; top: number; right: number; bottom: number}
  ) => {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }

  const isMouseMovingTowardsList = useCallback(
    (currentX: number, currentY: number) => {
      if (!safeAreaEnabled || !listRef.current || !titleRef.current) return false

      const titleRect = titleRef.current.getBoundingClientRect()
      const listRect = listRef.current.getBoundingClientRect()

      if (isPointInRect(currentX, currentY, listRect) || isPointInRect(currentX, currentY, titleRect)) {
        return true
      }

      let safeZone: DOMRect

      switch (direction) {
        case 'bottom':
          safeZone = new DOMRect(
            Math.min(titleRect.left, listRect.left) - safeAreaSize,
            titleRect.bottom,
            Math.max(titleRect.width, listRect.width) + safeAreaSize * 2,
            listRect.top - titleRect.bottom + listRect.height + safeAreaSize
          )
          break
        case 'top':
          safeZone = new DOMRect(
            Math.min(titleRect.left, listRect.left) - safeAreaSize,
            listRect.top - safeAreaSize,
            Math.max(titleRect.width, listRect.width) + safeAreaSize * 2,
            titleRect.top - listRect.top + titleRect.height + safeAreaSize
          )
          break
        case 'right':
          const rightZoneWidth = Math.max(listRect.right - titleRect.right, safeAreaSize * 2)
          safeZone = new DOMRect(
            titleRect.right,
            Math.min(titleRect.top, listRect.top) - safeAreaSize,
            rightZoneWidth + listRect.width,
            Math.max(titleRect.height, listRect.height) + safeAreaSize * 2
          )
          break
        case 'left':
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

      return isPointInRect(currentX, currentY, safeZone)
    },
    [direction, safeAreaEnabled, safeAreaSize]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!safeAreaEnabled || trigger !== 'hover') return

      const currentTime = Date.now()
      const newPoint = {x: e.clientX, y: e.clientY, time: currentTime}

      lastMousePosRef.current = {x: e.clientX, y: e.clientY}

      const filtered = mouseTrajectoryRef.current.filter((point) => currentTime - point.time < 200)
      mouseTrajectoryRef.current = [...filtered, newPoint].slice(-5)
    },
    [safeAreaEnabled, trigger]
  )

  // Обработчик для дочерних элементов, которые сообщают о ховере на них
  const handleChildHover = useCallback((childId: string) => {
    activeChildRef.current = childId
  }, [])

  const handleMouseEnter = () => {
    if (trigger !== 'hover') return

    // Уведомляем родителя, что на нас навели
    if (parentDropListId && onChildHover) {
      onChildHover(listId)
    }

    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }

    hoverTimeoutRef.current = setTimeout(() => {
      openDropList()
    }, hoverDelay)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (trigger !== 'hover' || !closeOnMouseLeave) return

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    // Проверяем, куда ушла мышь
    const relatedTarget = e.relatedTarget as HTMLElement

    if (relatedTarget) {
      try {
        // Проверяем, что relatedTarget является валидным Node
        if (!(relatedTarget instanceof Node)) {
          // Если не Node, закрываем с задержкой
          leaveTimeoutRef.current = setTimeout(() => {
            closeDropList()
          }, hoverDelay)
          return
        }

        // Проверяем, не ушла ли мышь на элемент текущего списка
        const isOwnElement = dropdownRef.current?.contains(relatedTarget)

        // Проверяем data-атрибуты для определения связанности элементов
        const targetDropListId = relatedTarget.closest('[data-droplist-id]')?.getAttribute('data-droplist-id')
        const targetParentId = relatedTarget
          .closest('[data-parent-droplist-id]')
          ?.getAttribute('data-parent-droplist-id')

        // Если мышь ушла на собственный элемент или на активный дочерний список
        if (isOwnElement || (targetParentId === listId && targetDropListId === activeChildRef.current)) {
          return
        }

        // Если мышь ушла на элемент того же уровня (соседний элемент в родительском списке)
        const isSiblingElement = targetParentId === parentDropListId && targetDropListId !== listId

        if (isSiblingElement) {
          // Закрываем немедленно без задержки
          closeDropList()
          return
        }
      } catch (error) {
        // В случае любой ошибки при работе с DOM, закрываем с задержкой
        console.warn('Error in handleMouseLeave:', error)
        leaveTimeoutRef.current = setTimeout(() => {
          closeDropList()
        }, hoverDelay)
        return
      }
    }

    // Стандартная логика с безопасной зоной
    if (safeAreaEnabled && openList) {
      const isMovingTowardsList = isMouseMovingTowardsList(e.clientX, e.clientY)

      if (isMovingTowardsList) {
        return
      }
    }

    leaveTimeoutRef.current = setTimeout(() => {
      closeDropList()
    }, hoverDelay)
  }

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

  useEffect(() => {
    if (safeAreaEnabled && trigger === 'hover' && openList) {
      document.addEventListener('mousemove', handleMouseMove)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [safeAreaEnabled, trigger, openList, handleMouseMove])

  useEffect(() => {
    if (!positionIsAbsolute && openList) {
      const checkVisibility = () => {
        if (typeof window === 'undefined' || !dropdownRef.current) return

        const rect = dropdownRef.current.getBoundingClientRect()
        if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
          updateListPosition()
        }
      }

      // Проверяем доступность window перед добавлением слушателя
      if (typeof window !== 'undefined') {
        window.addEventListener('scroll', checkVisibility)

        // Вызываем сразу для первоначальной проверки
        checkVisibility()

        return () => {
          window.removeEventListener('scroll', checkVisibility)
        }
      }
    }
  }, [positionIsAbsolute, openList])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const renderItem = (item: DropListItem, index: number) => {
    if (React.isValidElement(item) && item.type === DropList) {
      const typedItem = item as React.ReactElement<IDropListProps>

      return React.cloneElement(typedItem, {
        parentDropListId: listId,
        onChildHover: handleChildHover,
        dropListId: typedItem.props.dropListId || `${listId}-child-${index}`
      } as Partial<IDropListProps>)
    }

    return item
  }

  const fixedPositionStyle: React.CSSProperties = !positionIsAbsolute
    ? {
        position: 'fixed',
        top: `${listPosition.top}px`,
        left: `${listPosition.left}px`,
        maxWidth: '300px',
        width: 'fit-content',
        zIndex: 1000000,
        display: isVisible ? 'block' : 'none'
      }
    : {}

  // Стили для невидимого моста между заголовком и списком
  const getBridgeStyle = (): React.CSSProperties | null => {
    if (!openList || trigger !== 'hover' || !titleRef.current || !listRef.current) return null

    const titleRect = titleRef.current.getBoundingClientRect()
    const gapSize = parseInt(gap, 10) || 0

    // Создаем мост только если есть gap
    if (gapSize === 0) return null

    let bridgeStyle: React.CSSProperties = {
      position: positionIsAbsolute ? 'absolute' : 'fixed',
      pointerEvents: 'auto',
      zIndex: 99999999999999
      // Для отладки можно раскомментировать:
      // backgroundColor: 'rgba(255, 0, 0, 0.2)'
    }

    switch (direction) {
      case 'bottom':
        bridgeStyle = {
          ...bridgeStyle,
          top: positionIsAbsolute ? '100%' : `${titleRect.bottom}px`,
          left: positionIsAbsolute ? 0 : `${titleRect.left}px`,
          width: titleRect.width,
          height: gapSize
        }
        break
      case 'top':
        bridgeStyle = {
          ...bridgeStyle,
          bottom: positionIsAbsolute ? '100%' : undefined,
          top: positionIsAbsolute ? undefined : `${titleRect.top - gapSize}px`,
          left: positionIsAbsolute ? 0 : `${titleRect.left}px`,
          width: titleRect.width,
          height: gapSize
        }
        break
      case 'right':
        bridgeStyle = {
          ...bridgeStyle,
          left: positionIsAbsolute ? '100%' : `${titleRect.right}px`,
          top: positionIsAbsolute ? 0 : `${titleRect.top}px`,
          width: gapSize,
          height: titleRect.height
        }
        break
      case 'left':
        bridgeStyle = {
          ...bridgeStyle,
          right: positionIsAbsolute ? '100%' : undefined,
          left: positionIsAbsolute ? undefined : `${titleRect.left - gapSize}px`,
          top: positionIsAbsolute ? 0 : `${titleRect.top}px`,
          width: gapSize,
          height: titleRect.height
        }
        break
    }

    return bridgeStyle
  }

  const bridgeStyle = getBridgeStyle()

  return (
    <div
      ref={dropdownRef}
      className={cn(styles.list_box, extraClass)}
      style={extraStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-droplist-id={listId}
      data-parent-droplist-id={parentDropListId}
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

      {/* Невидимый мост между заголовком и списком */}
      {openList && trigger === 'hover' && bridgeStyle && (
        <div
          style={bridgeStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          data-droplist-id={listId}
          data-parent-droplist-id={parentDropListId}
        />
      )}

      {openList && (
        <ul
          ref={listRef}
          className={cn(extraListClass, styles.items__list, styles[`direction_${direction}`], styles[`gap_${gap}`])}
          style={fixedPositionStyle}
          onMouseEnter={trigger === 'hover' ? handleMouseEnter : undefined}
          onMouseLeave={trigger === 'hover' ? handleMouseLeave : undefined}
          data-droplist-id={listId}
          data-parent-droplist-id={parentDropListId}
        >
          {items.map((item, i) => {
            return (
              <li key={i} className={styles.list__element}>
                {renderItem(item, i)}
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
