'use client'

import {useEffect, useRef, useState, useCallback} from 'react'
import {useAppDispatch, useAppSelector} from '@/hooks/redux'
import {chatService} from '@/services/chat/chat.service'
import {webSocketClient} from '@/lib/websocket-client'
import {
  setMessages,
  addMessage,
  markChatAsRead,
  setUserTyping,
  removeUserTyping,
  markMessageAsRead,
  prependMessages
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
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageIdRef = useRef<number | null>(null)

  // Функция для fallback polling (когда WebSocket не работает)
  const pollForNewMessages = async (chatId: number) => {
    try {
      const response = await chatService.getChatMessages(chatId, 0, 10)
      const newMessages = response.messages.reverse()

      // Проверяем, есть ли новые сообщения
      if (newMessages.length > 0) {
        const latestMessage = newMessages[newMessages.length - 1]
        if (lastMessageIdRef.current !== latestMessage.id) {
          // Есть новые сообщения - добавляем их
          newMessages.forEach((msg) => {
            dispatch(addMessage(msg))
          })
          lastMessageIdRef.current = latestMessage.id
        }
      }
    } catch (error) {
      console.error('[Polling] Failed to fetch messages:', error)
    }
  }

  // Запуск fallback polling
  const startPolling = (chatId: number) => {
    if (pollingIntervalRef.current) return

    console.log('[Polling] Starting fallback polling for chat', chatId)
    pollingIntervalRef.current = setInterval(() => {
      // Проверяем, подключен ли WebSocket
      if (webSocketClient.isConnected()) {
        // WebSocket подключен - останавливаем polling
        console.log('[Polling] WebSocket connected, stopping polling')
        stopPolling()
        return
      }
      pollForNewMessages(chatId)
    }, 5000) // Каждые 5 секунд
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  useEffect(() => {
    if (!activeChat) return

    loadMessages()

    // Ждем подключения WebSocket перед подпиской
    let retryTimeout: NodeJS.Timeout
    let wsRetryCount = 0
    const maxWsRetries = 10
    let readStatusSubscription: StompSubscription | null = null

    const subscribeToChat = () => {
      if (!webSocketClient.client || !webSocketClient.client.connected) {
        wsRetryCount++
        if (wsRetryCount >= maxWsRetries) {
          // WebSocket не подключился - запускаем fallback polling
          console.log('[WebSocket] Max retries reached, starting fallback polling')
          startPolling(activeChat.id)
          return
        }
        // Если WebSocket еще не подключен, ждем 500ms и пробуем снова
        retryTimeout = setTimeout(subscribeToChat, 500)
        return
      }

      // WebSocket подключен - останавливаем polling если он был запущен
      stopPolling()

      console.log(`Subscribing to chat ${activeChat.id}`)

      // Подписываемся на сообщения через WebSocket
      webSocketClient.subscribeToChat(activeChat.id, (message) => {
        console.log('Received message via WebSocket:', message)
        dispatch(addMessage(message))

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
      if (webSocketClient.client?.connected) {
        readStatusSubscription = webSocketClient.client.subscribe(
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
    }

    subscribeToChat()

    return () => {
      clearTimeout(retryTimeout)
      stopPolling()
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
    setCurrentPage(0)
    try {
      const response = await chatService.getChatMessages(activeChat.id, 0, 50)
      dispatch(setMessages({chatId: activeChat.id, messages: response.messages.reverse()}))
      dispatch(markChatAsRead(activeChat.id))
      setHasMore(response.hasMore)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom()
        })
      })
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreMessages = useCallback(async () => {
    if (!activeChat || isLoadingMore || !hasMore) return

    const container = messagesContainerRef.current
    if (!container) return

    const previousScrollHeight = container.scrollHeight

    setIsLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      const response = await chatService.getChatMessages(activeChat.id, nextPage, 50)

      if (response.messages.length > 0) {
        // Добавляем старые сообщения в начало
        dispatch(prependMessages({chatId: activeChat.id, messages: response.messages.reverse()}))
        setCurrentPage(nextPage)
        setHasMore(response.hasMore)

        // Восстанавливаем позицию скролла после добавления сообщений
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight
          container.scrollTop = newScrollHeight - previousScrollHeight
        })
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to load more messages:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [activeChat, currentPage, hasMore, isLoadingMore, dispatch])

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container || isLoadingMore || !hasMore) return
    if (container.scrollTop < 50) {
      loadMoreMessages()
    }
  }, [loadMoreMessages, isLoadingMore, hasMore])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleMessagesScroll)
    return () => container.removeEventListener('scroll', handleMessagesScroll)
  }, [handleMessagesScroll])

  const scrollToBottom = () => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }

  const scrollToBottomSmooth = () => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  if (!activeChat) {
    return <div className={styles.noChat}>Выберите чат</div>
  }

  return (
    <div className={styles.chatWindow}>
      <ChatHeader chat={activeChat} />

      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        {isLoading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : (
          <>
            {isLoadingMore && <div className={styles.loadingMore}>Загрузка истории...</div>}
            <MessageList messages={messages} />
            <TypingIndicator chatId={activeChat.id} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput chatId={activeChat.id} onMessageSent={scrollToBottomSmooth} />
    </div>
  )
}
