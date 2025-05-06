import Image from 'next/image'
import {FC} from 'react'
import styles from './Header.module.scss'
import Link from 'next/link'
import createTelText from '@/utils/createTelText'
import LanguageButtonUI from '@/components/UI-kit/buttons/LanguageButtonUI/LanguageButtonUI'
import SearchInputUI from '@/components/UI-kit/Inputs/SearchInputUI/SearchInputUI'
import ShopButtonUI from '@/components/UI-kit/buttons/ShopButtonUI/ShopButtonUI'
import StarButtonUI from '@/components/UI-kit/buttons/StarButtonUI/StarButtonUI'
import ProfileButtonUI from '@/components/UI-kit/buttons/profileButtonUI/profileButtonUI'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'

const insta = '/insta.svg'
const telephone = '/phone.svg'
const telegram = '/telegram.svg'
const logo = '/Logo_Bear.svg'
const logoText = '/logoText.svg'

const Header: FC = () => {
  // Формируем URL как строку
  const instagramUrl = `https://www.instagram.com/${process.env.NEXT_PUBLIC_INSTA || 'made-in-russia'}`
  const telegramUrl = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM || 'made_in_russia'}`
  const telephoneUrl = `tel:${process.env.NEXT_PUBLIC_TELEPHONE ? `7${process.env.NEXT_PUBLIC_TELEPHONE}` : '88005553535'}`
  const telephoneText = createTelText(process.env.NEXT_PUBLIC_TELEPHONE)

  return (
    <header className={`${styles.header}`}>
      <div className={`${styles.header__top} container`}>
        <ul className={styles.header__top_list}>
          <li className={styles.header__top_item}>
            <Link className={styles.header__top_link} href={instagramUrl} target='_blank' rel='noopener noreferrer'>
              <Image
                className={`${styles.header__top_image} ${styles.header__top_image_insta}`}
                width={24}
                height={24}
                src={insta}
                alt='insta'
              />
              {process.env.NEXT_PUBLIC_INSTA || 'made-in-russia'}
            </Link>
          </li>
          <li className={styles.header__top_item}>
            <Link className={styles.header__top_link} href={telegramUrl} target='_blank' rel='noopener noreferrer'>
              <Image
                className={`${styles.header__top_image} ${styles.header__top_image_telegram}`}
                width={24}
                height={24}
                src={telegram}
                alt='telegram'
              />
              {process.env.NEXT_PUBLIC_TELEGRAM || 'made-in-russia'}
            </Link>
          </li>
          <li className={styles.header__top_item}>
            <Link
              type='tel'
              className={styles.header__top_link}
              href={telephoneUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Image
                className={`${styles.header__top_image} ${styles.header__top_image_telephone}`}
                width={24}
                height={24}
                src={telephone}
                alt='telephone'
              />
              {telephoneText}
            </Link>
          </li>
        </ul>
        <LanguageButtonUI />
      </div>
      <div className={`${styles.middle__header}`}>
        <div className={`container ${styles.header__middle_box}`}>
          <div className={`${styles.header__logo_box}`}>
            <Image className={`${styles.bear__img}`} alt='Logo with Bear' src={logo} width={69} height={69} />
            <Image className={`${styles.bear__img_text}`} alt='Made In Russia' src={logoText} width={175} height={41} />
          </div>
          <div className={`${styles.searchBox}`}>
            <SearchInputUI />
          </div>
          <div className={`${styles.main__middle_content}`}>
            <ProfileButtonUI />
            <ShopButtonUI />
            <StarButtonUI />
          </div>
        </div>
      </div>
      <div className={`${styles.bottom_header}`}>
        <div className='container'>
          <ul className={`${styles.bottom__header__inner}`}>
            <li className={`${styles.bottom__list_item}`}>
              <DropList
                title='Категории'
                items={[
                  'item1',
                  <DropList
                    extraClass={styles.extra_list}
                    direction='right'
                    gap={'20'}
                    title='Категории'
                    items={['item1', 'item2', 'item3']}
                    key={1}
                  />,
                  'item3'
                ]}
              />
            </li>
            <li className={`${styles.bottom__list_item}`}>
              <p>Отзывы</p>
            </li>
            <li className={`${styles.bottom__list_item}`}>
              <p>Доставка</p>
            </li>
            <li className={`${styles.bottom__list_item}`}>
              <p>О нас</p>{' '}
            </li>
            <li className={`${styles.bottom__list_item}`}>
              <p>Помощь</p>{' '}
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Header
