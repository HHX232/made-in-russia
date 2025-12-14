'use client'
import React, {createContext, useContext, useState, useEffect} from 'react'
import {useOptimizedTranslations} from '@/hooks/useOptimizedTranslations'

interface TranslationContextType {
  messages: Record<string, string>
  isUpdating: boolean
  status: 'initial' | 'cached' | 'updated' | 'error'
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export const SmartTranslationProvider = ({
  children,
  initialMessages
}: {
  children: React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMessages: Record<string, any>
}) => {
  const [isHydrated, setIsHydrated] = useState(false)
  const optimizedTranslations = useOptimizedTranslations(initialMessages)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // На сервере используем только начальные сообщения
  const contextValue = isHydrated
    ? optimizedTranslations
    : {
        messages: initialMessages,
        isUpdating: false,
        status: 'initial' as const
      }

  return <TranslationContext.Provider value={contextValue}>{children}</TranslationContext.Provider>
}

export const useSmartTranslations = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useSmartTranslations must be used within SmartTranslationProvider')
  }
  return context
}
