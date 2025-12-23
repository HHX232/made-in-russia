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
  private chatCallbacks: Map<number, (message: ChatMessage) => void> = new Map()
  private notificationCallback: ((notification: NotificationData) => void) | null = null
  private isConnecting = false
  private connectionAttempts = 0
  private maxReconnectAttempts = 10
  private onConnectCallback?: () => void

  connect(onConnect?: () => void) {
    if (this.isConnecting) {
      console.log('[WebSocket] Already connecting, skipping...')
      return
    }

    const token = getAccessToken()

    if (!token) {
      console.error('[WebSocket] No access token available, cannot connect')
      return
    }

    this.isConnecting = true
    this.onConnectCallback = onConnect

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
        if (str.includes('CONNECTED') || str.includes('ERROR') || str.includes('DISCONNECT')) {
          console.log('[WebSocket Debug]', str)
        }
      },
      onConnect: (frame) => {
        console.log('[WebSocket] ✅ Connected successfully!', frame)
        this.isConnecting = false
        this.connectionAttempts = 0
        // Восстанавливаем подписки после реконнекта
        this.restoreSubscriptions()
        this.onConnectCallback?.()
      },
      onStompError: (frame) => {
        console.error('[WebSocket] ❌ STOMP Error:', frame)
        this.isConnecting = false
      },
      onWebSocketError: (event) => {
        console.error('[WebSocket] ❌ WebSocket Error:', event)
        this.isConnecting = false
      },
      onWebSocketClose: (event) => {
        console.warn('[WebSocket] Connection closed:', event)
        this.isConnecting = false
        this.connectionAttempts++

        if (this.connectionAttempts <= this.maxReconnectAttempts) {
          console.log(
            `[WebSocket] Will attempt to reconnect (attempt ${this.connectionAttempts}/${this.maxReconnectAttempts})`
          )
        }
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000
    })

    this.client.activate()
    console.log('[WebSocket] Client activation initiated')
  }

  private restoreSubscriptions() {
    console.log('[WebSocket] Restoring subscriptions after reconnect...')

    this.subscriptions.clear()

    this.chatCallbacks.forEach((callback, chatId) => {
      console.log(`[WebSocket] Restoring subscription to chat ${chatId}`)
      this.subscribeToChat(chatId, callback)
    })

    if (this.typingCallbacks.size > 0) {
      const firstCallback = this.typingCallbacks.values().next().value
      if (firstCallback) {
        this.resubscribeToTyping()
      }
    }

    if (this.notificationCallback) {
      this.resubscribeToNotifications()
    }
  }

  private resubscribeToTyping() {
    if (!this.client || !this.client.connected) return

    const destination = '/user/queue/typing'
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body)
        console.log('[WebSocket] Received typing event:', data)
        this.typingCallbacks.forEach((cb) => cb(data))
      } catch (error) {
        console.error('[WebSocket] Error parsing typing message:', error)
      }
    })
    this.subscriptions.set(destination, subscription)
  }

  private resubscribeToNotifications() {
    if (!this.client || !this.client.connected || !this.notificationCallback) return

    const destination = '/user/queue/notifications'
    const callback = this.notificationCallback
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body)
        callback(data)
      } catch (error) {
        console.error('[WebSocket] Error parsing notification:', error)
      }
    })
    this.subscriptions.set(destination, subscription)
  }

  isConnected(): boolean {
    return this.client?.connected ?? false
  }

  disconnect() {
    this.subscriptions.clear()
    this.client?.deactivate()
  }

  subscribeToChat(chatId: number, callback: (message: ChatMessage) => void) {
    this.chatCallbacks.set(chatId, callback)

    if (!this.client || !this.client.connected) {
      console.warn('[WebSocket] Not connected, subscription will be established after connect')
      return
    }

    const destination = `/topic/chat/${chatId}`

    if (this.subscriptions.has(destination)) {
      return
    }

    console.log(`[WebSocket] Subscribing to chat ${chatId}`)
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body)
        console.log(`[WebSocket] Received message in chat ${chatId}:`, data)
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
    this.chatCallbacks.delete(chatId)
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
    this.notificationCallback = callback

    if (!this.client || !this.client.connected) {
      console.warn('[WebSocket] Not connected, notification subscription will be established after connect')
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
