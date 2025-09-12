/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {useEffect, useRef} from 'react'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface TelegramLoginWidgetProps {
  onAuth: (user: TelegramUser) => void
  className?: string
  buttonSize?: 'large' | 'medium' | 'small'
  cornerRadius?: number
  requestAccess?: 'write'
  usePic?: boolean
  lang?: string
}

const TelegramLoginWidget: React.FC<TelegramLoginWidgetProps> = ({
  onAuth,
  className = '',
  buttonSize = 'large',
  cornerRadius = 20,
  requestAccess = 'write',
  usePic = true,
  lang = 'en'
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Создаем уникальное имя для глобальной функции
    const callbackName = `onTelegramAuth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Создаем глобальную функцию для обратного вызова
    ;(window as any)[callbackName] = (user: TelegramUser) => {
      console.log('Telegram user data:', user)
      onAuth(user)
    }

    // Очищаем контейнер перед добавлением нового скрипта
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    // Создаем скрипт для виджета Telegram
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', `${process.env.TELEGRAM_BOT_NAME}`)
    script.setAttribute('data-size', buttonSize)
    script.setAttribute('data-onauth', `${callbackName}(user)`)
    if (requestAccess) {
      script.setAttribute('data-request-access', requestAccess)
    }

    // Добавляем скрипт в контейнер
    if (containerRef.current) {
      script.setAttribute('style', 'cursor: pointer !important')
      containerRef.current.appendChild(script)
    }

    // Cleanup функция
    return () => {
      // Удаляем глобальную функцию
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName]
      }
    }
  }, [onAuth, buttonSize, requestAccess])

  return <div ref={containerRef} className={className} />
}

export default TelegramLoginWidget
