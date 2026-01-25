'use client'

import {ChatMessage} from '@/types/chat.types'
import {MessageItem} from '../MessageItem/MessageItem'
import styles from './MessageList.module.scss'
import {useAppSelector} from '@/hooks/redux'

interface MessageListProps {
  messages: ChatMessage[]
}

export const MessageList: React.FC<MessageListProps> = ({messages}) => {
  const currentUserId = useAppSelector((state) => state.user.user?.id)
  const currentUserRole = useAppSelector((state) => state.user.user?.role)
  const isAdmin = currentUserRole === 'Admin'

  return (
    <div className={styles.messageList}>
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwnMessage={message.senderId === currentUserId}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  )
}
