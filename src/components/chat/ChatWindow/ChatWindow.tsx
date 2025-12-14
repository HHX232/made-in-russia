'use client'

import {useEffect, useRef, useState} from 'react'
import {useAppDispatch, useAppSelector} from '@/hooks/redux'
import {chatService} from '@/services/chat/chat.service'
import {webSocketClient} from '@/lib/websocket-client'
import {
  setMessages,
  addMessage,
  markChatAsRead,
  setUserTyping,
  removeUserTyping,
  markMessageAsRead
} from '@/store/slices/chatSlice'
import {ChatHeader} from '../ChatHeader/ChatHeader'
import {MessageList} from '../MessageList/MessageList'
import {MessageInput} from '../MessageInput/MessageInput'
import {TypingIndicator} from '../TypingIndicator/TypingIndicator'
import type {StompSubscription} from '@stomp/stompjs'
import styles from './ChatWindow.module.scss'

export const ChatWindow: React.FC = () => {
  const dispatch = useAppDispatch()
  const activeChat = useAppSelector((state) => state.chat.activeChat)
  const currentUserId = useAppSelector((state) => state.user.user?.id)
  const messages = useAppSelector((state) => (activeChat ? state.chat.messages[activeChat.id] || [] : []))
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeChat) return

    loadMessages()

    // Ждем подключения WebSocket перед подпиской
    let retryTimeout: NodeJS.Timeout
    let readStatusSubscription: StompSubscription | null = null

    const subscribeToChat = () => {
      if (!webSocketClient.client || !webSocketClient.client.connected) {
        // Если WebSocket еще не подключен, ждем 500ms и пробуем снова
        retryTimeout = setTimeout(subscribeToChat, 500)
        return
      }

      console.log(`Subscribing to chat ${activeChat.id}`)

      // Подписываемся на сообщения через WebSocket
      webSocketClient.subscribeToChat(activeChat.id, (message) => {
        console.log('Received message via WebSocket:', message)
        dispatch(addMessage(message))
        scrollToBottom()

        if (message.id && currentUserId && message.senderId !== currentUserId) {
          chatService.markAsRead(message.id).catch((err) => {
            console.error('Failed to mark message as read:', err)
          })
        }
      })

      webSocketClient.subscribeToTyping(activeChat.id, (data) => {
        if (data.chatId && data.chatId !== activeChat.id) {
          return
        }

        if (currentUserId && String(data.userId) === String(currentUserId)) {
          console.log('Ignoring own typing indicator')
          return
        }

        console.log('Received typing indicator from user:', data.userId, data.userName, 'for chat:', data.chatId)

        dispatch(
          setUserTyping({
            chatId: activeChat.id,
            userId: data.userId,
            userName: data.userName || 'Пользователь'
          })
        )

        // Автоматически убираем индикатор через 3 секунды
        setTimeout(() => {
          dispatch(removeUserTyping({chatId: activeChat.id, userId: data.userId}))
        }, 3000)
      })

      // Подписываемся на общий топик для событий прочитанности в этом чате
      // Это позволит получать уведомления о прочтении любых сообщений
      readStatusSubscription = webSocketClient.client!.subscribe(
        `/topic/chat/${activeChat.id}/read`,
        (statusMessage) => {
          const data = JSON.parse(statusMessage.body)
          console.log('Message read status update:', data)

          // Обновляем статус сообщения
          if (data.messageId) {
            dispatch(
              markMessageAsRead({
                messageId: data.messageId,
                chatId: activeChat.id
              })
            )
          }
        }
      )
    }

    subscribeToChat()

    return () => {
      clearTimeout(retryTimeout)
      if (activeChat) {
        console.log(`Unsubscribing from chat ${activeChat.id}`)
        webSocketClient.unsubscribeFromChat(activeChat.id)
        webSocketClient.unsubscribeFromTyping(activeChat.id)
        readStatusSubscription?.unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?.id])

  // Отдельный useEffect для пометки сообщений как прочитанных
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!currentUserId || !activeChat) return

      // Фильтруем только чужие непрочитанные сообщения
      const unreadMessages = messages.filter((msg) => !msg.isRead && msg.senderId !== currentUserId)

      if (unreadMessages.length === 0) return

      console.log(`Marking ${unreadMessages.length} messages as read in chat ${activeChat.id}`)

      for (const msg of unreadMessages) {
        try {
          await chatService.markAsRead(msg.id)
          // Обновляем локальное состояние
          dispatch(markMessageAsRead({messageId: msg.id, chatId: activeChat.id}))
        } catch (err) {
          console.error('Failed to mark message as read:', err)
        }
      }
    }

    // Помечаем сообщения как прочитанные при загрузке или обновлении
    if (messages.length > 0) {
      markMessagesAsRead()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, currentUserId, activeChat?.id])

  const loadMessages = async () => {
    if (!activeChat) return

    setIsLoading(true)
    try {
      const response = await chatService.getChatMessages(activeChat.id)
      dispatch(setMessages({chatId: activeChat.id, messages: response.messages.reverse()}))
      // Помечаем чат как прочитанный только после успешной загрузки сообщений
      dispatch(markChatAsRead(activeChat.id))
      scrollToBottom()
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }

  if (!activeChat) {
    return <div className={styles.noChat}>Выберите чат</div>
  }

  return (
    <div className={styles.chatWindow}>
      <ChatHeader chat={activeChat} />

      <div className={styles.messagesContainer}>
        {isLoading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : (
          <>
            <MessageList messages={messages} />
            <TypingIndicator chatId={activeChat.id} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput chatId={activeChat.id} />
    </div>
  )
}
