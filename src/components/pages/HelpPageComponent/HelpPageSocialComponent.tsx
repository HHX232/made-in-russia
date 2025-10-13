import {FC} from 'react'
import styles from './HelpPageSocialComponent.module.scss'
import Link from 'next/link'

const HelpPageSocialComponent: FC = () => {
  return (
    <div className={styles.contacts_social}>
      <h2 className={styles.contacts_social__title}>Контакты</h2>
      <div className={styles.contacts_social__grid}>
        <div className={styles.contacts_social__col}>
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_tg}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-tg'></use>
              </svg>
              <span>Telegram</span>
            </div>
            <div className={styles.contacts_social__nikname}>@made_in_russia</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_vk}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-vk'></use>
              </svg>
              <span>VK</span>
            </div>
            <div className={styles.contacts_social__nikname}>@made_in_russia</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_max}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-max'></use>
              </svg>
              <span>MAX</span>
            </div>
            <div className={styles.contacts_social__nikname}>@made_in_russia</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_wechat}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-wechat'></use>
              </svg>
              <span>WeChat</span>
            </div>
            <div className={styles.contacts_social__nikname}>@made-in-russia</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_email}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-email'></use>
              </svg>
              <span>E-mail</span>
            </div>
            <div className={styles.contacts_social__nikname}>info@mail.ru</div>
          </Link>
        </div>
        <div className={styles.contacts_social__col}>
          <Link href='#' className={styles.contacts_social__item}>
            <div className={styles.contacts_social__network}>
              <svg className={styles.contacts_social__icon_phone}>
                <use href='/iconsNew/symbol/sprite.svg#contacts-phone'></use>
              </svg>
              <span>Телефон</span>
            </div>
            <div className={styles.contacts_social__nikname}>info@mail.ru</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HelpPageSocialComponent
