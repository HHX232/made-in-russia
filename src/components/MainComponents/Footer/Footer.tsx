import {CSSProperties, FC} from 'react'
import styles from './Footer.module.scss'
import Link from 'next/link'
import Image from 'next/image'
import {useTranslations} from 'next-intl'

const logoFavBig = '/logos/logo.svg'
// const logoFavSmall = '/logos/logo_fav.svg'

interface IFooterProps {
  extraClass?: string
  extraStyle?: CSSProperties
}

const Footer: FC<IFooterProps> = ({extraClass, extraStyle}) => {
  const t = useTranslations('Footer')
  return (
    <footer style={{...extraStyle}} className={`${styles.footer} ${extraClass}`}>
      <div className={`${styles.footer__inner} container`}>
        <Link href={'/'} className={`${styles.header__logo_box}`} itemScope itemType='https://schema.org/Organization'>
          <Image
            className={`${styles.bear__img}`}
            alt='Logo with Bear'
            src={logoFavBig}
            width={286}
            height={65}
            itemProp='logo'
          />
          {/* <Image
            className={`${styles.bear__img_min}`}
            alt='Logo with Bear'
            src={logoFavSmall}
            width={100}
            height={100}
            itemProp='logo'
          /> */}
          <meta itemProp='name' content='Exporteru' />
          <meta
            itemProp='url'
            content={typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}
          />
        </Link>
        <ul className={`${styles.footer__links}`}>
          <Link className={`${styles.footer__link}`} href={'/'}>
            <li>{t('ugreement')}</li>
          </Link>
          <Link className={`${styles.footer__link}`} href={'/'}>
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
