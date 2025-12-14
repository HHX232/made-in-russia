import {Client, IMessage} from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import {getAccessToken} from '@/services/auth/auth.helper'
import {ChatMessage} from '@/types/chat.types'

interface WebSocketSubscription {
  unsubscribe: () => void
}

interface TypingData {
  userId: number
  userName: string
  chatId: number
  isTyping: boolean
}

interface NotificationData {
  type: string
  messageId?: number
  chatId?: number
  content?: string
}

class WebSocketClient {
  public client: Client | null = null
  private subscriptions: Map<string, WebSocketSubscription> = new Map()
  private typingCallbacks: Map<number, (data: TypingData) => void> = new Map()

  connect(onConnect?: () => void) {
    const token = getAccessToken()

    if (!token) {
      console.error('[WebSocket] No access token available, cannot connect')
      return
    }

    console.log('[WebSocket] Attempting to connect with token:', token.substring(0, 20) + '...')

    this.client = new Client({
      webSocketFactory: () => {
        const url = `${process.env.NEXT_PUBLIC_API_URL_SECOND}/ws/chat`
        console.log('[WebSocket] Creating SockJS connection to:', url)
        return new SockJS(url)
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('[WebSocket Debug]', str)
      },
      onConnect: (frame) => {
        console.log('[WebSocket] ✅ Connected successfully!', frame)
        onConnect?.()
      },
      onStompError: (frame) => {
        console.error('[WebSocket] ❌ STOMP Error:', frame)
      },
      onWebSocketError: (event) => {
        console.error('[WebSocket] ❌ WebSocket Error:', event)
      },
      onWebSocketClose: (event) => {
        console.warn('[WebSocket] Connection closed:', event)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    })

    this.client.activate()
    console.log('[WebSocket] Client activation initiated')
  }

  disconnect() {
    this.subscriptions.clear()
    this.client?.deactivate()
  }

  subscribeToChat(chatId: number, callback: (message: ChatMessage) => void) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected')
      return
    }

    const destination = `/topic/chat/${chatId}`

    if (this.subscriptions.has(destination)) {
      return
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body)
        callback(data)
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error, message.body)
      }
    })

    this.subscriptions.set(destination, subscription)
  }

  unsubscribeFromChat(chatId: number) {
    const destination = `/topic/chat/${chatId}`
    const subscription = this.subscriptions.get(destination)

    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(destination)
    }
  }

  sendTypingIndicator(chatId: number) {
    if (!this.client || !this.client.connected) {
      return
    }

    this.client.publish({
      destination: `/app/chat/${chatId}/typing`,
      body: JSON.stringify({})
    })
  }

  subscribeToTyping(chatId: number, callback: (data: TypingData) => void) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected')
      return
    }

    // Подписка на персональный канал typing (используется convertAndSendToUser на бэкенде)
    const destination = '/user/queue/typing'

    if (this.subscriptions.has(destination)) {
      // Уже подписаны глобально, но нужно зарегистрировать callback для этого чата
      if (!this.typingCallbacks.has(chatId)) {
        // Сохраняем callback для фильтрации по chatId
        this.typingCallbacks.set(chatId, callback)
      }
      return
    }

    // Сохраняем callback для первого чата
    this.typingCallbacks.set(chatId, callback)

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body)
        console.log('[WebSocket] Received typing event:', data)
        // Вызываем callback для соответствующего чата (если он зарегистрирован)
        // Бэкенд отправляет chatId, поэтому вызываем все зарегистрированные callbacks
        this.typingCallbacks.forEach((cb) => {
          cb(data)
        })
      } catch (error) {
        console.error('[WebSocket] Error parsing typing message:', error, message.body)
      }
    })

    this.subscriptions.set(destination, subscription)
  }

  unsubscribeFromTyping(chatId: number) {
    // Удаляем callback для этого чата
    this.typingCallbacks.delete(chatId)

    // Проверяем, есть ли ещё зарегистрированные callbacks
    if (this.typingCallbacks.size === 0) {
      const destination = '/user/queue/typing'
      const subscription = this.subscriptions.get(destination)

      if (subscription) {
        subscription.unsubscribe()
        this.subscriptions.delete(destination)
      }
    }
  }

  subscribeToNotifications(callback: (notification: NotificationData) => void) {
    if (!this.client || !this.client.connected) {
      return
    }

    const destination = '/user/queue/notifications'

    if (this.subscriptions.has(destination)) {
      return
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body)
        callback(data)
      } catch (error) {
        console.error('[WebSocket] Error parsing notification:', error, message.body)
      }
    })

    this.subscriptions.set(destination, subscription)
  }
}

export const webSocketClient = new WebSocketClient()
