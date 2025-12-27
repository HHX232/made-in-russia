export enum ChatRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN'
}

export interface ProductInfo {
  id: number
  name: string
  price: number
  imageUrl: string
}

export interface VendorInfo {
  id: number
  name: string
  avatarUrl?: string
}

export interface ChatParticipant {
  id: number
  userId: number
  userName: string
  userAvatar?: string
  role: ChatRole
  joinedAt: string
  lastReadAt?: string
}

export interface MessageAttachment {
  id: number
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
}

export interface ChatMessage {
  id: number
  chatId: number
  senderId: number
  senderName: string
  senderAvatar?: string
  content: string
  attachments: MessageAttachment[]
  isRead: boolean
  isSystem: boolean
  createdAt: string
  updatedAt?: string
}

export interface Chat {
  id: number
  product: ProductInfo
  vendorInfo?: VendorInfo
  isVendorChat?: boolean
  participants: ChatParticipant[]
  lastMessage?: ChatMessage
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface ChatListResponse {
  chats: Chat[]
  totalPages?: number
  totalElements: number
  currentPage: number
  hasMore?: boolean
}

export interface MessageListResponse {
  messages: ChatMessage[]
  totalPages: number
  totalElements: number
  currentPage: number
  hasMore: boolean
}

export interface CreateChatRequest {
  productId: number
}

export interface SendMessageRequest {
  chatId: number
  content: string
  attachments?: File[]
}

export interface TranslateMessageRequest {
  text: string
  targetLanguage: 'en' | 'ru' | 'zh' | 'hi'
}

export interface TranslateMessageResponse {
  translatedText: string
  targetLanguage: string
  detectedSourceLanguage: string
}
