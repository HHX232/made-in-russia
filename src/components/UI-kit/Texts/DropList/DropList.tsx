'use client'
import {FC, useState, useRef, useEffect, ReactNode} from 'react'
import Image from 'next/image'
import styles from './DropList.module.scss'
import cn from 'clsx'
const arrow = '/arrow-dark.svg'
// Обновленный интерфейс для поддержки строк и компонентов
type DropListItem = string | ReactNode

interface IDropListProps {
  title: string | ReactNode
  items: DropListItem[]
  direction?: 'left' | 'right' | 'bottom' | 'top'
  gap?: '0' | '5' | '10' | '15' | '20' | '25' | '30' | '35' | '40' | '45' | '50'
  extraClass?: string
  extraStyle?: React.CSSProperties
  extraListClass?: string
  positionIsAbsolute?: boolean
}

const DropList: FC<IDropListProps> = ({
  title = 'title',
  items = ['Hello1', 'Hello2'],
  direction = 'bottom',
  gap = '10',
  extraClass,
  extraStyle,
  extraListClass,
  positionIsAbsolute = true
}) => {
  const [openList, setListOpen] = useState(false)
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
        setListOpen(false)
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
  }, [openList, positionIsAbsolute])

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
      <div
        ref={titleRef}
        onClick={() => {
          setListOpen(!openList)
        }}
        className={styles.list__title_box}
      >
        {typeof title === 'string' ? <span>{title}</span> : title}
        <Image
          src={arrow}
          alt='arrow'
          width={12}
          height={7}
          className={cn(styles.arrow, styles[`arrow_${direction}`], {[styles.open]: openList})}
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

export default DropList
