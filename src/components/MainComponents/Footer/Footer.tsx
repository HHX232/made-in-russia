import {FC} from 'react'
import styles from './Footer.module.scss'
import Link from 'next/link'
const Footer: FC = () => {
  return (
    <footer className={`${styles.footer}`}>
      <div className={`${styles.footer__inner} container`}>
        <Link className={`${styles.footer__link}`} href={'/'}>
          Пользовательское соглашение
        </Link>
        <Link className={`${styles.footer__link}`} href={'/'}>
          Политика конфиденциальности
        </Link>
        <Link className={`${styles.footer__link}`} href={'/'}>
          Связаться с нами
        </Link>
      </div>
    </footer>
  )
}

export default Footer
