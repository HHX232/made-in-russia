'use client'
import {CSSProperties, FC, useEffect, useState, useTransition} from 'react'
import styles from './Footer.module.scss'
import Link from 'next/link'
import Image from 'next/image'
import {useTranslations} from 'next-intl'
import {useActions} from '@/hooks/useActions'
import {setCookieLocale} from '../Header/Header'
import {useRouter} from 'next/navigation'

export function getHaveLangStartFromCookie(): boolean {
  if (typeof document === 'undefined') return false // если вызов на сервере
  return document.cookie.split('; ').some((row) => row.startsWith('have_lang_in_start=have'))
}

interface IFooterProps {
  extraClass?: string
  extraStyle?: CSSProperties
  useFixedFooter?: boolean
  minMediaHeight?: number
}

const Footer: FC<IFooterProps> = ({extraClass, extraStyle, useFixedFooter, minMediaHeight}) => {
  const t = useTranslations('FooterNew')

  const [isFixedByHeight, setIsFixedByHeight] = useState(false)

  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition()
  const {setCurrentLang} = useActions()

  useEffect(() => {
    const checkHeight = () => {
      if (minMediaHeight && window.innerHeight > minMediaHeight && window.innerWidth > 1000) {
        setIsFixedByHeight(true)
      } else {
        setIsFixedByHeight(false)
      }
    }

    checkHeight()
    window.addEventListener('resize', checkHeight)
    return () => window.removeEventListener('resize', checkHeight)
  }, [minMediaHeight])

  return (
    <footer
      style={{...extraStyle}}
      className={`${styles.footer} ${useFixedFooter && isFixedByHeight ? styles.footer_fixed : ''} ${extraClass}`}
    >
      <div className={`container`}>
        <div className={`${styles.footer__top}`}>
          <div className={`${styles.footer__item}`}>
            <h3 className={`${styles.footer__title}`}>{t('sections.title')}</h3>

            <div className={`${styles.footer__item_row}`}>
              <ul className={`${styles.footer__list}`}>
                <li>
                  <Link className={`${styles.footer__link}`} href='/'>
                    {t('sections.main')}
                  </Link>
                </li>
                <li>
                  <Link className={`${styles.footer__link}`} href='/categories'>
                    {t('sections.catalog')}
                  </Link>
                </li>
                <li>
                  <Link className={`${styles.footer__link}`} href='/help'>
                    {t('sections.help')}
                  </Link>
                </li>
              </ul>

              <ul className={`${styles.footer__list}`}>
                <li>
                  <Link className={`${styles.footer__link}`} href='/about-us'>
                    {t('sections.about')}
                  </Link>
                </li>
                <li>
                  <Link className={`${styles.footer__link}`} href='/help'>
                    {t('sections.contacts')}
                  </Link>
                </li>
                <li>
                  <Link className={`${styles.footer__link}`} href='#reviews'>
                    {t('sections.reviews')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className={`${styles.footer__item}`}>
            <h3 className={`${styles.footer__title}`}>{t('support.title')}</h3>
            <ul className={`${styles.footer__list}`}>
              <li>
                <Link className={`${styles.footer__link}`} href='tel:74959233888'>
                  <svg className={`${styles.icon} ${styles.icon__phone}`}>
                    <use href='/iconsNew/symbol/sprite.svg#phone'></use>
                  </svg>
                  <span>+7-495-923-38-88</span>
                </Link>
              </li>
              <li>
                <Link className={`${styles.footer__link}`} href='mailto:info@exporteru.com'>
                  <svg className={`${styles.icon} ${styles.icon__email}`}>
                    <use href='/iconsNew/symbol/sprite.svg#email'></use>
                  </svg>
                  <span>info@exporteru.com</span>
                </Link>
              </li>
              <li>
                <Link className={`${styles.footer__link}`} href='https://t.me/exporteru' target='_blank'>
                  <svg className={`${styles.icon} ${styles.icon__tg}`}>
                    <use href='/iconsNew/symbol/sprite.svg#tg'></use>
                  </svg>
                  <span>@exporteru</span>
                </Link>
              </li>
              <li>
                <Link className={`${styles.footer__link}`} href='https://wa.me/79859233888' target='_blank'>
                  <svg className={`${styles.icon} ${styles.icon__email}`}>
                    <use href='/iconsNew/contacts-whatsapp-bw.svg#whatsapp'></use>
                  </svg>
                  <span>+7-985-923-38-88</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className={`${styles.footer__item}`}>
            <h3 className={`${styles.footer__title}`}>{t('info.title')}</h3>
            <ul className={`${styles.footer__list}`}>
              <li>
                <Link href='/terms' className={`${styles.footer__link}`}>
                  {t('info.terms')}
                </Link>
              </li>
              <li>
                <Link href='/privacy' className={`${styles.footer__link}`}>
                  {t('info.privacy')}
                </Link>
              </li>
            </ul>
          </div>

          <div className={`${styles.footer__item}`}>
            <h3 className={`${styles.footer__title}`}>{t('profile.title')}</h3>
            <ul className={`${styles.footer__list}`}>
              <li>
                <Link href='/login' className={`${styles.footer__link}`}>
                  {t('profile.login')}
                </Link>
              </li>
              <li>
                <Link href='/register' className={`${styles.footer__link}`}>
                  {t('profile.register')}
                </Link>
              </li>
            </ul>
          </div>

          <div className={`${styles.footer__item} ${styles.footer__item_social}`}>
            <h3 className={`${styles.footer__title} ${styles.footer__title_social}`}>{t('social.title')}</h3>
            <div className={`${styles.footer__social}`}>
              <Link
                href='https://vk.com/exporteru'
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
                href='https://t.me/exporteru'
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

              <Link href='https://wa.me/79859233888' className={`${styles.footer__social_link}`} aria-label='WhatsApp'>
                <svg width='32' height='32'>
                  <use href='/iconsNew/contacts-whatsapp.svg#whatsapp' width={32} height={32}></use>
                </svg>
              </Link>

              <Link
                href='https://u.wechat.com/kNmqSJ-CMtHIHZvSvUgEFZ8?s=0'
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
          <div className={`${styles.footer__bottom__link}`}>
            <Link href='/' className={`${styles.footer__logo}`}>
              <Image src='/imagesNew/logo.png' width={190} height={70} alt='Logo' />
            </Link>
          </div>
          <div className={`${styles.footer__bottom__inner}`}>
            <a
              href='https://exporteru.com'
              className={`${styles.footer__bottom__link}`}
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
              exporteru.com
            </a>
            <a
              href='https://en.exporteru.com'
              className={`${styles.footer__bottom__link}`}
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
              en.exporteru.com
            </a>
            <a
              href='https://cn.exporteru.com'
              className={`${styles.footer__bottom__link}`}
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
              cn.exporteru.com
            </a>
            <a
              href='https://in.exporteru.com'
              className={`${styles.footer__bottom__link}`}
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
                    window.location.href = 'https://in.exporteru.com'
                  }
                }
                // window.location.reload()
                startTransition(() => {
                  router.refresh()
                })
              }}
            >
              in.exporteru.com
            </a>
          </div>
          <p className={`${styles.footer__copyright}`}>© 2021-2025 Exporteru</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
