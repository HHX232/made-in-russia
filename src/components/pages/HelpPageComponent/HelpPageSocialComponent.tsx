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
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_tg}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-tg'></use>
              </svg>
              <span>{t('telegram')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>{t('username')}</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_vk}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-vk'></use>
              </svg>
              <span>{t('vk')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>{t('username')}</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_max}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-max'></use>
              </svg>
              <span>{t('max')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>{t('username')}</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_wechat}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-wechat'></use>
              </svg>
              <span>{t('wechat')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>{t('wechatUsername')}</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_email}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-email'></use>
              </svg>
              <span>{t('email')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>{t('emailAddress')}</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_phone}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-phone'></use>
              </svg>
              <span>{t('phone')}</span>
            </div>
            <div className={styles.contacts_social__nikname}>{t('emailAddress')}</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HelpPageSocialComponent
