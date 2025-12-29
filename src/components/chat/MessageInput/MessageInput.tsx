'use client'

import {useState, useRef, useCallback} from 'react'
import {useDispatch} from 'react-redux'
import {useTranslations} from 'next-intl'
import {chatService} from '@/services/chat/chat.service'
import {webSocketClient} from '@/lib/websocket-client'
import {addMessage} from '@/store/slices/chatSlice'
import {toast} from 'sonner'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'
import styles from './MessageInput.module.scss'

interface MessageInputProps {
  chatId: number
  onMessageSent?: () => void
}

export const MessageInput: React.FC<MessageInputProps> = ({chatId, onMessageSent}) => {
  const t = useTranslations('chat')
  const dispatch = useDispatch()
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const sendMessage = async () => {
    if (!content.trim() && attachments.length === 0) return
    if (isSending) return

    setIsSending(true)
    try {
      const sentMessage = await chatService.sendMessage({chatId, content, attachments})
      dispatch(addMessage(sentMessage))
      setContent('')
      setAttachments([])
      setTimeout(() => onMessageSent?.(), 50)
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error(t('sendError'), {
        description: t('tryAgain'),
        style: {background: '#AC2525'}
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      return
    }

    console.log('Sending typing indicator for chat:', chatId)
    webSocketClient.sendTypingIndicator(chatId)

    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null
    }, 1000)
  }, [chatId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  return (
    <form className={styles.messageInput} onSubmit={handleSubmit}>
      {attachments.length > 0 && (
        <div className={styles.attachments}>
          {attachments.map((file, index) => (
            <div key={index} className={styles.attachment}>
              {file.name}
              <button type='button' onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.inputRow}>
        <button type='button' className={styles.attachButton} onClick={() => fileInputRef.current?.click()}>
          📎
        </button>

        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          hidden
          accept='image/*,.pdf,.doc,.docx'
        />

        <TextAreaUI
          extraClass={styles.textAreaWrapper}
          placeholder={t('typeMessage')}
          currentValue={content}
          onSetValue={setContent}
          onKeyDown={handleKeyDown}
          onKeyUp={handleTyping}
          disabled={isSending}
          autoResize
          minRows={1}
          maxRows={6}
          minHeight={44}
        />

        <button type='submit' className={styles.sendButton} disabled={isSending}>
          ➤
        </button>
      </div>
    </form>
  )
}
