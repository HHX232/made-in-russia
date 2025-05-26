// Accordion.tsx
'use client'

import React, {useState} from 'react'
import styles from './Accordions.module.scss'

interface AccordionItem {
  title: string
  value: string
  isDefaultActive?: boolean
}

interface AccordionProps {
  items: AccordionItem[]
  multiActive?: boolean
}

const Accordion: React.FC<AccordionProps> = ({items, multiActive = false}) => {
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
