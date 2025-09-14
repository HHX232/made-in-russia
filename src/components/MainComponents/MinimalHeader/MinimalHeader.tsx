'use client'
import Image from 'next/image'
import styles from './MinimalHeader.module.scss'
import {useEffect, useRef, useState} from 'react'
import CategoryesMenuDesktop from '@/components/UI-kit/elements/CategoryesMenuDesktop/CategoryesMenuDesktop'
import CategoriesService, {Category} from '@/services/categoryes/categoryes.service'
import {useLocale, useTranslations} from 'next-intl'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'
import Link from 'next/link'
import createTelText from '@/utils/createTelText'
import createNewLangUrl from '@/utils/createNewLangUrl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {usePathname, useRouter} from 'next/navigation'
const insta = '/insta.svg'
const telephone = '/phone.svg'
const telegram = '/telegram.svg'
const setCookieLocale = (locale: string) => {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

enum Languages {
  RUSSIAN = 'Русский',
  ENGLISH = 'English',
  CHINA = '中文'
}
export type TLocale = 'ru' | 'en' | 'zh'
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
const logoFavBig = '/logos/logoWithoutText.svg'
const MinimalHeader = ({categories}: {categories?: Category[]}) => {
  const instagramUrl = `https://www.instagram.com/${process.env.NEXT_PUBLIC_INSTA || 'Exporteru'}`
  const telegramUrl = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM || 'Exporteru'}`
  const telephoneUrl = `tel:${process.env.NEXT_PUBLIC_TELEPHONE ? `7${process.env.NEXT_PUBLIC_TELEPHONE}` : '88005553535'}`
  const telephoneText = createTelText(process.env.NEXT_PUBLIC_TELEPHONE)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [linksItems, setLinksItems] = useState(['category', 'about-us', 'help'])
  const [menuIsOpen, setMenuIsOpen] = useState(false)
  const [categoryListIsOpen, setCategoryListIsOpen] = useState<boolean>(false)
  const fullHeaderRef = useRef<HTMLDivElement>(null)
  const categoryListRefDesktop = useRef<HTMLDivElement>(null)
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories || [])
  const t = useTranslations('MinimalHeader')
  const pathname = usePathname()
  const locale = useLocale()
  const [activeLanguage, setActiveLanguage] = useState<Languages>(
    localeToLanguage[locale as keyof typeof localeToLanguage]
  )
  const router = useRouter()
  const currentLang = useCurrentLanguage()
  useEffect(() => {
    async function rrrr() {
      const res = await CategoriesService.getAll(currentLang)
      setCategoriesList(res)
    }
    rrrr()
  }, [])

  // Обработчик клика вне области меню
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

  return (
    <div ref={fullHeaderRef} className={`${styles.header__box} `}>
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
          {/* <Image src={logoText} width={172} height={41} alt='logo Exporteru' /> */}
        </Link>
        <ul className={`${styles.header__list} ${styles.header__list__big}`}>
          {linksItems.map((el, i) => {
            if (el === 'delivery') {
              return (
                <DropList
                  key={'id5 contacts'}
                  extraClass={`${styles.extra__mobile__list}`}
                  direction='bottom'
                  gap='20'
                  color='white'
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
              )
            }
            return (
              <li
                onClick={() => {
                  if (i === 0) {
                    setCategoryListIsOpen((prev) => !prev)
                    // console.log(categoryListIsOpen)
                  }

                  // console.log('message')
                }}
                key={i}
                className={`${styles.header__list__item}`}
              >
                {i === 0 ? <div>{t(el)}</div> : <Link href={`${el}`}>{t(el)}</Link>}
              </li>
            )
          })}
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
              <p
                style={{width: '100%'}}
                onClick={() => {
                  setActiveLanguage(Languages.RUSSIAN)
                  setCookieLocale(languageToLocale[Languages.RUSSIAN])
                  router.refresh()
                }}
                key={1}
              >
                {Languages.RUSSIAN}
              </p>,
              <p
                style={{width: '100%'}}
                onClick={() => {
                  setActiveLanguage(Languages.ENGLISH)
                  setCookieLocale(languageToLocale[Languages.ENGLISH])
                  router.refresh()
                }}
                key={2}
              >
                {Languages.ENGLISH}
              </p>,
              <p
                style={{width: '100%'}}
                onClick={() => {
                  setActiveLanguage(Languages.CHINA)
                  setCookieLocale(languageToLocale[Languages.CHINA])
                  router.refresh()
                }}
                key={3}
              >
                {Languages.CHINA}
              </p>
            ]}
            trigger='hover'
          />
        </ul>

        <div className={`${styles.burger__menu} `}>
          <div style={{display: 'flex', alignItems: 'center', gap: '50px'}} className=''>
            <DropList
              closeOnMouseLeave={true}
              extraStyle={{zIndex: '99999'}}
              extraClass={`${styles.extra__header__language_box} ${styles.extra__header__language_box_2}`}
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
          </div>
          <div className={`${styles.burger__menu__list} ${menuIsOpen ? styles.burger__menu__list__active : ''}`}>
            <ul className={`${styles.header__list} ${styles.header__list__mini}`}>
              {linksItems.map((el, i) => {
                return (
                  <li
                    onClick={() => {
                      if (i === 0) {
                        setCategoryListIsOpen((prev) => !prev)
                        setMenuIsOpen(false)
                        // console.log(categoryListIsOpen)
                      }

                      // console.log('message')
                    }}
                    key={i}
                    className={`${styles.header__list__item}`}
                  >
                    {i === 0 ? <div>{t(el)}</div> : <Link href={`/${el}`}>{t(el)}</Link>}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
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
          <div style={{zIndex: '1000000000000000'}} className='container'>
            {/* Строка с крестиком справа */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '10px',
                paddingBottom: '0'
              }}
            >
              <button
                onClick={() => setCategoryListIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                  padding: '10px',
                  color: '#333',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                aria-label='Закрыть меню категорий'
              >
                ✕
              </button>
            </div>
            <CategoryesMenuDesktop setCategoryListIsOpen={setCategoryListIsOpen} categories={categoriesList} />
          </div>
        </div>
      )}
    </div>
  )
}

export default MinimalHeader
