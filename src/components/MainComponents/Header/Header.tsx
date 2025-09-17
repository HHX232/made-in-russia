'use client'
import Image from 'next/image'
import {FC, useEffect, useId, useRef, useState, useTransition} from 'react'
import styles from './Header.module.scss'
import createTelText from '@/utils/createTelText'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import ProfileButtonUI from '@/components/UI-kit/buttons/profileButtonUI/profileButtonUI'
import SearchInputUI from '@/components/UI-kit/inputs/SearchInputUI/SearchInputUI'
import BurgerMenu from '../BurgerMenu/BurgerMenu'
import Head from 'next/head'
import {Category, useCategories} from '@/services/categoryes/categoryes.service'
import CategoryesMenuDesktop from '@/components/UI-kit/elements/CategoryesMenuDesktop/CategoryesMenuDesktop'
import {useLocale, useTranslations} from 'next-intl'
import {TLocale} from '../MinimalHeader/MinimalHeader'
import {useRouter} from 'next/navigation'
import Link from 'next/link'

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
const insta = '/email.svg'
const telephone = '/phone.svg'
const telegram = '/telegram.svg'

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
    const currentPath = parentPath ? `${parentPath}/${category.slug}` : category.slug
    const dropListId = `category-${currentPath.replace(/\//g, '-')}`

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
  const id = useId()
  const locale = useLocale()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoriesFromHook = useCategories(locale as any)

  // Добавляем useTransition для плавного изменения языка
  const [isPending, startTransition] = useTransition()

  const [activeLanguage, setActiveLanguage] = useState<Languages>(
    localeToLanguage[locale as keyof typeof localeToLanguage]
  )
  const t = useTranslations('HomePage')
  const router = useRouter()

  useEffect(() => {
    setCategoriesList(categoriesFromHook?.data || [])
  }, [categoriesFromHook?.data])

  const handleLanguageChange = (language: Languages) => {
    const newLocale = languageToLocale[language] as TLocale

    // Устанавливаем куки
    setCookieLocale(newLocale)

    // Обновляем состояние (для UI)
    setActiveLanguage(language)

    // Используем startTransition для плавного перехода
    startTransition(() => {
      // Обновляем страницу, чтобы Next.js подхватил новые куки
      router.refresh()
    })
  }

  // Обновляем обработчики в dropdown элементах
  const languageDropdownItems = [
    <p
      style={{
        width: '100%',
        opacity: isPending ? 0.5 : 1,
        cursor: isPending ? 'wait' : 'pointer'
      }}
      onClick={() => !isPending && handleLanguageChange(Languages.RUSSIAN)}
      key={1}
    >
      {Languages.RUSSIAN} {isPending && activeLanguage === Languages.RUSSIAN}
    </p>,
    <p
      style={{
        width: '100%',
        opacity: isPending ? 0.5 : 1,
        cursor: isPending ? 'wait' : 'pointer'
      }}
      onClick={() => !isPending && handleLanguageChange(Languages.ENGLISH)}
      key={2}
    >
      {Languages.ENGLISH} {isPending && activeLanguage === Languages.ENGLISH}
    </p>,
    <p
      style={{
        width: '100%',
        opacity: isPending ? 0.5 : 1,
        cursor: isPending ? 'wait' : 'pointer'
      }}
      onClick={() => !isPending && handleLanguageChange(Languages.CHINA)}
      key={3}
    >
      {Languages.CHINA} {isPending && activeLanguage === Languages.CHINA}
    </p>
  ]

  // Остальная логика остается без изменений...
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Exporteru',
    url: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
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

  const navigationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Site-Navigation-Element',
    name: 'Main Navigation',
    url: [
      `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/categories`,
      `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/about-us`
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

    document.addEventListener('mousedown', handleClickOutside)
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

              <DropList
                closeOnMouseLeave={true}
                extraStyle={{zIndex: '1001'}}
                extraClass={`${styles.extra__header__language_box}`}
                color='white'
                title={isPending ? `${activeLanguage}` : activeLanguage}
                gap='5'
                safeAreaEnabled={true}
                positionIsAbsolute={false}
                items={languageDropdownItems}
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

                  <button id='cy-category-button' onClick={handleToggleCategories}>
                    {t('category')}
                  </button>
                </div>

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
                            style={{marginRight: '5px'}}
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
                      // <div key={'id2 delivery'} className={`${styles.bottom__list_item}`}>
                      //   <Link href='/delivery'>{t('delivery')}</Link>
                      // </div>,
                      <div key={'id3 about'} className={`${styles.bottom__list_item}`}>
                        <Link href='/about-us'>{t('about')}</Link>
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
                                style={{marginRight: '5px'}}
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
                    color='white'
                    title={isPending ? `${activeLanguage}` : activeLanguage}
                    gap='5'
                    safeAreaEnabled={true}
                    positionIsAbsolute={false}
                    items={languageDropdownItems}
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
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Header
