'use client'

import {Chat} from '@/types/chat.types'
import styles from './ChatHeader.module.scss'
import {useTranslations} from 'next-intl'
import Link from 'next/link'

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
    return chat.participants.filter((p) => p.role !== 'ADMIN').map((p) => ({...p, label: getRoleLabel(p.role)}))
  }

  const participantsWithLabels = getParticipantsWithLabels()

  const isVendorChat = chat.isVendorChat && chat.vendorInfo
  const displayImage = isVendorChat ? chat.vendorInfo?.avatarUrl : chat.product.imageUrl
  const capitalizeFirstLetter = (str: string | undefined) => {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
  const displayName = isVendorChat ? capitalizeFirstLetter(chat.vendorInfo?.name) : chat.product.name
  const displaySubtitle = isVendorChat ? t('vendorChat') : formatPrice(chat.product.price)

  const targetLink = isVendorChat ? `/data-vendor/${chat.vendorInfo?.id}` : `/card/${chat.product.id}`

  const getInitial = (name: string | undefined) => {
    if (!name) return '?'
    const cleanName = name.split('"')[1] || name
    return cleanName.charAt(0).toUpperCase()
  }

  return (
    <div className={styles.chatHeader}>
      <Link href={targetLink} className={styles.productInfo}>
        {displayImage ? (
          <img src={displayImage} alt={displayName || ''} className={styles.productImage} />
        ) : isVendorChat ? (
          <div className={styles.vendorAvatarPlaceholder}>
            <span className={styles.vendorInitial}>{getInitial(displayName)}</span>
          </div>
        ) : null}
        <div className={styles.productDetails}>
          <h3 className={styles.productName}>{displayName}</h3>
          <p className={styles.productPrice}>{displaySubtitle}</p>
        </div>
      </Link>
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
