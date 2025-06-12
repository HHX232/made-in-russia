'use client'
import Image from 'next/image'
import {FC, useEffect, useState} from 'react'
import styles from './Header.module.scss'
import Link from 'next/link'
import createTelText from '@/utils/createTelText'
import LanguageButtonUI from '@/components/UI-kit/buttons/LanguageButtonUI/LanguageButtonUI'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import ProfileButtonUI from '@/components/UI-kit/buttons/profileButtonUI/profileButtonUI'
// import ShopButtonUI from '@/components/UI-kit/buttons/ShopButtonUI/ShopButtonUI'
import StarButtonUI from '@/components/UI-kit/buttons/StarButtonUI/StarButtonUI'
import SearchInputUI from '@/components/UI-kit/inputs/SearchInputUI/SearchInputUI'
import BurgerMenu from '../BurgerMenu/BurgerMenu'
import Head from 'next/head'
import CategoriesService, {Category} from '@/services/categoryes/categoryes.service'

const insta = '/insta.svg'
const telephone = '/phone.svg'
const telegram = '/telegram.svg'

// const logoFav = '/logos/logo_fav.svg'
const logoFavBig = '/logos/logoWithoutText.svg'
const logoFavSmall = '/logos/logo_fav.svg'

interface HeaderProps {
  isShowBottom?: boolean
  categories?: Category[]
}

