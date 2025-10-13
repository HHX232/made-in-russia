'use client'
import {CSSProperties, FC} from 'react'
import styles from './Footer.module.scss'
import Link from 'next/link'
import Image from 'next/image'

export function getHaveLangStartFromCookie(): boolean {
  if (typeof document === 'undefined') return false // если вызов на сервере
  return document.cookie.split('; ').some((row) => row.startsWith('have_lang_in_start=have'))
}

interface IFooterProps {
  extraClass?: string
  extraStyle?: CSSProperties
}

const Footer: FC<IFooterProps> = ({extraClass, extraStyle}) => {
  return (
    <footer style={{...extraStyle}} className={`${styles.footer} ${extraClass}`}>
      <div className={`container`}>
        <div className={`${styles.footer__top}`}>
          <div className={`${styles.footer__item}`}>
            <h3 className={`${styles.footer__title}`}>Основные разделы</h3>

            <div className={`${styles.footer__item_row}`}>
              <ul className={`${styles.footer__list}`}>
                <li>
                  <Link className={`${styles.footer__link}`} href='/'>
                    Главная
                  </Link>
                </li>
                <li>
                  <Link className={`${styles.footer__link}`} href='/'>
                    Каталог
                  </Link>
                </li>
                <li>
                  <Link className={`${styles.footer__link}`} href='/help'>
                    Помощь
                  </Link>
                </li>
              </ul>

              <ul className={`${styles.footer__list}`}>
                <li>
                  <Link className={`${styles.footer__link}`} href='/about-us'>
                    О нас
                  </Link>
                </li>
                <li>
                  <Link className={`${styles.footer__link}`} href='/about-us'>
                    Контакты
                  </Link>
                </li>
                <li>
                  <Link className={`${styles.footer__link}`} href='/'>
                    Отзывы
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className={`${styles.footer__item}`}>
            <h3 className={`${styles.footer__title}`}>Техническая поддержка</h3>
            <ul className={`${styles.footer__list}`}>
              <li>
                <Link className={`${styles.footer__link}`} href='tel:89991234567'>
                  <svg className={`${styles.icon} ${styles.icon__phone}`}>
                    <use href='/iconsNew/symbol/sprite.svg#phone'></use>
                  </svg>
                  <span>8 999 123 45 67</span>
                </Link>
              </li>
              <li>
                <Link className={`${styles.footer__link}`} href='mailto:info@mail.ru'>
                  <svg className={`${styles.icon} ${styles.icon__email}`}>
                    <use href='/iconsNew/symbol/sprite.svg#email'></use>
                  </svg>
                  <span>info@mail.ru</span>
                </Link>
              </li>
              <li>
                <Link className={`${styles.footer__link}`} href='https://t.me/made_in_russia' target='_blank'>
                  <svg className={`${styles.icon} ${styles.icon__tg}`}>
                    <use href='/iconsNew/symbol/sprite.svg#tg'></use>
                  </svg>
                  <span>made_in_russia</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className={`${styles.footer__item}`}>
            <h3 className={`${styles.footer__title}`}>Информационный центр</h3>
            <ul className={`${styles.footer__list}`}>
              <li>
                <Link href='/terms' className={`${styles.footer__link}`}>
                  Правовая информация
                </Link>
              </li>
            </ul>
          </div>

          <div className={`${styles.footer__item}`}>
            <h3 className={`${styles.footer__title}`}>Мой профиль</h3>
            <ul className={`${styles.footer__list}`}>
              <li>
                <Link href='/login' className={`${styles.footer__link}`}>
                  Войти в личный кабинет
                </Link>
              </li>
              <li>
                <Link href='/register' className={`${styles.footer__link}`}>
                  Регистрация
                </Link>
              </li>
            </ul>
          </div>

          <div className={`${styles.footer__item} ${styles.footer__item_social}`}>
            <h3 className={`${styles.footer__title} ${styles.footer__title_social}`}>Социальные сети</h3>
            <div className={`${styles.footer__social}`}>
              <Link
                href='#'
                className={`${styles.footer__social_link} ${styles.footer__social_link_vk}`}
                aria-label='VK'
              >
                <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    className={`${styles.soc_vk_tile}`}
                    d='M0 8.64C0 4.566 0 2.532 1.26 1.26C2.538 0 4.572 0 8.64 0H9.36C13.434 0 15.468 0 16.74 1.26C18 2.538 18 4.572 18 8.64V9.36C18 13.434 18 15.468 16.74 16.74C15.462 18 13.428 18 9.36 18H8.64C4.566 18 2.532 18 1.26 16.74C0 15.462 0 13.428 0 9.36V8.64Z'
                  />
                  <path
                    className={`${styles.soc_vk_char}`}
                    d='M9.57662 12.966C5.47262 12.966 3.13262 10.158 3.03662 5.47805H5.10062C5.16662 8.91005 6.67862 10.362 7.87862 10.662V5.47805H9.81662V8.43605C10.9986 8.31005 12.2466 6.96005 12.6666 5.47205H14.5986C14.4411 6.24231 14.1264 6.9718 13.6742 7.61496C13.2221 8.25812 12.6421 8.80113 11.9706 9.21005C12.72 9.58302 13.3818 10.1106 13.9123 10.758C14.4429 11.4055 14.8302 12.158 15.0486 12.966H12.9186C12.4626 11.544 11.3226 10.44 9.81662 10.29V12.966H9.58262H9.57662Z'
                  />
                </svg>
              </Link>

              <Link
                href='#'
                className={`${styles.footer__social_link} ${styles.footer__social_link_tg}`}
                aria-label='Telegram'
              >
                <svg width='18' height='16' viewBox='0 0 18 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    className={`${styles.soc_tg_char}`}
                    d='M1.23741 6.96334C6.06923 4.85819 9.29121 3.47034 10.9033 2.7998C15.5063 0.885282 16.4627 0.552709 17.0861 0.54161C17.2232 0.539312 17.5298 0.573292 17.7284 0.734429C17.8961 0.87049 17.9422 1.05429 17.9643 1.18329C17.9864 1.31229 18.0139 1.60616 17.992 1.83578C17.7426 4.45661 16.6633 10.8167 16.1142 13.7521C15.8818 14.9941 15.4244 15.4106 14.9815 15.4513C14.0189 15.5399 13.288 14.8152 12.3558 14.2041C10.897 13.2479 10.0729 12.6526 8.65691 11.7195C7.02048 10.6411 8.08131 10.0484 9.0139 9.07979C9.25797 8.8263 13.4988 4.9689 13.5809 4.61897C13.5912 4.57521 13.6007 4.41207 13.5038 4.32593C13.4069 4.23979 13.2639 4.26925 13.1606 4.29268C13.0143 4.32589 10.6839 5.86621 6.16938 8.91364C5.5079 9.36786 4.90875 9.58918 4.37193 9.57758C3.78013 9.56479 2.64175 9.24297 1.79548 8.96788C0.757494 8.63047 -0.0674757 8.45208 0.00436067 7.87906C0.0417775 7.58059 0.452793 7.27535 1.23741 6.96334Z'
                  />
                </svg>
              </Link>

              <Link
                href='#'
                className={`${styles.footer__social_link} ${styles.footer__social_link_whatsapp}`}
                aria-label='WhatsApp'
              >
                <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    className={`${styles.soc_whatsapp_char}`}
                    clipRule='evenodd'
                    d='M15.3 2.5875C13.6125 0.9 11.3625 0 9 0C4.05 0 0 4.05 0 9C0 10.575 0.450007 12.15 1.23751 13.5L0 18L4.72501 16.7625C6.07501 17.4375 7.5375 17.8875 9 17.8875C13.95 17.8875 18 13.8375 18 8.8875C18 6.525 16.9875 4.275 15.3 2.5875ZM9 16.425C7.65 16.425 6.30001 16.0875 5.17501 15.4125L4.94999 15.3L2.13749 16.0875L2.92501 13.3875L2.69999 13.05C1.91249 11.8125 1.57499 10.4625 1.57499 9.1125C1.57499 5.0625 4.95 1.6875 9 1.6875C11.025 1.6875 12.825 2.475 14.2875 3.825C15.75 5.2875 16.425 7.0875 16.425 9.1125C16.425 13.05 13.1625 16.425 9 16.425ZM13.05 10.8C12.825 10.6875 11.7 10.125 11.475 10.125C11.25 10.0125 11.1375 10.0125 11.025 10.2375C10.9125 10.4625 10.4625 10.9125 10.35 11.1375C10.2375 11.25 10.125 11.25 9.89999 11.25C9.67499 11.1375 9.00001 10.9125 8.10001 10.125C7.42501 9.5625 6.97501 8.775 6.86251 8.55C6.75001 8.325 6.86251 8.2125 6.97501 8.1C7.08751 7.9875 7.2 7.875 7.3125 7.7625C7.425 7.65 7.42501 7.5375 7.53751 7.425C7.65001 7.3125 7.53751 7.2 7.53751 7.0875C7.53751 6.975 7.08751 5.85 6.86251 5.4C6.75001 5.0625 6.52501 5.0625 6.41251 5.0625C6.30001 5.0625 6.18749 5.0625 5.96249 5.0625C5.84999 5.0625 5.62499 5.0625 5.39999 5.2875C5.17499 5.5125 4.61251 6.075 4.61251 7.2C4.61251 8.325 5.39999 9.3375 5.51249 9.5625C5.62499 9.675 7.08749 12.0375 9.33749 12.9375C11.25 13.725 11.5875 13.5 12.0375 13.5C12.4875 13.5 13.3875 12.9375 13.5 12.4875C13.725 11.925 13.725 11.475 13.6125 11.475C13.5 10.9125 13.275 10.9125 13.05 10.8Z'
                  />
                </svg>
              </Link>

              <Link
                href='#'
                className={`${styles.footer__social_link} ${styles.footer__social_link_max}`}
                aria-label='Max'
              >
                <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <rect className={`${styles.soc_max_tile}`} width='18' height='18' rx='6' />
                  <path
                    className={`${styles.soc_max_char}`}
                    clipRule='evenodd'
                    d='M9.12892 14.9658C7.95127 14.9658 7.404 14.7931 6.45271 14.1024C5.85099 14.8794 3.94556 15.4866 3.86246 14.4478C3.86246 13.6679 3.69054 13.0089 3.4957 12.2894C3.26361 11.4031 3 10.416 3 8.98576C3 5.56985 5.79082 3 9.0974 3C12.4068 3 15 5.69647 15 9.01741C15.0111 12.287 12.3843 14.9483 9.12892 14.9658ZM9.17763 5.95259C7.56732 5.86913 6.31231 6.98859 6.03437 8.74402C5.80515 10.1973 6.21202 11.9671 6.55873 12.0592C6.72492 12.0995 7.14325 11.7599 7.404 11.498C7.83515 11.7972 8.33723 11.9769 8.85958 12.0189C10.5281 12.0995 11.9538 10.8237 12.0659 9.14979C12.1311 7.47229 10.8464 6.05146 9.17763 5.95547L9.17763 5.95259Z'
                  />
                </svg>
              </Link>

              <Link
                href='#'
                className={`${styles.footer__social_link} ${styles.footer__social_link_wechat}`}
                aria-label='WeChat'
              >
                <svg width='24' height='20' viewBox='0 0 24 20' xmlns='http://www.w3.org/2000/svg'>
                  <g clipPath='url(#clip0_365_10265)'>
                    <path
                      className={`${styles.soc_wechat_char_1}`}
                      clipRule='evenodd'
                      d='M0.5 7.56534C0.5 9.68611 1.6293 11.6211 3.3773 12.9025C3.5314 13.0084 3.6096 13.1635 3.6096 13.3728C3.6096 13.4245 3.5843 13.5045 3.5843 13.5562C3.4555 14.0805 3.2255 14.9434 3.1979 14.9692C3.1726 15.0468 3.1473 15.1009 3.1473 15.1785C3.1473 15.336 3.2761 15.4653 3.4302 15.4653C3.4808 15.4653 3.5337 15.4395 3.5843 15.4136L5.4082 14.3415C5.537 14.2639 5.6911 14.2098 5.8452 14.2098C5.9234 14.2098 6.0246 14.2098 6.1028 14.2357C6.9515 14.4967 7.8761 14.6283 8.826 14.6283C13.4237 14.6283 17.1497 11.4613 17.1497 7.56299C17.1497 3.66471 13.4237 0.5 8.8237 0.5C4.2237 0.5 0.5 3.66706 0.5 7.56534Z'
                    />
                    <path
                      className={`${styles.soc_wechat_char_2}`}
                      clipRule='evenodd'
                      d='M16.5793 18.7899C17.3728 18.7899 18.1433 18.6841 18.8356 18.4725C18.8862 18.4466 18.9644 18.4466 19.0403 18.4466C19.1691 18.4466 19.2956 18.4984 19.3991 18.5524L20.9102 19.4482C20.9608 19.4741 20.9861 19.5 21.039 19.5C21.1655 19.5 21.269 19.3942 21.269 19.2648V19.2625C21.269 19.2108 21.2437 19.1567 21.2437 19.0791C21.2437 19.0532 21.039 18.3408 20.9355 17.8918C20.9102 17.84 20.9102 17.7859 20.9102 17.7342C20.9102 17.5767 20.9861 17.445 21.1149 17.3392C22.5754 16.2577 23.4977 14.6495 23.4977 12.8578C23.4977 9.58968 20.3973 6.92578 16.577 6.92578C12.7567 6.92578 9.66089 9.56147 9.66089 12.8578C9.66089 16.126 12.7613 18.7899 16.5793 18.7899Z'
                    />
                    <path
                      className={`${styles.soc_wechat_eye_1}`}
                      clipRule='evenodd'
                      d='M7.11947 5.28471C7.11947 5.89602 6.64567 6.37802 6.04997 6.37802C5.45427 6.37802 4.98047 5.89367 4.98047 5.28471C4.98047 4.67575 5.45427 4.19141 6.04997 4.19141C6.64567 4.19141 7.11947 4.6734 7.11947 5.28471ZM12.6694 5.28471C12.6694 5.89602 12.1956 6.37802 11.5999 6.37802C11.0042 6.37802 10.5281 5.89367 10.5281 5.28471C10.5281 4.67575 11.0019 4.19141 11.5976 4.19141C12.1933 4.19141 12.6694 4.6734 12.6694 5.28471Z'
                    />
                    <path
                      className={`${styles.soc_wechat_eye_2}`}
                      clipRule='evenodd'
                      d='M18.0169 11.0263C18.0169 11.5576 18.4332 11.9832 18.953 11.9832C19.4728 11.9832 19.8891 11.5576 19.8891 11.0263C19.8891 10.4949 19.4728 10.0693 18.953 10.0693C18.4332 10.0693 18.0169 10.4949 18.0169 11.0263ZM13.4031 11.0263C13.4031 11.5576 13.8194 11.9832 14.3392 11.9832C14.859 11.9832 15.2753 11.5576 15.2753 11.0263C15.2753 10.4949 14.859 10.0693 14.3392 10.0693C13.8194 10.0693 13.4031 10.4949 13.4031 11.0263Z'
                    />
                  </g>
                  <defs>
                    <clipPath id='clip0_365_10265'>
                      <rect width='23' height='19' transform='translate(0.5 0.5)' />
                    </clipPath>
                  </defs>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className={`${styles.footer__bottom}`}>
          <Link href='main.html' className={`${styles.footer__logo}`}>
            <Image src='/imagesNew/logo.png' width={190} height={70} alt='Logo' />
          </Link>
          <p className={`${styles.footer__copyright}`}>© 2021-2025 Exportru</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
