'use client'
import {CSSProperties, FC} from 'react'
import styles from './Footer.module.scss'
import {Link} from '@/i18n/navigation'
import Image from 'next/image'
import {useTranslations} from 'next-intl'

const logoFavBig = '/logos/logoWithoutText.svg'

interface IFooterProps {
  extraClass?: string
  extraStyle?: CSSProperties
}

const Footer: FC<IFooterProps> = ({extraClass, extraStyle}) => {
  const t = useTranslations('Footer')

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
        </ul>
      </div>
    </footer>
  )
}

export default Footer
