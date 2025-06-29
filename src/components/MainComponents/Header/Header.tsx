'use client'
import Image from 'next/image'
import {FC, useEffect, useRef, useState} from 'react'
import styles from './Header.module.scss'
import Link from 'next/link'
import createTelText from '@/utils/createTelText'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import ProfileButtonUI from '@/components/UI-kit/buttons/profileButtonUI/profileButtonUI'
// import ShopButtonUI from '@/components/UI-kit/buttons/ShopButtonUI/ShopButtonUI'
// import StarButtonUI from '@/components/UI-kit/buttons/StarButtonUI/StarButtonUI'
import SearchInputUI from '@/components/UI-kit/inputs/SearchInputUI/SearchInputUI'
import BurgerMenu from '../BurgerMenu/BurgerMenu'
import Head from 'next/head'
import CategoriesService, {Category} from '@/services/categoryes/categoryes.service'
import CategoryesMenuDesktop from '@/components/UI-kit/elements/CategoryesMenuDesktop/CategoryesMenuDesktop'

enum Languages {
  RUSSIAN = 'Русский',
  ENGLISH = 'English',
  CHINA = '中文'
}

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
  extraClass?: string,
  isOpenAll?: boolean
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
          {...(isOpenAll === true && {isOpen: isOpenAll})}
          key={category.id}
          scrollThreshold={200}
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
            dropListId,
            '',
            isOpenAll
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
  const instagramUrl = `https://www.instagram.com/${process.env.NEXT_PUBLIC_INSTA || 'Exporteru'}`
  const telegramUrl = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM || 'made_in_russia'}`
  const telephoneUrl = `tel:${process.env.NEXT_PUBLIC_TELEPHONE ? `7${process.env.NEXT_PUBLIC_TELEPHONE}` : '88005553535'}`
  const telephoneText = createTelText(process.env.NEXT_PUBLIC_TELEPHONE)
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories || [])
  const [categoryListIsOpen, setCategoryListIsOpen] = useState<boolean>(false)
  const categoryListRefDesktop = useRef<HTMLDivElement>(null)
  const fullHeaderRef = useRef<HTMLDivElement>(null)
  // TODO: Заменить на получение из файлов
  const [activeLanguage, setActiveLanguage] = useState<Languages>(Languages.RUSSIAN)

  useEffect(() => {
    async function rrrr() {
      const res = await CategoriesService.getAll()
      setCategoriesList(res)
    }
    rrrr()
  }, [])

  // Используйте этот useEffect вместо предыдущего для работы с классами:

  // useEffect(() => {
  //   if (categoryListIsOpen && typeof window !== 'undefined') {
  //     // Добавляем класс для блокировки скролла
  //     document.body.classList.add('no-scroll')

  //     // Опционально: можно также добавить padding-right чтобы компенсировать скроллбар
  //     const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  //     if (scrollbarWidth > 0) {
  //       document.body.style.paddingRight = `${scrollbarWidth}px`
  //     }

  //     return () => {
  //       // Убираем класс при размонтировании или изменении состояния
  //       document.body.classList.remove('no-scroll')
  //       document.body.style.paddingRight = ''
  //     }
  //   }
  // }, [categoryListIsOpen])

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Exporteru',
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryListIsOpen &&
        categoryListRefDesktop.current &&
        !categoryListRefDesktop.current.contains(event.target as Node)
      ) {
        setCategoryListIsOpen(false)
      }
    }

    // Добавляем слушатель события
    document.addEventListener('mousedown', handleClickOutside)

    // Удаляем слушатель при размонтировании компонента
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [categoryListIsOpen])

  const handleToggleCategories = () => {
    setCategoryListIsOpen(!categoryListIsOpen)
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

      <header ref={fullHeaderRef} className={`${styles.header}`} itemScope itemType='https://schema.org/WPHeader'>
        {/* <div className={`${styles.header__top} container`}>
          <ul className={styles.header__top_list}>

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
                {process.env.NEXT_PUBLIC_TELEGRAM || 'Exporteru'}
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
                trigger='hover'
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
                      {process.env.NEXT_PUBLIC_INSTA || 'Exporteru'}
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
                      {process.env.NEXT_PUBLIC_TELEGRAM || 'Exporteru'}
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
    
          <DropList
            closeOnMouseLeave={true}
            extraStyle={{zIndex: '99999'}}
            extraClass={`${styles.extra__header__language_box}`}
            color='white'
            title={activeLanguage}
            // direction='left'
            gap='5'
            safeAreaEnabled={true}
            positionIsAbsolute={false}
            items={[
              <p onClick={() => setActiveLanguage(Languages.RUSSIAN)} key={1}>
                {Languages.RUSSIAN}
              </p>,
              <p onClick={() => setActiveLanguage(Languages.ENGLISH)} key={2}>
                {Languages.ENGLISH}
              </p>,
              <p onClick={() => setActiveLanguage(Languages.CHINA)} key={3}>
                {Languages.CHINA}
              </p>
            ]}
            trigger='hover'
          />
        </div> */}

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

              <meta itemProp='name' content='Exporteru' />
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
              {/* <StarButtonUI /> */}

              <DropList
                closeOnMouseLeave={true}
                extraStyle={{zIndex: '99999'}}
                extraClass={`${styles.extra__header__language_box}`}
                color='white'
                title={activeLanguage}
                // direction='left'
                gap='5'
                safeAreaEnabled={true}
                positionIsAbsolute={false}
                items={[
                  <p style={{width: '100%'}} onClick={() => setActiveLanguage(Languages.RUSSIAN)} key={1}>
                    {Languages.RUSSIAN}
                  </p>,
                  <p style={{width: '100%'}} onClick={() => setActiveLanguage(Languages.ENGLISH)} key={2}>
                    {Languages.ENGLISH}
                  </p>,
                  <p style={{width: '100%'}} onClick={() => setActiveLanguage(Languages.CHINA)} key={3}>
                    {Languages.CHINA}
                  </p>
                ]}
                trigger='hover'
              />
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
                    items={renderCategoryItems(categoriesList, true, 'bottom', '10', '', '', '', true)}
                  />
                  {/* <DropList
                    dropListId='categories-main'
                    title={<p>Категории</p>}
                    trigger='hover'
                    safeAreaEnabled
                    scrollThreshold={2000}
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
                  /> */}
                  <button
                    onClick={() => {
                      // setCategoryListIsOpen((prev) => !prev)
                      handleToggleCategories()
                    }}
                  >
                    Категории
                  </button>
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
                    trigger='hover'
                    positionIsAbsolute={false}
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
                      </div>,
                      <DropList
                        key={234}
                        extraClass={`${styles.extra__mobile__list}`}
                        direction='bottom'
                        gap='20'
                        safeAreaEnabled
                        trigger='hover'
                        title={'Контакты'}
                        items={[
                          <div key={1} className={styles.header__top_item}>
                            <Link
                              style={{width: '100%'}}
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
                              {process.env.NEXT_PUBLIC_INSTA || 'Exporteru'}
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
                              {process.env.NEXT_PUBLIC_TELEGRAM || 'Exporteru'}
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
                    ]}
                  />
                </li>
                <li className={`${styles.drop__bottom_list}`}>
                  <DropList
                    closeOnMouseLeave={true}
                    extraStyle={{zIndex: '99999'}}
                    // extraClass={`${styles.extra__header__language_box}`}
                    color='white'
                    title={activeLanguage}
                    // direction='left'
                    gap='5'
                    safeAreaEnabled={true}
                    positionIsAbsolute={false}
                    items={[
                      <p onClick={() => setActiveLanguage(Languages.RUSSIAN)} key={1}>
                        {Languages.RUSSIAN}
                      </p>,
                      <p onClick={() => setActiveLanguage(Languages.ENGLISH)} key={2}>
                        {Languages.ENGLISH}
                      </p>,
                      <p onClick={() => setActiveLanguage(Languages.CHINA)} key={3}>
                        {Languages.CHINA}
                      </p>
                    ]}
                    trigger='hover'
                  />
                </li>
              </ul>
            </div>
          </nav>
        )}
        {categoryListIsOpen && (
          <div
            style={{
              position: 'absolute',
              width: '100vw',
              top: fullHeaderRef.current?.offsetHeight,
              minHeight: 'fit-content',
              // 100vh
              height: `calc(80vh - ${fullHeaderRef.current?.offsetHeight}px)`,
              background: '#FFF',

              left: '0',
              zIndex: '1000000'
            }}
            ref={categoryListRefDesktop}
            className={`${styles.category__list__bottom__desktop}`}
          >
            <div className='container'>
              <CategoryesMenuDesktop
                categories={categoriesList}
                setCategoryListIsOpen={setCategoryListIsOpen}
                isOpen={categoryListIsOpen}
                onToggle={handleToggleCategories}
              />
              {/* <CategoryesMenuDesktop setCategoryListIsOpen={setCategoryListIsOpen} categories={categoriesList} /> */}
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header
