'use client'

import {useState, useRef, useEffect} from 'react'
import Link from 'next/link'
import {Heart, MessageCircle} from 'lucide-react'
import styles from './MobileNavigation.module.scss'
import ProfileButtonUI from '@/components/UI-kit/buttons/profileButtonUI/profileButtonUI'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useTranslations} from 'next-intl'
import {chatService} from '@/services/chat/chat.service'
import {useDispatch} from 'react-redux'
import {setUnreadTotal} from '@/store/slices/chatSlice'

const MobileNavigation = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const navRef = useRef<HTMLDivElement>(null)
  const {user} = useTypedSelector((state) => state.user)
  const {unreadTotal} = useTypedSelector((state) => state.chat)
  const dispatch = useDispatch()
  const t = useTranslations('MobileNavigation')

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const count = await chatService.getTotalUnreadCount()
          dispatch(setUnreadTotal(count))
        } catch (error) {
          console.error('Failed to fetch unread count:', error)
        }
      }
    }
    fetchUnreadCount()
  }, [user, dispatch])

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    const diff = startY - currentY

    // Уменьшенный порог - если свайп вверх (больше 20px) - показываем меню
    if (diff > 20) {
      setIsVisible(true)
    }
    // Если свайп вниз (больше 20px) - скрываем меню
    else if (diff < -20) {
      setIsVisible(false)
    }

    setStartY(0)
    setCurrentY(0)
  }

  return (
    <>
      {/* Полоска для свайпа */}
      <div
        className={`${styles.swipeHandle} ${isVisible ? styles.handleVisible : styles.handleHidden}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.handleBar} />
      </div>

      {/* Навигационное меню */}
      <nav
        ref={navRef}
        className={`${styles.mobileNav} ${isVisible ? styles.visible : styles.hidden}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.navContent}>
          {/* Избранное */}
          <Link
            href={user?.role.toLowerCase() === 'user' ? '/profile?activeTab=favorites' : '/vendor?activeTab=favorites'}
            className={styles.navItem}
          >
            <Heart className={styles.navIcon} />
            {/* <span className={styles.navLabel}>Избранное</span> */}
          </Link>

          {/* Чат */}
          <Link href='/chats' className={`${styles.navItem} ${unreadTotal > 0 ? styles.hasUnread : ''}`}>
            <div className={styles.chatIconWrapper}>
              <MessageCircle className={styles.navIcon} />
              {unreadTotal > 0 && <span className={styles.unreadBadge}>{unreadTotal > 99 ? '99+' : unreadTotal}</span>}
            </div>
          </Link>

          {/* Профиль */}
          <div className={styles.navItem}>
            <ProfileButtonUI useDarkText={true} specialUnloginLabel={t('login')} />
          </div>
        </div>
      </nav>
    </>
  )
}

export default MobileNavigation
