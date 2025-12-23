'use client'

import {useState, useRef, useCallback} from 'react'
import {useDispatch} from 'react-redux'
import {chatService} from '@/services/chat/chat.service'
import {webSocketClient} from '@/lib/websocket-client'
import {addMessage} from '@/store/slices/chatSlice'
import {toast} from 'sonner'
import styles from './MessageInput.module.scss'

interface MessageInputProps {
  chatId: number
  onMessageSent?: () => void
}

export const MessageInput: React.FC<MessageInputProps> = ({chatId, onMessageSent}) => {
  const dispatch = useDispatch()
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && attachments.length === 0) return
    if (isSending) return

    setIsSending(true)
    try {
      // Отправляем сообщение и сразу добавляем в стор (оптимистичное обновление)
      const sentMessage = await chatService.sendMessage({chatId, content, attachments})
      // Добавляем сообщение в стор сразу после ответа от сервера
      // Это гарантирует отображение даже если WebSocket не работает
      dispatch(addMessage(sentMessage))
      setContent('')
      setAttachments([])
      // Прокручиваем вниз после отправки сообщения
      setTimeout(() => onMessageSent?.(), 50)
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Ошибка при отправке сообщения', {
        description: 'Попробуйте еще раз',
        style: {background: '#AC2525'}
      })
    } finally {
      setIsSending(false)
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

        <input
          type='text'
          className={styles.textInput}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyUp={handleTyping}
          placeholder='Введите сообщение...'
          disabled={isSending}
        />

        <button type='submit' className={styles.sendButton} disabled={isSending}>
          ➤
        </button>
      </div>
    </form>
  )
}
