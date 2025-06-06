'use client'
import Image from 'next/image'
import styles from './MinimalHeader.module.scss'
import Link from 'next/link'
import {useState} from 'react'

const logoFavBig = '/logos/logoWithoutText.svg'
const MinimalHeader = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [linksItems, setLinksItems] = useState(['Категории', 'Отзывы', 'Доставка', 'О нас', 'Помощь'])
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  return (
    <div className={`${styles.header__box} `}>
      <div className={`${styles.container__inner} container`}>
        <Link href={'/'} className={`${styles.logo__box}`}>
          <Image
            className={`${styles.bear__img}`}
            alt='Logo with Bear'
            src={logoFavBig}
            width={286}
            height={65}
            itemProp='logo'
          />{' '}
          {/* <Image src={logoText} width={172} height={41} alt='logo Made In Russia' /> */}
        </Link>
        <ul className={`${styles.header__list} ${styles.header__list__big}`}>
          {linksItems.map((el, i) => {
            return (
              <li key={i} className={`${styles.header__list__item}`}>
                <Link href={'#'}>{el}</Link>
              </li>
            )
          })}
        </ul>
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
            <ul className={`${styles.header__list} ${styles.header__list__mini}`}>
              {linksItems.map((el, i) => {
                return (
                  <li key={i} className={`${styles.header__list__item}`}>
                    <Link href={'#'}>{el}</Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MinimalHeader
