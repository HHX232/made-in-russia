// Accordion.tsx
'use client'

import React, {useState} from 'react'
import styles from './Accordions.module.scss'

interface AccordionItem {
  title: string
  value: string
  isDefaultActive?: boolean
  id: string
}

interface AccordionProps {
  items: AccordionItem[]
  multiActive?: boolean
  needDeleteButton?: boolean
  onDelete?: (item: AccordionItem) => void
  extraClass?: string
  onUpdate?: (item: AccordionItem) => void
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  multiActive = false,
  needDeleteButton = false,
  onDelete,
  extraClass,
  onUpdate
}) => {
  const [activeItems, setActiveItems] = useState<number[]>(() => {
    return items.map((item, index) => (item.isDefaultActive ? index : -1)).filter((index) => index !== -1)
  })

  const toggleItem = (index: number) => {
    if (multiActive) {
      setActiveItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
    } else {
      setActiveItems((prev) => (prev.includes(index) ? [] : [index]))
    }
  }

  const isActive = (index: number) => activeItems.includes(index)

  return (
    <div className={`${styles.accordion} ${extraClass}`}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`${styles.accordion__item} ${isActive(index) ? styles.accordion__item_open : ''}`}
        >
          <div className={styles.accordion__header} onClick={() => toggleItem(index)}>
            <h2 className={styles.accordion__title}>{item.title}</h2>
            <div className={styles.accordion__controls}>
              {needDeleteButton && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(item)
                  }}
                  className={styles.accordion__delete_button}
                >
                  <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332'
                      stroke='#AC2525'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M7.08301 4.14167L7.26634 3.05C7.39967 2.25833 7.49967 1.66667 8.90801 1.66667H11.0913C12.4997 1.66667 12.608 2.29167 12.733 3.05833L12.9163 4.14167'
                      stroke='#AC2525'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M15.708 7.61667L15.1663 16.0083C15.0747 17.3167 14.9997 18.3333 12.6747 18.3333H7.32467C4.99967 18.3333 4.92467 17.3167 4.83301 16.0083L4.29134 7.61667'
                      stroke='#AC2525'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M8.60986 13.75H11.3849'
                      stroke='#AC2525'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M7.91699 10.4167H12.0837'
                      stroke='#AC2525'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              )}
              {needDeleteButton && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdate?.(item)
                  }}
                  className={styles.accordion__delete_button}
                >
                  <svg width='22' height='22' viewBox='0 0 22 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M12.1554 3.29963L4.62956 11.2655C4.34539 11.568 4.07039 12.1638 4.01539 12.5763L3.67623 15.5463C3.55706 16.6188 4.32706 17.3521 5.39039 17.1688L8.34206 16.6646C8.75456 16.5913 9.33206 16.2888 9.61623 15.9771L17.1421 8.0113C18.4437 6.6363 19.0304 5.0688 17.0046 3.15296C14.9879 1.25546 13.4571 1.92463 12.1554 3.29963Z'
                      stroke='#2F2F2F'
                      strokeWidth='1.5'
                      strokeMiterlimit='10'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M10.8984 4.62891C11.2926 7.15891 13.3459 9.09307 15.8943 9.34974'
                      stroke='#2F2F2F'
                      strokeWidth='1.5'
                      strokeMiterlimit='10'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M2.75 20.167H19.25'
                      stroke='#2F2F2F'
                      strokeWidth='1.5'
                      strokeMiterlimit='10'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              )}
              <span className={styles.accordion__toggle}></span>
            </div>
          </div>
          <div className={styles.accordion__content}>
            <p>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Accordion
