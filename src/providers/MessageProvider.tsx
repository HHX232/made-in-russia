'use client'
import {useMessageCache} from '@/hooks/useMessageUpdater'
import React, {createContext, useContext, useEffect, useState} from 'react'

interface MessageContextType {
  messages: Record<string, string>
  isLoading: boolean
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export const MessageProvider = ({
  children,
  initialMessages
}: {
  children: React.ReactNode
  initialMessages: Record<string, string>
}) => {
  const {updatedMessages, isLoading} = useMessageCache()
  const [messages, setMessages] = useState(initialMessages)

  useEffect(() => {
    if (updatedMessages) {
      setMessages((prev) => ({
        ...prev,
        ...updatedMessages
      }))
    }
  }, [updatedMessages])

  return <MessageContext.Provider value={{messages, isLoading}}>{children}</MessageContext.Provider>
}

export const useMessages = () => {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useMessages must be used within MessageProvider')
  }
  return context
}