export const renderCategoryItems = (
  categories: Category[],
  positionIsAbsolute?: boolean,
  direction?: 'right' | 'left' | 'bottom' | 'top',
  gap?: '0' | '5' | '10' | '15' | '20' | '25' | '30' | '35' | '40' | '45' | '50',
  parentPath?: string,
  parentDropListId?: string,
  extraClass?: string
): React.ReactNode[] => {
  return categories.map((category) => {
    // Формируем полный путь для текущей категории
    const currentPath = parentPath ? `${parentPath}/${category.slug}` : category.slug
    // Генерируем уникальный ID для этого списка
    const dropListId = `category-${currentPath.replace(/\//g, '-')}`

    // Если у категории есть дети, создаем вложенный DropList
    if (category.children && category.children.length > 0) {
      return (
        <DropList
          key={category.id}
          dropListId={dropListId}
          parentDropListId={parentDropListId}
          extraClass={`${styles.extra_list} ${extraClass}`}
          direction={direction || 'right'}
          positionIsAbsolute={positionIsAbsolute}
          gap={gap || '0'}
          title={
            <Link href={`/categories/${currentPath}`}>
              <p>{category.name}</p>
            </Link>
          }
          items={renderCategoryItems(
            category.children,
            positionIsAbsolute,
            direction,
            gap,
            currentPath,
            dropListId // Передаем ID текущего списка как родительский для детей
          )}
          trigger='hover'
          hoverDelay={150}
          safeAreaEnabled={true}
          safeAreaSize={30}
        />
      )
    }

    // Если детей нет, просто возвращаем ссылку
    return (
      <Link key={category.id} href={`/categories/${currentPath}`}>
        <p>{category.name}</p>
      </Link>
    )
  })
}
const Header: FC<HeaderProps> = ({isShowBottom = true, categories}) => {
  const instagramUrl = `https://www.instagram.com/${process.env.NEXT_PUBLIC_INSTA || 'made-in-russia'}`
  const telegramUrl = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM || 'made_in_russia'}`
  const telephoneUrl = `tel:${process.env.NEXT_PUBLIC_TELEPHONE ? `7${process.env.NEXT_PUBLIC_TELEPHONE}` : '88005553535'}`
  const telephoneText = createTelText(process.env.NEXT_PUBLIC_TELEPHONE)
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories || [])

  useEffect(() => {
    async function rrrr() {
      const res = await CategoriesService.getAll()
      setCategoriesList(res)
    }
    rrrr()
  }, [])

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Made In Russia',
    url: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
    sameAs: [instagramUrl, telegramUrl],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: process.env.NEXT_PUBLIC_TELEPHONE ? `+7${process.env.NEXT_PUBLIC_TELEPHONE}` : '+78005553535',
      contactType: 'customer service',
      availableLanguage: ['Russian', 'English']
    }
  }

  const searchActionSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  // Микроразметка для навигации
  const navigationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    // TODO заменить ссылки
    url: [
      `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/categories`,
      `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/basket`,
      `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/delivery`,
      `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/about`,
      `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/help`
    ]
  }

  return (
    <>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(searchActionSchema)
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(navigationSchema)
          }}
        />
      </Head>

      <header className={`${styles.header}`} itemScope itemType='https://schema.org/WPHeader'>
        <div className={`${styles.header__top} container`}>
          <ul className={styles.header__top_list}>
            <li className={styles.header__top_item}>
              <Link
                className={styles.header__top_link}
                href={instagramUrl}
                target='_blank'
                rel='noopener noreferrer'
                itemProp='sameAs'
              >
                <Image
                  className={`${styles.header__top_image} ${styles.header__top_image_insta}`}
                  width={24}
                  height={24}
                  src={insta}
                  alt='Instagram'
                />
                {process.env.NEXT_PUBLIC_INSTA || 'made-in-russia'}
              </Link>
            </li>
            <li className={styles.header__top_item}>
              <Link
                className={styles.header__top_link}
                href={telegramUrl}
                target='_blank'
                rel='noopener noreferrer'
                itemProp='sameAs'
              >
                <Image
                  className={`${styles.header__top_image} ${styles.header__top_image_telegram}`}
                  width={24}
                  height={24}
                  src={telegram}
                  alt='Telegram'
                />
                {process.env.NEXT_PUBLIC_TELEGRAM || 'made-in-russia'}
              </Link>
            </li>
            <li className={styles.header__top_item}>
              <Link
                className={styles.header__top_link}
                href={telephoneUrl}
                target='_blank'
                rel='noopener noreferrer'
                itemProp='telephone'
              >
                <Image
                  className={`${styles.header__top_image} ${styles.header__top_image_telephone}`}
                  width={24}
                  height={24}
                  src={telephone}
                  alt='Телефон'
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
                      itemProp='sameAs'
                    >
                      <Image
                        className={`${styles.header__top_image} ${styles.header__top_image_insta}`}
                        width={24}
                        height={24}
                        src={insta}
                        alt='Instagram'
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
                      itemProp='sameAs'
                    >
                      <Image
                        className={`${styles.header__top_image} ${styles.header__top_image_telegram}`}
                        width={24}
                        height={24}
                        src={telegram}
                        alt='Telegram'
                      />
                      {process.env.NEXT_PUBLIC_TELEGRAM || 'made-in-russia'}
                    </Link>
                  </div>,
                  <div key={Math.random()} className={styles.header__top_item}>
                    <Link
                      className={styles.header__top_link}
                      href={telephoneUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      itemProp='telephone'
                    >
                      <Image
                        className={`${styles.header__top_image} ${styles.header__top_image_telephone}`}
                        width={24}
                        height={24}
                        src={telephone}
                        alt='Телефон'
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
            <Link
              href={'/'}
              className={`${styles.header__logo_box}`}
              itemScope
              itemType='https://schema.org/Organization'
            >
              <Image
                className={`${styles.bear__img}`}
                alt='Logo with Bear'
                src={logoFavBig}
                width={286}
                height={65}
                itemProp='logo'
              />
              <Image
                className={`${styles.bear__img_min}`}
                alt='Logo with Bear'
                src={logoFavSmall}
                width={100}
                height={100}
                itemProp='logo'
              />
              {/* <Image
                className={`${styles.bear__img_text}`}
                alt='Made In Russia'
                src={logoText}
                width={175}
                height={41}
              /> */}
              <meta itemProp='name' content='Made In Russia' />
              <meta
                itemProp='url'
                content={typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}
              />
            </Link>

            <div className={`${styles.searchBox}`} role='search' aria-label='Поиск по сайту'>
              <SearchInputUI />
            </div>

            <div className={`${styles.main__middle_content}`}>
              <ProfileButtonUI />
              {/* <ShopButtonUI /> */}
              <StarButtonUI />
            </div>
            <BurgerMenu />
          </div>
        </div>

        {isShowBottom && (
          <nav
            className={`${styles.bottom_header}`}
            role='navigation'
            aria-label='Основная навигация'
            itemScope
            itemType='https://schema.org/SiteNavigationElement'
          >
            <div className='container'>
              <ul className={`${styles.bottom__header__inner}`}>
                <div className={`${styles.bottom__list_item}`}>
                  <DropList
                    dropListId='categories-seo'
                    title={<p>Категории</p>}
                    extraStyle={{position: 'absolute', top: '-1000vh', left: '-1000vw', opacity: '0'}}
                    trigger='hover'
                    isOpen={true}
                    safeAreaEnabled
                    items={renderCategoryItems(categoriesList, true, 'bottom', '10')}
                  />
                  <DropList
                    dropListId='categories-main'
                    title={<p>Категории</p>}
                    trigger='hover'
                    safeAreaEnabled
                    // safeAreaSize={30}
                    hoverDelay={0}
                    positionIsAbsolute={false}
                    extraClass={`${styles.extra_list__first__drop}`}
                    items={renderCategoryItems(
                      categoriesList,
                      true, // positionIsAbsolute
                      'right', // direction
                      undefined, // parentPath
                      '' // parentDropListId для корневого списка,
                    )}
                    direction='bottom'
                    gap='10'
                  />
                </div>
                <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                  <Link href='/reviews' itemProp='url'>
                    <span itemProp='name'>Отзывы</span>
                  </Link>
                </li>
                <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                  <Link href='/delivery' itemProp='url'>
                    <span itemProp='name'>Доставка</span>
                  </Link>
                </li>
                <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                  <Link href='/about' itemProp='url'>
                    <span itemProp='name'>О нас</span>
                  </Link>
                </li>
                <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                  <Link href='/help' itemProp='url'>
                    <span itemProp='name'>Помощь</span>
                  </Link>
                </li>
                <li className={`${styles.drop__bottom_list}`}>
                  <DropList
                    extraClass={`${styles.extra__bottom__header__list}`}
                    title='Еще'
                    items={[
                      <div key={Math.random()} className={`${styles.bottom__list_item}`}>
                        <Link href='/reviews'>Отзывы</Link>
                      </div>,
                      <div key={Math.random()} className={`${styles.bottom__list_item}`}>
                        <Link href='/delivery'>Доставка</Link>
                      </div>,
                      <div key={Math.random()} className={`${styles.bottom__list_item}`}>
                        <Link href='/about'>О нас</Link>
                      </div>,
                      <div key={Math.random()} className={`${styles.bottom__list_item}`}>
                        <Link href='/help'>Помощь</Link>
                      </div>
                    ]}
                  />
                </li>
              </ul>
            </div>
          </nav>
        )}
      </header>
    </>
  )
}

export default Header
