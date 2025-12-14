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

  return (
    <div className={styles.messageList}>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} isOwnMessage={message.senderId === currentUserId} />
      ))}
    </div>
  )
}
