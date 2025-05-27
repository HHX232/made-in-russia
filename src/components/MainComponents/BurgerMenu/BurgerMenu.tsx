'use client'
import ProfileButtonUI from '@/components/UI-kit/buttons/profileButtonUI/profileButtonUI'
import ShopButtonUI from '@/components/UI-kit/buttons/ShopButtonUI/ShopButtonUI'
import StarButtonUI from '@/components/UI-kit/buttons/StarButtonUI/StarButtonUI'
import styles from './BurgerMenu.module.scss'
import {FC, useState} from 'react'

const BurgerMenu: FC = () => {
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  return (
    <div className={`${styles.burger__menu} `}>
      <div
        onClick={() => {
          setMenuIsOpen((prev) => !prev)
        }}
        className={`${styles.burger}`}
      >
        <div className={`${styles.burger__item}`}></div>
        <div className={`${styles.burger__item}`}></div>
        <div className={`${styles.burger__item}`}></div>
      </div>
      <div className={`${styles.burger__menu__list} ${menuIsOpen ? styles.burger__menu__list__active : ''}`}>
        <div className={`${styles.burger__menu__item} ${styles.burger__menu__item__first}`}>
          <ProfileButtonUI extraClass={`${styles.extra__profile__class}`} />
        </div>
        <div className={`${styles.burger__menu__item}`}>
          <ShopButtonUI svgColor='#2A2E46' />
          <p className={`${styles.burger__item__text}`}>Корзина</p>
        </div>
        <div className={`${styles.burger__menu__item}`}>
          <StarButtonUI svgColor='#2A2E46' />
          <p className={`${styles.burger__item__text}`}>Избранное</p>
        </div>
      </div>
    </div>
  )
}

export default BurgerMenu
