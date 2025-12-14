'use client'
import ProfileButtonUI from '@/components/UI-kit/buttons/profileButtonUI/profileButtonUI'
import StarButtonUI from '@/components/UI-kit/buttons/StarButtonUI/StarButtonUI'
import styles from './BurgerMenu.module.scss'
import {FC, useState, useEffect} from 'react'
import {useTranslations} from 'next-intl'

const BurgerMenu: FC = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const t = useTranslations('VendorPage')

  // Закрытие меню при скролле
  useEffect(() => {
    const handleScroll = () => {
      if (menuIsOpen) {
        setMenuIsOpen(false)
      }
    }

    if (menuIsOpen) {
      window.addEventListener('scroll', handleScroll)
      // Блокируем скролл страницы когда меню открыто
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.body.style.overflow = 'unset'
    }
  }, [menuIsOpen])

  // Закрытие по клику на overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setMenuIsOpen(false)
    }
  }

  return (
    <div className={`${styles.burger__menu} `}>
      <div
        onClick={() => {
          setMenuIsOpen((prev) => !prev)
        }}
        className={`${styles.burger} ${menuIsOpen ? styles.burger__active : ''}`}
      >
        <div className={`${styles.burger__item}`}></div>
        <div className={`${styles.burger__item}`}></div>
        <div className={`${styles.burger__item}`}></div>
      </div>

      {/* Overlay */}
      <div
        className={`${styles.burger__overlay} ${menuIsOpen ? styles.burger__overlay__active : ''}`}
        onClick={handleOverlayClick}
      />

      <div className={`${styles.burger__menu__list} ${menuIsOpen ? styles.burger__menu__list__active : ''}`}>
        <div className={`${styles.burger__menu__item} ${styles.burger__menu__item__first}`}>
          <ProfileButtonUI extraClass={`${styles.extra__profile__class}`} />
        </div>
        <div className={`${styles.burger__menu__item}`}>
          <StarButtonUI svgColor='#2A2E46' />
          <p className={`${styles.burger__item__text}`}>{t('favorites')}</p>
        </div>
      </div>
    </div>
  )
}

export default BurgerMenu
