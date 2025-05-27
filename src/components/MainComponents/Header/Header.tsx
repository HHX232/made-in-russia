import Image from 'next/image'
import {FC} from 'react'
import styles from './Header.module.scss'
import Link from 'next/link'
import createTelText from '@/utils/createTelText'
import LanguageButtonUI from '@/components/UI-kit/buttons/LanguageButtonUI/LanguageButtonUI'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import ProfileButtonUI from '@/components/UI-kit/buttons/profileButtonUI/profileButtonUI'
import ShopButtonUI from '@/components/UI-kit/buttons/ShopButtonUI/ShopButtonUI'
import StarButtonUI from '@/components/UI-kit/buttons/StarButtonUI/StarButtonUI'
import SearchInputUI from '@/components/UI-kit/inputs/SearchInputUI/SearchInputUI'
import BurgerMenu from '../BurgerMenu/BurgerMenu'

const insta = '/insta.svg'
const telephone = '/phone.svg'
const telegram = '/telegram.svg'
const logo = '/Logo_Bear.svg'
const logoText = '/logoText.svg'

interface HeaderProps {
  isShowBottom?: boolean
}
const Header: FC<HeaderProps> = ({isShowBottom = true}) => {
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
          <li className={`${styles.mobile__top_contacts}`}>
            <DropList
              extraClass={`${styles.extra__mobile__list}`}
              direction='bottom'
              title={'Контакты'}
              items={[
                <div key={1} className={styles.header__top_item}>
                  <Link
                    className={styles.header__top_link}
                    href={instagramUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Image
                      className={`${styles.header__top_image} ${styles.header__top_image_insta}`}
                      width={24}
                      height={24}
                      src={insta}
                      alt='insta'
                    />
                    {process.env.NEXT_PUBLIC_INSTA || 'made-in-russia'}
                  </Link>
                </div>,
                <div key={Math.random()} className={styles.header__top_item}>
                  <Link
                    className={styles.header__top_link}
                    href={telegramUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Image
                      className={`${styles.header__top_image} ${styles.header__top_image_telegram}`}
                      width={24}
                      height={24}
                      src={telegram}
                      alt='telegram'
                    />
                    {process.env.NEXT_PUBLIC_TELEGRAM || 'made-in-russia'}
                  </Link>
                </div>,
                <div key={Math.random()} className={styles.header__top_item}>
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
                </div>
              ]}
            />
          </li>
        </ul>
        <LanguageButtonUI />
      </div>
      <div className={`${styles.middle__header}`}>
        <div className={`container ${styles.header__middle_box}`}>
          <Link href={'/'} className={`${styles.header__logo_box}`}>
            <Image className={`${styles.bear__img}`} alt='Logo with Bear' src={logo} width={69} height={69} />
            <Image className={`${styles.bear__img_text}`} alt='Made In Russia' src={logoText} width={175} height={41} />
          </Link>
          <div className={`${styles.searchBox}`}>
            <SearchInputUI />
          </div>
          <div className={`${styles.main__middle_content}`}>
            <ProfileButtonUI />
            <ShopButtonUI />
            <StarButtonUI />
          </div>
          <BurgerMenu />
        </div>
      </div>
      {isShowBottom && (
        <div className={`${styles.bottom_header}`}>
          <div className='container'>
            <ul className={`${styles.bottom__header__inner}`}>
              <div className={`${styles.bottom__list_item}`}>
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
              </div>
              <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                <p>Отзывы</p>
              </li>
              <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                <p>Доставка</p>
              </li>
              <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                <p>О нас</p>{' '}
              </li>
              <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                <p>Помощь</p>{' '}
              </li>
              <li className={`${styles.drop__bottom_list}`}>
                <DropList
                  extraClass={`${styles.extra__bottom__header__list}`}
                  title='Еще'
                  items={[
                    <div key={Math.random()} className={`${styles.bottom__list_item}`}>
                      <p>Отзывы</p>
                    </div>,
                    <div key={Math.random()} className={`${styles.bottom__list_item}`}>
                      <p>Доставка</p>
                    </div>,
                    <div key={Math.random()} className={`${styles.bottom__list_item}`}>
                      <p>О нас</p>{' '}
                    </div>,
                    <div key={Math.random()} className={`${styles.bottom__list_item}`}>
                      <p>Помощь</p>{' '}
                    </div>
                  ]}
                />
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
