/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {useEffect, useRef} from 'react'
import {useRouter} from 'next/navigation'

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
  const router = useRouter()

  useEffect(() => {
    // Создаем уникальное имя для глобальной функции
    const callbackName = `onTelegramAuth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Создаем глобальную функцию для обратного вызова
    ;(window as any)[callbackName] = (user: TelegramUser) => {
      console.log('Telegram user data received:', user)
      console.log('User ID:', user.id)
      console.log('First Name:', user.first_name)
      console.log('Last Name:', user.last_name)
      console.log('Username:', user.username)
      console.log('Photo URL:', user.photo_url)
      console.log('Auth Date:', user.auth_date)
      console.log('Hash:', user.hash)

      // ДОПОЛНИТЕЛЬНО помещаем данные в searchParams
      const currentParams = new URLSearchParams(window.location.search)

      // Добавляем данные Telegram в параметры
      currentParams.set('telegram_id', user.id.toString())
      currentParams.set('first_name', user.first_name)

      if (user.last_name) {
        currentParams.set('last_name', user.last_name)
      }

      if (user.username) {
        currentParams.set('username', user.username)
      }

      if (user.photo_url) {
        currentParams.set('picture', user.photo_url)
      }

      // Можно также добавить дополнительные параметры
      currentParams.set('auth_date', user.auth_date.toString())
      currentParams.set('hash', user.hash)

      console.log('Adding query parameters:', currentParams.toString())

      // Обновляем URL с новыми параметрами
      const newUrl = `${window.location.pathname}?${currentParams.toString()}`
      console.log('New URL will be:', newUrl)

      router.push(newUrl)

      // Вызываем переданную функцию onAuth
      onAuth(user)
    }

    // Очищаем контейнер перед добавлением нового скрипта
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    // Создаем скрипт для виджета Telegram по новому образцу
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', 'exporterubot')
    script.setAttribute('data-size', buttonSize)
    script.setAttribute('data-onauth', `${callbackName}(user)`)

    if (requestAccess) {
      script.setAttribute('data-request-access', requestAccess)
    }

    // Добавляем скрипт в контейнер
    if (containerRef.current) {
      containerRef.current.appendChild(script)
    }

    // Cleanup функция
    return () => {
      // Удаляем глобальную функцию
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName]
      }
    }
  }, [onAuth, buttonSize, requestAccess, router])

  return <div ref={containerRef} className={className} />
}

export default TelegramLoginWidget
