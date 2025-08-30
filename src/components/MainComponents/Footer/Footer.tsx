'use client'
import {CSSProperties, FC} from 'react'
import styles from './Footer.module.scss'
import {Link} from '@/i18n/navigation'
import Image from 'next/image'
import {useTranslations} from 'next-intl'
import {usePathname} from 'next/navigation'

const logoFavBig = '/logos/logoWithoutText.svg'

interface IFooterProps {
  extraClass?: string
  extraStyle?: CSSProperties
}

const Breadcrumbs = () => {
  const pathname = usePathname()

  if (!pathname || pathname === '/') return null

  // Разбиваем путь на части и фильтруем пустые элементы
  const paths = pathname.split('/').filter((path) => path !== '')

  // Создаем массив хлебных крошек
  const breadcrumbs = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/')
    // Форматируем название: удаляем дефисы, делаем первую букву заглавной
    const label = path.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

    return {href, label}
  })

  return (
    <nav aria-label='Breadcrumb' className={styles.breadcrumbs}>
      <ol className={styles.breadcrumbs__list}>
        <li className={styles.breadcrumbs__item}>
          <Link href='/' className={styles.breadcrumbs__link}>
            Home
          </Link>
          <span className={styles.breadcrumbs__separator}>/</span>
        </li>
        {breadcrumbs.map(({href, label}, index) => (
          <li key={href} className={styles.breadcrumbs__item}>
            {index === breadcrumbs.length - 1 ? (
              <span className={styles.breadcrumbs__current} aria-current='page'>
                {label}
              </span>
            ) : (
              <>
                <Link href={href} className={styles.breadcrumbs__link}>
                  {label}
                </Link>
                <span className={styles.breadcrumbs__separator}>/</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

const Footer: FC<IFooterProps> = ({extraClass, extraStyle}) => {
  const t = useTranslations('Footer')

  return (
    <footer style={{...extraStyle}} className={`${styles.footer} ${extraClass}`}>
      <Breadcrumbs />

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
          <Link className={`${styles.footer__link}`} href={'/'}>
            <li>{t('contact')}</li>
          </Link>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
