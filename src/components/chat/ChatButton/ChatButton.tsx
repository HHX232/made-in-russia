'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {useAppDispatch} from '@/hooks/redux'
import {chatService} from '@/services/chat/chat.service'
import {setActiveChat, addChat} from '@/store/slices/chatSlice'
import {toast} from 'sonner'
import styles from './ChatButton.module.scss'

interface ChatButtonProps {
  productId: number
  className?: string
}

export const ChatButton: React.FC<ChatButtonProps> = ({productId, className}) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      const chat = await chatService.createChat(productId)
      dispatch(addChat(chat))
      dispatch(setActiveChat(chat))

      router.push(`/chats?chatId=${chat.id}`)
    } catch (error) {
      console.error('Failed to create chat:', error)
      toast.error('Ошибка при создании чата', {
        description: 'Попробуйте еще раз',
        style: {background: '#AC2525'}
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button className={`${styles.chatButton} ${className || ''}`} onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Загрузка...' : 'Написать продавцу'}
    </button>
  )
}
