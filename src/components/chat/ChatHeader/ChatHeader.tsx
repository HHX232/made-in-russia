'use client'

import {Chat} from '@/types/chat.types'
import styles from './ChatHeader.module.scss'
import {useTranslations} from 'next-intl'

interface ChatHeaderProps {
  chat: Chat
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({chat}) => {
  const t = useTranslations('chat')

  const formatPrice = (price: number | null) => {
    if (!price) return t('priceNotSpecified')
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      BUYER: t('buyer'),
      SELLER: t('seller'),
      ADMIN: t('admin')
    }
    return roleMap[role] || role
  }

  const getParticipantsWithLabels = () => {
    let adminCount = 0
    const admins = chat.participants.filter((p) => p.role === 'ADMIN')
    const hasMultipleAdmins = admins.length > 1

    return chat.participants.map((p) => {
      if (p.role === 'ADMIN') {
        adminCount++
        const label = hasMultipleAdmins ? `${getRoleLabel(p.role)} ${adminCount}` : getRoleLabel(p.role)
        return {...p, label}
      }
      return {...p, label: getRoleLabel(p.role)}
    })
  }

  const participantsWithLabels = getParticipantsWithLabels()

  return (
    <div className={styles.chatHeader}>
      <div className={styles.productInfo}>
        {chat.product.imageUrl && (
          <img src={chat.product.imageUrl} alt={chat.product.name} className={styles.productImage} />
        )}
        <div className={styles.productDetails}>
          <h3 className={styles.productName}>{chat.product.name}</h3>
          <p className={styles.productPrice}>{formatPrice(chat.product.price)}</p>
        </div>
      </div>
      <div className={styles.participants}>
        {participantsWithLabels.map((p) => (
          <span key={p.id} className={styles.participant} title={p.userName}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}
