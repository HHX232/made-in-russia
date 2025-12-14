'use client'

import {ChatMessage} from '@/types/chat.types'
import styles from './MessageItem.module.scss'
import {useTranslations} from 'next-intl'

interface MessageItemProps {
  message: ChatMessage
  isOwnMessage: boolean
}

export const MessageItem: React.FC<MessageItemProps> = ({message, isOwnMessage}) => {
  const t = useTranslations('chat')

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
  }

  const getReadStatus = () => {
    if (!isOwnMessage) return null

    if (message.isRead) {
      return (
        <span className={styles.readStatus} title='Прочитано'>
          ✓✓
        </span>
      )
    }
    return (
      <span className={styles.sentStatus} title='Отправлено'>
        ✓
      </span>
    )
  }

  const translateSystemMessage = (content: string) => {
    const chatStartedPattern = /^Chat started for product:\s*(.+)$/
    const match = content.match(chatStartedPattern)

    if (match) {
      const productName = match[1]
      return t('chatStartedForProduct', {productName})
    }

    return content
  }

  if (message.isSystem) {
    return (
      <div className={styles.systemMessage}>
        <span className={styles.systemMessageText}>{translateSystemMessage(message.content)}</span>
      </div>
    )
  }

  return (
    <div className={`${styles.messageItem} ${isOwnMessage ? styles.own : styles.other}`}>
      {!isOwnMessage && message.senderAvatar && (
        <img src={message.senderAvatar} alt={message.senderName} className={styles.avatar} />
      )}
      <div className={styles.messageContent}>
        {!isOwnMessage && <div className={styles.senderName}>{message.senderName}</div>}
        <div className={styles.text}>{message.content}</div>
        {message.attachments && message.attachments.length > 0 && (
          <div className={styles.attachments}>
            {message.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.fileUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={styles.attachment}
              >
                📎 {attachment.fileName}
              </a>
            ))}
          </div>
        )}
        <div className={styles.messageFooter}>
          <span className={styles.time}>{formatTime(message.createdAt)}</span>
          {getReadStatus()}
        </div>
      </div>
    </div>
  )
}
