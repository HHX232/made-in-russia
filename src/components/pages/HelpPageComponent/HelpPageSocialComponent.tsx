import {FC} from 'react'
import styles from './HelpPageSocialComponent.module.scss'
import Link from 'next/link'
import {useTranslations} from 'next-intl'

const HelpPageSocialComponent: FC = () => {
  const t = useTranslations('HelpPage.Social')

  return (
    <div className={styles.contacts_social}>
      <h2 className={styles.contacts_social__title}>{t('contacts')}</h2>
      <div className={styles.contacts_social__grid}>
        <div className={styles.contacts_social__col}>
          <Link href='https://t.me/exporteru' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_tg}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-tg'></use>
              </svg>
              <span>{t('telegram')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>@exporteru</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='https://vk.com/exporteru' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_vk}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-vk'></use>
              </svg>
              <span>{t('vk')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>@exporteru</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='https://wa.me/79859233888' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_whatsapp}>
                <use href='/iconsNew/contacts-whatsapp.svg#whatsapp'></use>
              </svg>
              <span>{t('whatsapp')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>+7-495-923-38-88</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='#wechat' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_wechat}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-wechat'></use>
              </svg>
              <span>{t('wechat')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>@exporteru</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='mailto:info@exporteru.com' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_email}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-email'></use>
              </svg>
              <span>{t('email')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>info@exporteru.com</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='tel:74959233888' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_phone}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-phone'></use>
              </svg>
              <span>{t('phone')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>+7-495-923-38-88</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HelpPageSocialComponent
