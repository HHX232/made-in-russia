'use client'

import {useState, useRef, useEffect} from 'react'
import Link from 'next/link'
import {Heart, MessageCircle} from 'lucide-react'
import styles from './MobileNavigation.module.scss'
import ProfileButtonUI from '@/components/UI-kit/buttons/profileButtonUI/profileButtonUI'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useTranslations} from 'next-intl'

const MobileNavigation = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const navRef = useRef<HTMLDivElement>(null)
  const {user} = useTypedSelector((state) => state.user)
  const t = useTranslations('MobileNavigation')

  useEffect(() => {
    if (navRef.current) {
      navRef.current.style.transform = 'translateZ(0)'
      void navRef.current.offsetHeight

      requestAnimationFrame(() => {
        if (navRef.current) {
          navRef.current.style.transform = isVisible ? 'translateY(0)' : 'translateY(100%)'
        }
      })
    }
  }, [user, isVisible])

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    const diff = startY - currentY

    if (diff > 20) {
      setIsVisible(true)
    } else if (diff < -20) {
      setIsVisible(false)
    }

    setStartY(0)
    setCurrentY(0)
  }

  return (
    <>
      <div
        className={`${styles.swipeHandle} ${isVisible ? styles.handleVisible : styles.handleHidden}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.handleBar} />
      </div>

      <nav
        ref={navRef}
        className={`${styles.mobileNav} ${isVisible ? styles.visible : styles.hidden}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        123
        <div className={styles.navContent}>
          <Link
            href={user?.role.toLowerCase() === 'user' ? '/profile?activeTab=favorites' : '/vendor?activeTab=favorites'}
            className={styles.navItem}
          >
            <Heart className={styles.navIcon} />
          </Link>

          <Link href={'/chats'} className={styles.navItem}>
            <MessageCircle className={styles.navIcon} />
          </Link>

          <div className={styles.navItem}>
            <ProfileButtonUI useDarkText={true} specialUnloginLabel={t('login')} />
          </div>
        </div>
      </nav>
    </>
  )
}

export default MobileNavigation
