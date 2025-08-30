'use client'
import Image from 'next/image'
import styles from './AdminTabBar.module.scss'
import {Link} from '@/i18n/navigation'

const IMAGES__ASSESTS = {
  users: '/admin/user.svg',
  cards: '/admin/cards.svg',
  ads: '/admin/ads.svg',
  faq: '/admin/faq.svg',
  categories: '/admin/categoryes.svg',
  translates: '/admin/lang.svg',
  reviews: '/admin/comment.svg'
}
const AdminTabBar = () => {
  return (
    <div className={styles.admin__tab__bar}>
      <p className={styles.tabs__title}>Управление</p>
      <div className={styles.admin__tab__bar__inner}>
        <Link href={'/admin/users'}>
          <div className={styles.admin__tab__bar__inner__item}>
            <Image
              className={`${styles.admin__tab__image}`}
              src={IMAGES__ASSESTS.users}
              alt='users'
              width={19}
              height={23}
            />
            <p>Пользователи</p>
          </div>
        </Link>
        <Link href={'/admin/cards'}>
          <div className={styles.admin__tab__bar__inner__item}>
            <Image
              className={`${styles.admin__tab__image}`}
              src={IMAGES__ASSESTS.cards}
              alt='cards'
              width={21}
              height={21}
            />
            <p>Товары</p>
          </div>
        </Link>
        <Link href={'/admin/ads'}>
          <div className={styles.admin__tab__bar__inner__item}>
            <Image
              className={`${styles.admin__tab__image}`}
              src={IMAGES__ASSESTS.ads}
              alt='ads'
              width={20}
              height={15}
            />
            <p>Реклама</p>
          </div>
        </Link>
        <Link href={'/admin/faq'}>
          <div className={styles.admin__tab__bar__inner__item}>
            <Image
              className={`${styles.admin__tab__image}`}
              src={IMAGES__ASSESTS.faq}
              alt='faq'
              width={22}
              height={22}
            />
            <p>FAQ</p>
          </div>
        </Link>
        <Link href={'/admin/reviews'}>
          <div className={styles.admin__tab__bar__inner__item}>
            <Image
              className={`${styles.admin__tab__image}`}
              src={IMAGES__ASSESTS.reviews}
              alt='reviews'
              width={22}
              height={22}
            />
            <p>Отзывы</p>
          </div>
        </Link>
        <Link href={'/admin/categories'}>
          <div className={styles.admin__tab__bar__inner__item}>
            <Image
              className={`${styles.admin__tab__image}`}
              src={IMAGES__ASSESTS.categories}
              alt='categories'
              width={21}
              height={21}
            />
            <p>Категории</p>
          </div>
        </Link>
        <Link href={'/admin/translates'}>
          <div className={styles.admin__tab__bar__inner__item}>
            <Image
              className={`${styles.admin__tab__image}`}
              src={IMAGES__ASSESTS.translates}
              alt='translates'
              width={19}
              height={19}
            />
            <p>Переводы</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default AdminTabBar
