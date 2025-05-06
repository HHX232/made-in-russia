'use client'
import {FC, useState, useRef, useEffect, ReactNode} from 'react'
import Image from 'next/image'
import arrow from '@/assets/images/arrow-dark.svg'
import styles from './DropList.module.scss'
import cn from 'clsx'

// Обновленный интерфейс для поддержки строк и компонентов
type DropListItem = string | ReactNode

interface IDropListProps {
  title: string | ReactNode
  items: DropListItem[]
  direction?: 'left' | 'right' | 'bottom' | 'top'
  gap?: '0' | '5' | '10' | '15' | '20' | '25' | '30' | '35' | '40' | '45' | '50'
  extraClass?: string
  extraStyle?: React.CSSProperties
}

const DropList: FC<IDropListProps> = ({
  title = 'title',
  items = ['Hello1', 'Hello2'],
  direction = 'bottom',
  gap = '10',
  extraClass,
  extraStyle
}) => {
  const [openList, setListOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setListOpen(false)
      }
    }

    if (openList) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openList])

  // Функция для определения, является ли элемент строкой или компонентом
  const renderItem = (item: DropListItem) => {
    if (typeof item === 'string') {
      return item
    } else {
      return item
    }
  }

  return (
    <div ref={dropdownRef} className={cn(styles.list_box, extraClass)} style={extraStyle}>
      <div
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
        <ul className={cn(styles.items__list, styles[`direction_${direction}`], styles[`gap_${gap}`])}>
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
