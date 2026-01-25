'use client'

import {useState} from 'react'
import {ChatMessage} from '@/types/chat.types'
import {chatService} from '@/services/chat/chat.service'
import styles from './MessageItem.module.scss'
import {useTranslations} from 'next-intl'
import {useLocale} from 'next-intl'
import Link from 'next/link'

interface MessageItemProps {
  message: ChatMessage
  isOwnMessage: boolean
  isAdmin?: boolean
}

export const MessageItem: React.FC<MessageItemProps> = ({message, isOwnMessage, isAdmin = false}) => {
  const t = useTranslations('chat')
  const locale = useLocale()
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(true)

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

  const handleTranslate = async () => {
    if (translatedText) {
      setShowOriginal(!showOriginal)
      return
    }

    setIsTranslating(true)
    try {
      const targetLanguage = (locale as 'en' | 'ru' | 'zh' | 'hi') || 'ru'
      const response = await chatService.translateMessage({
        text: message.content,
        targetLanguage
      })
      setTranslatedText(response.translatedText)
      setShowOriginal(false)
    } catch (error) {
      console.error('Translation error:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  if (message.isSystem) {
    return (
      <div className={styles.systemMessage}>
        <span className={styles.systemMessageText}>{translateSystemMessage(message.content)}</span>
      </div>
    )
  }

  const displayText = showOriginal ? message.content : translatedText || message.content

  const profileLink = `/data-vendor/${message.senderId}`

  return (
    <div className={`${styles.messageItem} ${isOwnMessage ? styles.own : styles.other}`}>
      {!isOwnMessage ? (
        <>
          {isAdmin ? (
            <>
              {message.senderAvatar && (
                <Link href={profileLink} className={styles.avatarLink}>
                  <img src={message.senderAvatar} alt={message.senderName} className={styles.avatar} />
                </Link>
              )}
            </>
          ) : (
            message.senderAvatar && (
              <img src={message.senderAvatar} alt={message.senderName} className={styles.avatar} />
            )
          )}
        </>
      ) : null}
      <div className={styles.messageContent}>
        {!isOwnMessage &&
          (isAdmin ? (
            <Link href={profileLink} className={styles.senderNameLink}>
              {message.senderName}
            </Link>
          ) : (
            <div className={styles.senderName}>{message.senderName}</div>
          ))}
        <div className={styles.text}>{displayText}</div>
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
          {message.content && (
            <button
              className={styles.translateButton}
              onClick={handleTranslate}
              disabled={isTranslating}
              title={translatedText ? (showOriginal ? t('showTranslation') : t('showOriginal')) : t('translate')}
            >
              {isTranslating ? (
                '...'
              ) : translatedText && !showOriginal ? (
                '↩️'
              ) : (
                <img src='/iconsNew/translate.svg' alt='translate' className={styles.translateIcon} />
              )}
            </button>
          )}
        </div>
        {translatedText && !showOriginal && <div className={styles.translationNote}>{t('translatedText')}</div>}
      </div>
    </div>
  )
}
