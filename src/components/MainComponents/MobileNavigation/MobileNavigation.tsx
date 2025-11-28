'use client'

import {useState, useRef} from 'react'
import Link from 'next/link'
import {Heart, MessageCircle} from 'lucide-react'
import styles from './MobileNavigation.module.scss'
import ProfileButtonUI from '@/components/UI-kit/buttons/profileButtonUI/profileButtonUI'
import {useTypedSelector} from '@/hooks/useTypedSelector'

const MobileNavigation = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const navRef = useRef<HTMLDivElement>(null)
  const {user} = useTypedSelector((state) => state.user)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    const diff = startY - currentY

    // Если свайп вверх (больше 50px) - показываем меню
    if (diff > 50) {
      setIsVisible(true)
    }
    // Если свайп вниз (больше 50px) - скрываем меню
    else if (diff < -50) {
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
            href={user?.role === 'user' ? '/profile?activeTab=favorites' : '/vendor?activeTab=favorites'}
            className={styles.navItem}
          >
            <Heart className={styles.navIcon} />
            {/* <span className={styles.navLabel}>Избранное</span> */}
          </Link>

          {/* Чат */}
          <button className={styles.navItem}>
            <MessageCircle className={styles.navIcon} />
            {/* <span className={styles.navLabel}>Чат</span> */}
          </button>

          {/* Профиль */}
          <div className={styles.navItem}>
            <ProfileButtonUI />
          </div>
        </div>
      </nav>
    </>
  )
}

export default MobileNavigation
