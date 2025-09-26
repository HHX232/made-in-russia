'use client'
import {CSSProperties, FC, useTransition} from 'react'
import styles from './Footer.module.scss'
import Link from 'next/link'
import Image from 'next/image'
import {useTranslations} from 'next-intl'
import {setCookieLocale} from '../Header/Header'
import {useRouter} from 'next/navigation'
import {useActions} from '@/hooks/useActions'
// import {useTypedSelector} from '@/hooks/useTypedSelector'
// import {invalidateProductsCache, useProducts} from '@/hooks/useProducts'
// import {useQueryClient} from '@tanstack/react-query'

const logoFavBig = '/logos/logoWithoutText.svg'
export function getHaveLangStartFromCookie(): boolean {
  if (typeof document === 'undefined') return false // если вызов на сервере
  return document.cookie.split('; ').some((row) => row.startsWith('have_lang_in_start=have'))
}

interface IFooterProps {
  extraClass?: string
  extraStyle?: CSSProperties
}

const Footer: FC<IFooterProps> = ({extraClass, extraStyle}) => {
  const t = useTranslations('Footer')
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition()
  const {setCurrentLang} = useActions()

  return (
    <footer style={{...extraStyle}} className={`${styles.footer} ${extraClass}`}>
      {/* <Breadcrumbs /> */}

      <div className={`${styles.footer__inner} container`}>
        <Link href={'/'} className={`${styles.header__logo_box}`} itemScope itemType='https://schema.org/Organization'>
          <Image
            className={`${styles.bear__img}`}
            alt='Logo of Exporteru'
            src={logoFavBig}
            width={286}
            height={65}
            itemProp='logo'
          />
          <meta itemProp='name' content='Exporteru' />
          <meta itemProp='url' content={process.env.NEXT_PUBLIC_SITE_URL} />
        </Link>
        <ul className={`${styles.footer__links}`}>
          <Link className={`${styles.footer__link}`} href={'/terms'}>
            <li>{t('ugreement')}</li>
          </Link>
          <Link className={`${styles.footer__link}`} href={'/privacy'}>
            <li>{t('privacy')}</li>
          </Link>
          <Link className={`${styles.footer__link}`} href={'/help'}>
            <li>{t('contact')}</li>
          </Link>
          <a
            className={`${styles.footer__link}`}
            rel='nofollow'
            href='https://exporteru.com'
            onClick={(e) => {
              e.preventDefault()
              setCookieLocale('ru')
              setCurrentLang('ru')

              // invalidateProductsCache(queryClient)
              // forceRefetch()

              if (typeof window !== 'undefined') {
                const haveLangStart = getHaveLangStartFromCookie()
                console.log('haveLangStart', haveLangStart)
                if (!haveLangStart) {
                  window.location.href = 'https://exporteru.com'
                }
              }
              // window.location.reload()
              startTransition(() => {
                router.refresh()
              })
            }}
          >
            <span style={{maxHeight: 'fit-content'}}>exporteru.com</span>
          </a>
          <a
            className={`${styles.footer__link}`}
            rel='nofollow'
            href='https://en.exporteru.com'
            onClick={(e) => {
              e.preventDefault()
              setCookieLocale('en')
              setCurrentLang('en')

              // invalidateProductsCache(queryClient)
              // forceRefetch()
              if (typeof window !== 'undefined') {
                const haveLangStart = getHaveLangStartFromCookie()
                console.log('haveLangStart', haveLangStart)
                if (!haveLangStart) {
                  window.location.href = 'https://en.exporteru.com'
                }
              }
              // window.location.reload()
              startTransition(() => {
                router.refresh()
              })
            }}
          >
            <span style={{maxHeight: 'fit-content'}}>en.exporteru.com</span>
          </a>
          <a
            className={`${styles.footer__link}`}
            rel='nofollow'
            href='https://cn.exporteru.com'
            onClick={(e) => {
              e.preventDefault()
              setCookieLocale('zh')
              setCurrentLang('zh')

              // invalidateProductsCache(queryClient)
              // forceRefetch()
              if (typeof window !== 'undefined') {
                const haveLangStart = getHaveLangStartFromCookie()
                console.log('haveLangStart', haveLangStart)
                if (!haveLangStart) {
                  window.location.href = 'https://cn.exporteru.com'
                }
              }
              // window.location.reload()
              startTransition(() => {
                router.refresh()
              })
            }}
          >
            <span style={{maxHeight: 'fit-content'}}>cn.exporteru.com</span>
          </a>
        </ul>
        {/* <p>LAng from redux {currentLangValue}</p> */}
      </div>
    </footer>
  )
}

export default Footer
