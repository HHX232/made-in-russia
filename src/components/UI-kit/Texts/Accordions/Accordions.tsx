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
}

const Accordion: React.FC<AccordionProps> = ({items, multiActive = false, needDeleteButton = false, onDelete}) => {
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
    <div className={styles.accordion}>
      {items.map((item, index) => (
        <div key={index} className={styles.accordionItem}>
          <div
            className={`${styles.accordionHeader} ${isActive(index) ? styles.active : ''}`}
            onClick={() => toggleItem(index)}
          >
            <span className={styles.title}>{item.title}</span>
            <span className={styles.icon}>{isActive(index) ? '-' : '+'}</span>
            {needDeleteButton && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete?.(item)
                  // setActiveItems(activeItems.filter((i) => i !== index))
                }}
                className={styles.delete__faq__button}
              >
                -
              </button>
            )}
          </div>
          <div className={`${styles.accordionContent} ${isActive(index) ? styles.open : styles.closed}`}>
            <div className={styles.contentInner}>{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Accordion
