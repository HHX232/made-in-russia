/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import Image from 'next/image'
import {FC, useEffect, useRef, useState, useTransition} from 'react'
import styles from './Header.module.scss'
import createTelText from '@/utils/createTelText'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import ProfileButtonUI from '@/components/UI-kit/buttons/profileButtonUI/profileButtonUI'
import SearchInputUI from '@/components/UI-kit/inputs/SearchInputUI/SearchInputUI'
import Head from 'next/head'
import {Category, useCategories} from '@/services/categoryes/categoryes.service'
import CategoryesMenuDesktop from '@/components/UI-kit/elements/CategoryesMenuDesktop/CategoryesMenuDesktop'
import {useLocale, useTranslations} from 'next-intl'
import {TLocale} from '../MinimalHeader/MinimalHeader'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import MobileNavigation from '../MobileNavigation/MobileNavigation'

export const setCookieLocale = (locale: string) => {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

enum Languages {
  RUSSIAN = 'Русский',
  ENGLISH = 'English',
  CHINA = '中文',
  HINDI = 'हिन्दी'
}

const languageToLocale = {
  [Languages.RUSSIAN]: 'ru',
  [Languages.ENGLISH]: 'en',
  [Languages.CHINA]: 'zh',
  [Languages.HINDI]: 'hi'
}

const localeToLanguage = {
  ru: Languages.RUSSIAN,
  en: Languages.ENGLISH,
  zh: Languages.CHINA,
  hi: Languages.HINDI
}

const logoFavBig = '/logos/logoWithoutText.svg'
const logoFavSmall = '/logos/logo_fav.svg'

interface HeaderProps {
  isShowBottom?: boolean
  categories?: Category[]
  useSticky?: boolean
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
    const cleanSlug = category.slug.replace(/^l\d+_/, '')
    const currentPath = parentPath ? `${parentPath}/${cleanSlug}` : cleanSlug
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

const Header: FC<HeaderProps> = ({categories, useSticky = true}) => {
  const emailUrl = `mailto:${process.env.NEXT_PUBLIC_EMAIL || 'info@exporteru.com'}`
  const telegramUrl = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM || 'Exporteru'}`
  const telephoneUrl = `tel:${process.env.NEXT_PUBLIC_TELEPHONE ? `${process.env.NEXT_PUBLIC_TELEPHONE}` : '88005553535'}`
  const telephoneText = createTelText(process.env.NEXT_PUBLIC_TELEPHONE)
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories || [])
  const [categoryListIsOpen, setCategoryListIsOpen] = useState<boolean>(false)
  const [headerHeight, setHeaderHeight] = useState<number>(0)
  const categoryListRefDesktop = useRef<HTMLDivElement>(null)
  const catalogButtonRef = useRef<HTMLButtonElement>(null)
  const fullHeaderRef = useRef<HTMLDivElement>(null)
  const locale = useLocale()
  const categoriesFromHook = useCategories(locale as any)
  const {setCurrentLang} = useActions()
  const middleBoxRef = useRef<HTMLDivElement | null>(null)
  const topBoxRef = useRef<HTMLDivElement | null>(null)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)

  const {currentLangValue} = useTypedSelector((state) => state.currentLangSlice)
  const [isPending, startTransition] = useTransition()
  const [allFlags, setAllFlags] = useState({
    zh: '/countries/china.svg',
    ru: '/countries/russia.svg',
    en: '/countries/english.svg',
    hi: '/countries/hindy.svg'
  })
  const [activeLanguage, setActiveLanguage] = useState<Languages>(
    localeToLanguage[currentLangValue as keyof typeof localeToLanguage]
  )

  useEffect(() => {
    setCurrentLang(locale as any)
  }, [])

  const [maxHeight, setMaxHeight] = useState<number>(0)

  useEffect(() => {
    const updateMaxHeight = () => {
      if (!middleBoxRef.current || !topBoxRef.current) return
      const windowHeight = window.innerHeight
      const middleHeight = middleBoxRef.current.offsetHeight || 0
      const topHeight = topBoxRef.current.offsetHeight || 0
      const calculated = windowHeight - (middleHeight + topHeight)
      setMaxHeight(calculated > 0 ? calculated : 0)
    }

    updateMaxHeight()
    window.addEventListener('resize', updateMaxHeight)
    return () => window.removeEventListener('resize', updateMaxHeight)
  }, [categoryListIsOpen])

  useEffect(() => {
    setActiveLanguage(localeToLanguage[currentLangValue as keyof typeof localeToLanguage] as any)
  }, [currentLangValue])

  const t = useTranslations('HomePage')
  const router = useRouter()

  useEffect(() => {
    setCategoriesList(categoriesFromHook?.data || [])
  }, [categoriesFromHook?.data])

  // Отслеживаем высоту хедера
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (fullHeaderRef.current) {
        setHeaderHeight(fullHeaderRef.current.offsetHeight + 30)
      }
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)

    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
    }
  }, [])

  // Обновляем высоту при открытии/закрытии каталога
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fullHeaderRef.current) {
        setHeaderHeight(fullHeaderRef.current.offsetHeight + 30)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [categoryListIsOpen])

  // Блокируем скролл страницы при открытом каталоге
  useEffect(() => {
    if (categoryListIsOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [categoryListIsOpen])

  const handleLanguageChange = (language: Languages) => {
    const newLocale = languageToLocale[language] as TLocale
    setCookieLocale(newLocale)
    setActiveLanguage(language)

    // Закрываем выпадающее меню
    setIsLanguageDropdownOpen(false)

    startTransition(() => {
      router.refresh()
    })
  }

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
    </p>,
    <p
      style={{
        width: '100%',
        opacity: isPending ? 0.5 : 1,
        cursor: isPending ? 'wait' : 'pointer'
      }}
      onClick={() => !isPending && handleLanguageChange(Languages.HINDI)}
      key={4}
    >
      {Languages.HINDI} {isPending && activeLanguage === Languages.HINDI}
    </p>
  ]

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Exporteru',
    url: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
    sameAs: [emailUrl, telegramUrl],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: process.env.NEXT_PUBLIC_TELEPHONE ? `${process.env.NEXT_PUBLIC_TELEPHONE}` : '+74959233888',
      contactType: 'customer service',
      availableLanguage: ['Russian', 'English', 'Chinese', 'Hindi']
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
      const target = event.target as HTMLElement

      const isSearchInput =
        target.closest('[class*="SearchInputUI"]') ||
        target.closest('[class*="searchBox"]') ||
        target.closest('[class*="search__box"]') ||
        target.closest('[class*="new_search_box"]') ||
        target.closest('input[type="text"]') ||
        target.closest('input[placeholder]') ||
        target.closest('button[aria-label="Search"]') ||
        target.closest('button[aria-label="Clear search"]')

      if (
        categoryListIsOpen &&
        categoryListRefDesktop.current &&
        catalogButtonRef.current &&
        !categoryListRefDesktop.current.contains(event.target as Node) &&
        !catalogButtonRef.current.contains(event.target as Node) &&
        !isSearchInput
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
      {/* Подложка для компенсации высоты fixed header */}
      <div style={{height: `${headerHeight}px`}} />

      {/* Fixed Header */}
      <div
        style={{
          position: true ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1010000000
        }}
        className={`${styles.header}`}
      >
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

        <div ref={topBoxRef} className={` ${styles.header__top} container`}>
          <nav className={`${styles.header__nav}`}>
            <ul>
              <li>
                <Link href='/profile' className={`${styles.header__link}`}>
                  {t('reviews')}
                </Link>
              </li>
              <li>
                <Link href='/help' className={`${styles.header__link}`}>
                  {t('contacts')}
                </Link>
              </li>
              <li>
                <Link href='/about-us' className={`${styles.header__link}`}>
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href='/help' className={`${styles.header__link}`}>
                  {t('help')}
                </Link>
              </li>
            </ul>
          </nav>
          <div className={`${styles.header__contacts}`}>
            <a className={`${styles.header__phone}`} href={telephoneUrl}>
              {telephoneText}
            </a>
          </div>
        </div>

        <header ref={fullHeaderRef} className={`${styles.header}`} itemScope itemType='https://schema.org/WPHeader'>
          <div ref={middleBoxRef} className={`${styles.middle__header}`}>
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
                <svg
                  className={`${styles.bear__img_min}`}
                  width='240'
                  height='25'
                  viewBox='0 0 240 25'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M112.567 6.71457C112.154 5.02985 111.101 3.5724 109.632 2.65169C107.752 1.60346 105.615 1.1065 103.465 1.21774C101.161 1.17079 98.8756 1.6312 96.7693 2.56636C94.8908 3.43536 93.2644 4.76899 92.0438 6.44143C90.7257 8.30497 89.8053 10.4202 89.3398 12.6552C88.9558 14.2117 88.8233 15.8196 88.9475 17.418C89.0514 18.7471 89.5046 20.0251 90.2611 21.1224C91.0625 22.1925 92.1467 23.0173 93.3915 23.5038C94.9521 24.1058 96.6156 24.3958 98.2877 24.3573C100.077 24.3786 101.857 24.1076 103.559 23.555C105.07 23.0652 106.467 22.2788 107.67 21.2419C108.853 20.2061 109.851 18.9765 110.622 17.6058C111.452 16.1203 112.061 14.5216 112.43 12.8601C112.968 10.8523 113.015 8.74431 112.567 6.71457ZM99.0724 20.2006C98.1032 20.2626 97.1438 19.9749 96.3684 19.3897C95.703 18.7522 95.3037 17.886 95.251 16.9656C95.1434 15.5806 95.2674 14.1873 95.6178 12.843C95.9242 11.3899 96.4414 9.98946 97.1532 8.68626C97.7082 7.64946 98.5148 6.76893 99.4989 6.12562C100.463 5.54511 101.572 5.24922 102.698 5.27208C104.446 5.27208 105.598 5.86956 106.11 7.05598C106.621 8.24241 106.647 10.1714 106.11 12.6552C105.803 14.1167 105.292 15.5275 104.591 16.8461C104.042 17.8628 103.244 18.7233 102.271 19.347C101.304 19.922 100.197 20.2175 99.0724 20.2006Z'
                    fill='white'
                  />
                  <path
                    d='M165.511 1.55917H145.986L145.039 5.69035H152.631L148.366 24.3403H153.594L157.859 5.69035H161.271C162.214 5.68945 163.128 5.36918 163.865 4.78174C164.603 4.1943 165.12 3.37432 165.332 2.45541L165.511 1.55917Z'
                    fill='white'
                  />
                  <path
                    d='M180.242 14.5757L184.14 10.4787H174.561L175.678 5.63059H186.033L186.963 1.56772H171.379L166.253 23.8964L166.15 24.3403H179.713L184.763 20.2433H172.317L173.623 14.5757H180.242Z'
                    fill='white'
                  />
                  <path
                    d='M237.708 1.55917C236.573 1.56431 235.472 1.94698 234.578 2.64694C233.684 3.3469 233.048 4.32442 232.77 5.42573L230.134 16.0609C229.942 16.9376 229.602 17.7748 229.127 18.5362C228.759 19.1156 228.219 19.566 227.583 19.825C226.875 20.0897 226.122 20.2171 225.366 20.2006C224.914 20.2522 224.457 20.2082 224.023 20.0715C223.59 19.9347 223.19 19.7083 222.849 19.4068C222.389 18.8691 222.355 17.8107 222.739 16.2487L226.27 1.99449L226.381 1.55917H224.675C223.537 1.56291 222.433 1.94593 221.537 2.6477C220.641 3.34947 220.004 4.32996 219.727 5.43427L216.921 16.7096C216.333 19.0995 216.682 20.9773 217.979 22.3259C219.275 23.6745 221.433 24.3403 224.436 24.3403C226.27 24.3889 228.097 24.0996 229.827 23.4867C231.269 22.9503 232.56 22.0716 233.588 20.9261C234.573 19.7945 235.269 18.4416 235.619 16.9827L239.321 2.0457L239.431 1.61041L237.708 1.55917Z'
                    fill='white'
                  />
                  <path
                    d='M135.64 1.5677H120.645L115.527 23.905L115.416 24.3232H116.602C117.727 24.3226 118.82 23.9398 119.7 23.2374C120.58 22.5351 121.196 21.5547 121.447 20.4566L124.637 6.578H124.731H125.268H134.472C134.752 6.55946 135.033 6.61054 135.289 6.72669C135.545 6.84283 135.768 7.02045 135.939 7.24377C136.123 7.60865 136.225 8.00969 136.236 8.41833C136.248 8.82697 136.17 9.23319 136.007 9.6081C135.615 10.7689 134.676 11.9383 133.448 11.9383H124.449L124.799 12.4845C127.153 16.1548 131.742 23.2392 132.245 23.8282L132.348 23.9476H132.476C133.602 23.9476 135.367 23.9476 136.647 23.9476H138.532L138.097 23.3758C137.031 21.9504 135.018 19.2275 133.405 16.8376C136.894 16.4365 139.376 13.9697 140.502 9.6081C140.997 7.77298 141.057 5.18674 139.76 3.41991C139.277 2.79733 138.649 2.30286 137.931 1.97991C137.213 1.65697 136.426 1.51543 135.64 1.5677Z'
                    fill='white'
                  />
                  <path
                    d='M208.715 1.56771H193.728L188.61 23.905L188.508 24.3488H189.813C190.905 24.3493 191.964 23.9788 192.818 23.2981C193.672 22.6173 194.269 21.6667 194.513 20.6018L197.729 6.60362H197.822H198.36H207.538C207.818 6.58508 208.099 6.63615 208.355 6.7523C208.611 6.86845 208.834 7.04607 209.005 7.26938C209.192 7.63354 209.294 8.0348 209.306 8.44384C209.318 8.85288 209.238 9.2594 209.073 9.63372C208.689 10.7945 207.743 11.9639 206.514 11.9639H197.524L197.882 12.5102C200.236 16.1804 204.817 23.2648 205.32 23.8538L205.422 23.9732H205.585C206.71 23.9732 208.476 23.9732 209.756 23.9732H211.641L211.206 23.4014C210.139 21.976 208.135 19.2532 206.514 16.8632C210.012 16.4621 212.485 13.9953 213.62 9.63372C214.106 7.7986 214.166 5.21236 212.878 3.44552C212.392 2.81372 211.758 2.31171 211.032 1.98412C210.306 1.65653 209.51 1.5135 208.715 1.56771Z'
                    fill='white'
                  />
                  <path
                    d='M45.3339 24.1866C37.657 11.0762 26.5682 5.81837 18.2687 3.3943C10.3956 1.53357 6.23309 1.61039 5.65306 1.60185C5.65306 1.96888 0.936059 22.5137 0.535156 24.1269C0.613249 24.1486 0.693214 24.1629 0.773991 24.1696H16.4689L21.6294 20.1323H6.78752C6.96664 19.3556 7.6405 16.3682 7.85375 15.4805C8.03287 14.7464 8.25466 14.6269 8.86027 14.6269H14.0294C14.5601 14.6068 15.062 14.3801 15.4282 13.9953L19.6932 10.5299H9.04793C9.21853 9.83001 10.0118 6.48411 10.1142 5.85249C10.2165 5.22086 10.3786 5.16113 10.8392 5.16966C16.1277 5.04163 26.9009 7.42302 33.0168 15.5744L22.0986 24.1098H22.8407C24.5466 24.1098 26.1076 24.1781 27.9586 24.1525C29.929 24.1525 30.7734 23.8708 32.5391 22.5393C33.6736 21.5919 36.0705 19.7994 36.0705 19.7994C36.0705 19.7994 37.3158 21.976 37.8447 23.0685C37.9502 23.408 38.1683 23.7013 38.463 23.8999C38.7577 24.0986 39.1113 24.1907 39.4653 24.161L45.3339 24.1866Z'
                    fill='#E1251B'
                  />
                  <path
                    d='M44.4467 11.7761C49.0017 8.3619 53.2069 5.0587 57.8301 1.57624C57.7089 1.55169 57.5865 1.53459 57.4633 1.52503C54.7849 1.52503 53.9234 1.52503 51.245 1.52503C49.9279 1.47971 48.6453 1.95142 47.671 2.83947C44.7879 5.00747 45.658 4.32464 40.3183 8.28508C37.6399 6.62921 21.9962 -0.79663 5.90039 0.227623C10.6259 0.150804 19.9149 1.18359 30.3213 6.06586C34.405 8.10266 38.2355 10.6122 41.7342 13.5429C45.2037 16.6918 48.2772 20.2517 50.8868 24.1439H53.1472H53.4457H55.8596C52.4818 19.2531 48.9931 15.0878 44.4467 11.7761Z'
                    fill='white'
                  />
                  <path
                    d='M84.9887 3.57352C84.5045 2.94282 83.8717 2.44199 83.1468 2.11579C82.4219 1.7896 81.6275 1.64821 80.8347 1.70426H65.336L60.0645 23.7684L59.9707 24.2122H61.1478C62.2739 24.2131 63.3669 23.8309 64.2473 23.1283C65.1277 22.4257 65.7432 21.4445 65.9928 20.3457L66.9566 16.9315L78.634 16.9912C82.1227 16.5901 84.6049 14.1233 85.7308 9.76172C86.2256 7.9266 86.2852 5.34036 84.9887 3.57352ZM81.2015 9.73612C80.8091 10.8969 79.8623 12.0663 78.6425 12.0663H68.3214L69.8312 6.72311H69.925H70.4624H79.6661C79.9465 6.70456 80.2272 6.75564 80.4832 6.87179C80.7391 6.98794 80.9624 7.16556 81.1332 7.38887C81.3149 7.75149 81.4151 8.14947 81.4269 8.55494C81.4387 8.9604 81.3618 9.36354 81.2015 9.73612Z'
                    fill='white'
                  />
                </svg>

                <meta itemProp='name' content='Exporteru' />
                <meta itemProp='url' content={process.env.NEXT_PUBLIC_SITE_URL} />
              </Link>

              <div className={styles.catalog_search_box}>
                <button
                  ref={catalogButtonRef}
                  id='catalog-btn'
                  className={`${styles.btn_catalog} ${categoryListIsOpen ? styles.btn_catalog_active : ''}`}
                  aria-label='Каталог'
                  onClick={handleToggleCategories}
                >
                  <span className={`${styles.btn_catalog__burger} ${categoryListIsOpen ? styles.active : ''}`}>
                    <span></span>
                  </span>
                  <span className={`${styles.btn_catalog__name}`}>{t('catalog')}</span>
                </button>

                <div className={`${styles.searchBox}`} role='search' aria-label='Поиск по сайту'>
                  <SearchInputUI placeholder={t('search')} />
                </div>
              </div>
              <div className={`${styles.main__middle_content}`}>
                <ProfileButtonUI extraClass={styles.hyde_profile} />

                <DropList
                  closeOnMouseLeave={true}
                  isOpen={isLanguageDropdownOpen}
                  onOpenChange={setIsLanguageDropdownOpen}
                  hideOnWindowScroll={true}
                  extraStyle={{zIndex: '1001'}}
                  arrowClassName={styles.hide_arrow}
                  extraClass={`${styles.extra__header__language_box}`}
                  extraListClass={styles.extra__dropListStyle}
                  color='white'
                  title={
                    <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                      <Image
                        src={(allFlags as any)[languageToLocale?.[activeLanguage]]}
                        alt={languageToLocale?.[activeLanguage]}
                        style={{
                          minWidth: '30px',
                          minHeight: '20px',
                          marginBottom: activeLanguage === 'हिन्दी' ? '5px' : ''
                        }}
                        width={34}
                        height={24}
                        className={styles.lang__button__img}
                      />
                      <p className={styles.active_lang_text} style={{color: 'white'}}>
                        {activeLanguage}
                      </p>
                    </div>
                  }
                  gap='5'
                  safeAreaEnabled={true}
                  positionIsAbsolute={false}
                  items={languageDropdownItems}
                  trigger='hover'
                />
              </div>
            </div>
          </div>

          {categoryListIsOpen && (
            <div
              ref={categoryListRefDesktop}
              style={{
                height: maxHeight,
                overflow: 'auto'
              }}
              className={`${styles.exp_catalog} ${categoryListIsOpen ? styles.active : ''}`}
            >
              <div
                style={{
                  height: 'fit-content',
                  maxHeight: maxHeight,
                  overflowY: 'scroll'
                }}
                className={`container ${styles.exp_catalog__container__class}`}
              >
                <div className={styles.new_search_box}>
                  <SearchInputUI placeholder={t('search')} />
                </div>
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
      </div>
      <MobileNavigation />
    </>
  )
}

export default Header
