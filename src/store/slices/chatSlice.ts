import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Chat, ChatMessage} from '@/types/chat.types'

interface TypingUser {
  userId: number
  userName: string
}

interface ChatState {
  chats: Chat[]
  activeChat: Chat | null
  messages: Record<number, ChatMessage[]>
  typingUsers: Record<number, TypingUser[]>
  isLoading: boolean
  error: string | null
  unreadTotal: number
}

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  messages: {},
  typingUsers: {},
  isLoading: false,
  error: null,
  unreadTotal: 0
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats(state, action: PayloadAction<Chat[]>) {
      state.chats = action.payload
      state.unreadTotal = action.payload.reduce((sum, chat) => sum + chat.unreadCount, 0)
    },

    setActiveChat(state, action: PayloadAction<Chat | null>) {
      state.activeChat = action.payload
    },

    addChat(state, action: PayloadAction<Chat>) {
      const existingIndex = state.chats.findIndex((c) => c.id === action.payload.id)
      if (existingIndex >= 0) {
        state.chats[existingIndex] = action.payload
      } else {
        state.chats.unshift(action.payload)
      }
    },

    setMessages(state, action: PayloadAction<{chatId: number; messages: ChatMessage[]}>) {
      state.messages[action.payload.chatId] = action.payload.messages
    },

    addMessage(state, action: PayloadAction<ChatMessage>) {
      const chatId = action.payload.chatId
      if (!state.messages[chatId]) {
        state.messages[chatId] = []
      }

      const messageExists = state.messages[chatId].some((msg) => msg.id === action.payload.id)

      if (messageExists) {
        console.log('Message already exists, skipping:', action.payload.id)
        return
      }

      state.messages[chatId].push(action.payload)

      const chat = state.chats.find((c) => c.id === chatId)
      if (chat) {
        chat.lastMessage = action.payload
        chat.updatedAt = action.payload.createdAt
      }

      if (state.activeChat?.id !== chatId) {
        if (chat) {
          chat.unreadCount++
          state.unreadTotal++
        }
      }
    },

    markChatAsRead(state, action: PayloadAction<number>) {
      const chat = state.chats.find((c) => c.id === action.payload)
      if (chat && chat.unreadCount > 0) {
        state.unreadTotal -= chat.unreadCount
        chat.unreadCount = 0
      }
    },

    prependMessages(state, action: PayloadAction<{chatId: number; messages: ChatMessage[]}>) {
      const chatId = action.payload.chatId
      if (!state.messages[chatId]) {
        state.messages[chatId] = []
      }
      state.messages[chatId] = [...action.payload.messages, ...state.messages[chatId]]
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },

    setUserTyping(state, action: PayloadAction<{chatId: number; userId: number; userName: string}>) {
      const {chatId, userId, userName} = action.payload
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = []
      }
      const exists = state.typingUsers[chatId].some((u) => u.userId === userId)
      if (!exists) {
        state.typingUsers[chatId].push({userId, userName})
      }
    },

    removeUserTyping(state, action: PayloadAction<{chatId: number; userId: number}>) {
      const {chatId, userId} = action.payload
      if (state.typingUsers[chatId]) {
        state.typingUsers[chatId] = state.typingUsers[chatId].filter((u) => u.userId !== userId)
      }
    },

    markMessageAsRead(state, action: PayloadAction<{messageId: number; chatId: number}>) {
      const {messageId, chatId} = action.payload
      const messages = state.messages[chatId]
      if (messages) {
        const message = messages.find((m) => m.id === messageId)
        if (message) {
          message.isRead = true
        }
      }
    },

    setUnreadTotal(state, action: PayloadAction<number>) {
      state.unreadTotal = action.payload
    }
  }
})

export const {
  setChats,
  setActiveChat,
  addChat,
  setMessages,
  addMessage,
  markChatAsRead,
  setUserTyping,
  removeUserTyping,
  markMessageAsRead,
  setUnreadTotal
} = chatSlice.actions

export default chatSlice.reducer
