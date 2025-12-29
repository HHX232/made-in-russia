'use client'

import {useMemo} from 'react'
import {useAppSelector} from '@/hooks/redux'
import styles from './TypingIndicator.module.scss'

const EMPTY_ARRAY: never[] = []

interface TypingIndicatorProps {
  chatId: number
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({chatId}) => {
  const typingUsersRaw = useAppSelector((state) => state.chat.typingUsers[chatId])
  const typingUsers = useMemo(() => typingUsersRaw ?? EMPTY_ARRAY, [typingUsersRaw])

  if (typingUsers.length === 0) {
    return null
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} печатает...`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} и ${typingUsers[1].userName} печатают...`
    } else {
      return `${typingUsers[0].userName} и еще ${typingUsers.length - 1} печатают...`
    }
  }

  return (
    <div className={styles.typingIndicator}>
      <span className={styles.typingText}>{getTypingText()}</span>
      <span className={styles.dots}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </span>
    </div>
  )
}
