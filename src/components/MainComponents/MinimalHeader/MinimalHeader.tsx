'use client'
import Image from 'next/image'
import styles from './MinimalHeader.module.scss'
import Link from 'next/link'
import {useState} from 'react'

const logo = '/Logo_Bear.svg'
const logoText = '/logoText.svg'

const MinimalHeader = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [linksItems, setLinksItems] = useState(['Категории', 'Отзывы', 'Доставка', 'О нас', 'Помощь'])
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  return (
    <div className={`${styles.header__box} `}>
      <div className={`${styles.container__inner} container`}>
        <Link href={'/'} className={`${styles.logo__box}`}>
          <Image src={logo} width={69} height={69} alt='logo Made In Russia' />
          <Image src={logoText} width={172} height={41} alt='logo Made In Russia' />
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
