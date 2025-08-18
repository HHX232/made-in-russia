'use client'
import Image from 'next/image'
import {FC, useEffect, useId, useRef, useState} from 'react'
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
import {usePathname, useRouter} from 'next/navigation'
import {useTranslations} from 'next-intl'
import createNewLangUrl from '@/utils/createNewLangUrl'
import {TLocale} from '../MinimalHeader/MinimalHeader'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'

const setCookieLocale = (locale: string) => {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

enum Languages {
  RUSSIAN = 'Русский',
  ENGLISH = 'English',
  CHINA = '中文'
}
const languageToLocale = {
  [Languages.RUSSIAN]: 'ru',
  [Languages.ENGLISH]: 'en',
  [Languages.CHINA]: 'zh'
}
const localeToLanguage = {
  ru: Languages.RUSSIAN,
  en: Languages.ENGLISH,
  zh: Languages.CHINA
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
  const telegramUrl = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM || 'Exporteru'}`
  const telephoneUrl = `tel:${process.env.NEXT_PUBLIC_TELEPHONE ? `${process.env.NEXT_PUBLIC_TELEPHONE}` : '88005553535'}`
  const telephoneText = createTelText(process.env.NEXT_PUBLIC_TELEPHONE)
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories || [])
  const [categoryListIsOpen, setCategoryListIsOpen] = useState<boolean>(false)
  const categoryListRefDesktop = useRef<HTMLDivElement>(null)
  const fullHeaderRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const id = useId()
  // ! Language
  const [activeLanguage, setActiveLanguage] = useState<Languages>(
    localeToLanguage[pathname.split('/')[1] as keyof typeof localeToLanguage]
  )
  const t = useTranslations('HomePage')

  const router = useRouter()
  const currentLang = useCurrentLanguage()
  useEffect(() => {
    async function rrrr() {
      const res = await CategoriesService.getAll(currentLang)
      setCategoriesList(res)
    }
    rrrr()
  }, [])

  const handleLanguageChange = (language: Languages) => {
    setActiveLanguage(language)
    const newLocale = languageToLocale[language] as TLocale
    setCookieLocale(newLocale)
    router.push(createNewLangUrl(newLocale, pathname))
  }
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Exporteru',
    url: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
    // TODO: заменить иконки на реальные СС
    sameAs: [instagramUrl, telegramUrl],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: process.env.NEXT_PUBLIC_TELEPHONE ? `${process.env.NEXT_PUBLIC_TELEPHONE}` : '+78005553535',
      contactType: 'customer service',
      availableLanguage: ['Russian', 'English', 'Chinese']
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
    '@type': 'Site-Navigation-Element',
    name: 'Main Navigation',
    url: [
      `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/categories`,
      // `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/contacts`,
      `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/about-us`
      // `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/help`
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
              <meta itemProp='url' content={process.env.NEXT_PUBLIC_SITE_URL} />
            </Link>

            <div className={`${styles.searchBox}`} role='search' aria-label='Поиск по сайту'>
              <SearchInputUI placeholder={t('search')} />
            </div>

            <div className={`${styles.main__middle_content}`}>
              <ProfileButtonUI />
              {/* <ShopButtonUI /> */}
              {/* <StarButtonUI /> */}

              <DropList
                closeOnMouseLeave={true}
                extraStyle={{zIndex: '1001'}}
                extraClass={`${styles.extra__header__language_box}`}
                color='white'
                title={activeLanguage}
                // direction='left'
                gap='5'
                safeAreaEnabled={true}
                positionIsAbsolute={false}
                items={[
                  <p style={{width: '100%'}} onClick={() => handleLanguageChange(Languages.RUSSIAN)} key={1}>
                    {Languages.RUSSIAN}
                  </p>,
                  <p style={{width: '100%'}} onClick={() => handleLanguageChange(Languages.ENGLISH)} key={2}>
                    {Languages.ENGLISH}
                  </p>,
                  <p style={{width: '100%'}} onClick={() => handleLanguageChange(Languages.CHINA)} key={3}>
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
                    title={<p>{t('category')}</p>}
                    extraStyle={{position: 'absolute', top: '-1000vh', left: '-1000vw', opacity: '0'}}
                    trigger='hover'
                    isOpen={true}
                    safeAreaEnabled
                    items={renderCategoryItems(categoriesList, true, 'bottom', '10', '', '', '', true)}
                  />

                  <button
                    id='cy-category-button'
                    onClick={() => {
                      // setCategoryListIsOpen((prev) => !prev)
                      handleToggleCategories()
                    }}
                  >
                    {t('category')}
                  </button>
                </div>
                <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                  <Link href='/reviews' itemProp='url'>
                    <span itemProp='name'>{t('reviews')}</span>
                  </Link>
                </li>
                <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                  <DropList
                    key={'id5 contacts'}
                    extraClass={`${styles.extra__mobile__list}`}
                    direction='bottom'
                    gap='20'
                    positionIsAbsolute={false}
                    trigger='hover'
                    title={t('contacts')}
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
                      <div key={id + 'telegram'} className={styles.header__top_item}>
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
                      <div key={id + 'telephone'} className={styles.header__top_item}>
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
                <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                  <Link href='/about-us' itemProp='url'>
                    <span itemProp='name'>{t('about')}</span>
                  </Link>
                </li>
                <li className={`${styles.bottom__list_item} ${styles.spec__bottom_el}`}>
                  <Link href='/help' itemProp='url'>
                    <span itemProp='name'>{t('help')}</span>
                  </Link>
                </li>
                <li className={`${styles.drop__bottom_list}`}>
                  <DropList
                    extraClass={`${styles.extra__bottom__header__list}`}
                    trigger='hover'
                    positionIsAbsolute={false}
                    title={t('more')}
                    items={[
                      <div key={'id1 comments'} className={`${styles.bottom__list_item}`}>
                        <Link href='/reviews'>{t('reviews')}</Link>
                      </div>,
                      <div key={'id2 delivery'} className={`${styles.bottom__list_item}`}>
                        <Link href='/delivery'>{t('delivery')}</Link>
                      </div>,
                      <div key={'id3 about'} className={`${styles.bottom__list_item}`}>
                        <Link href='/about'>{t('about')}</Link>
                      </div>,
                      <div key={'id4 help'} className={`${styles.bottom__list_item}`}>
                        <Link href='/help'>{t('help')}</Link>
                      </div>,

                      <DropList
                        key={'id5 contacts'}
                        extraClass={`${styles.extra__mobile__list}`}
                        direction='bottom'
                        gap='20'
                        safeAreaEnabled
                        trigger='hover'
                        title={t('contacts')}
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
                          <div key={id + 'telegram second'} className={styles.header__top_item}>
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
                          <div key={id + 'telephone second'} className={styles.header__top_item}>
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
                      <p
                        style={{width: '100%'}}
                        onClick={() => {
                          setActiveLanguage(Languages.RUSSIAN)
                          router.push(createNewLangUrl(languageToLocale[Languages.RUSSIAN] as TLocale, pathname))
                        }}
                        key={1}
                      >
                        {Languages.RUSSIAN}
                      </p>,
                      <p
                        style={{width: '100%'}}
                        onClick={() => {
                          setActiveLanguage(Languages.ENGLISH)
                          router.push(createNewLangUrl(languageToLocale[Languages.ENGLISH] as TLocale, pathname))
                        }}
                        key={2}
                      >
                        {Languages.ENGLISH}
                      </p>,
                      <p
                        style={{width: '100%'}}
                        onClick={() => {
                          setActiveLanguage(Languages.CHINA)
                          router.push(createNewLangUrl(languageToLocale[Languages.CHINA] as TLocale, pathname))
                        }}
                        key={3}
                      >
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
              zIndex: '1000000000000000'
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
