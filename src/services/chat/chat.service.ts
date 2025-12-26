import {instance} from '@/api/api.interceptor'
import {
  Chat,
  ChatListResponse,
  ChatMessage,
  CreateChatRequest,
  MessageListResponse,
  SendMessageRequest,
  TranslateMessageRequest,
  TranslateMessageResponse
} from '@/types/chat.types'

export const chatService = {
  async createChat(productId: number): Promise<Chat> {
    const {data} = await instance.post<Chat>('/chats', {productId} as CreateChatRequest)
    return data
  },

  async createVendorChat(vendorId: number): Promise<Chat> {
    console.log('createVendorChat called with vendorId:', vendorId)
    const {data} = await instance.post<Chat>('/chats/vendor', {vendorId})
    console.log('createVendorChat response:', data)
    return data
  },

  async getUserChats(page = 0, size = 20): Promise<ChatListResponse> {
    const {data} = await instance.get<ChatListResponse>('/chats', {
      params: {page, size}
    })
    return data
  },

  async getChatDetails(chatId: number): Promise<Chat> {
    const {data} = await instance.get<Chat>(`/chats/${chatId}`)
    return data
  },

  async getChatMessages(chatId: number, page = 0, size = 50): Promise<MessageListResponse> {
    const {data} = await instance.get<MessageListResponse>(`/chats/${chatId}/messages`, {
      params: {page, size}
    })
    return data
  },

  async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
    const formData = new FormData()
    formData.append('chatId', request.chatId.toString())
    formData.append('content', request.content)

    if (request.attachments) {
      request.attachments.forEach((file) => {
        formData.append('attachments', file)
      })
    }

    const {data} = await instance.post<ChatMessage>('/chats/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  },

  async markAsRead(messageId: number): Promise<void> {
    await instance.post(`/chats/messages/${messageId}/read`)
  },

  async getTotalUnreadCount(): Promise<number> {
    const {data} = await instance.get<{unreadCount: number}>('/chats/unread-count')
    return data.unreadCount
  },

  async translateMessage(request: TranslateMessageRequest): Promise<TranslateMessageResponse> {
    const {data} = await instance.post<TranslateMessageResponse>('/chats/messages/translate', request)
    return data
  }
}
