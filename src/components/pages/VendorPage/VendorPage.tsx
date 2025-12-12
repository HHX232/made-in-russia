/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import Header from '@/components/MainComponents/Header/Header'
import {FC, useCallback, useEffect, useState, useRef, useMemo} from 'react'
import ProfileForm from '../ProfilePage/ProfileForm/ProfileForm'
import {ASSETS_COUNTRIES} from '../ProfilePage/ProfilePage'
import styles from './VendorPage.module.scss'
import instance from '@/api/api.interceptor'
import Image from 'next/image'
import {useAnimatedCounter} from '@/hooks/useAnimatedCounter'
import Comment from '@/components/UI-kit/elements/Comment/Comment'
import {useProductReviews} from '@/hooks/useMyProductsReviews'

import {Product} from '@/services/products/product.types'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import Footer from '@/components/MainComponents/Footer/Footer'
import {Country} from '@/services/users.types'
import {Category} from '@/services/categoryes/categoryes.service'
import TextInputUI from '@/components/UI-kit/inputs/TextInputUI/TextInputUI'
import Link from 'next/link'
import {useTranslations} from 'next-intl'
import {toast} from 'sonner'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {VendorAdditionalContacts} from './VendorAdditionalContacts/VendorAdditionalContacts'
import TextAreaUI from '@/components/UI-kit/TextAreaUI/TextAreaUI'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useActions} from '@/hooks/useActions'
import {useUpdateVendorDetails} from '@/api/useVendorApi'
import CreateImagesInput from '@/components/UI-kit/inputs/CreateImagesInput/CreateImagesInput'
import {useSaveVendorMedia} from '@/utils/saveVendorDescriptionWithMedia'
import {useUserQuery, useLogout} from '@/hooks/useUserApi'
import DeleteAccountButton from '@/components/UI-kit/buttons/DeleteAccountButton/DeleteAccountButton'
import Avatar from '@/components/UI-kit/inputs/Avatar/Avatar'
import Catalog from '@/components/screens/Catalog/Catalog'
import MarkdownEditor from '@/components/UI-kit/MDEditor/MarkdownEditor'
import FavoritesForProfile from '../FavoritesPage/FavoritesForProfile/FavoritesForProfile'
import {useSearchParams} from 'next/navigation'
import {Heart} from 'lucide-react'

type TCurrentTab = 'personalData' | 'contacts' | 'sessions' | 'reviews' | 'faq' | 'favorites'

export interface IVendorData {
  id: number
  role: string
  email: string
  login: string
  phoneNumber: string
  region: string
  registrationDate: string
  lastModificationDate: string
  avatarUrl?: string
  vendorDetails?: {
    id: number
    inn: string
    address: string
    paymentDetails: string
    countries: Country[]
    productCategories: Category[]
    creationDate: string
    lastModificationDate: string
    viewsCount?: number | string
    description?: string
    phoneNumbers?: string[]
    emails?: string[]
    sites?: string[]
    faq?: {question: string; answer: string; id: string}[]
    media?: {
      id?: number
      mediaType?: string
      mimeType?: string
      url?: string
    }[]
  }
}

export interface IVendorPageProps {
  isPageForVendor?: boolean
  vendorData?: IVendorData
  numberCode?: string
  initialProductsForView?: Product[]
  onlyShowDescr?: string
  onlyShowAddress?: string
  onlyShowPhones?: string[]
  onlyShowWebsites?: string[]
  onlyShowEmail?: string[]
}

const formatDateLocalized = (dateString: string, currentLang: string = 'ru'): string => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid date'

  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  const months = {
    ru: [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря'
    ],
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']
  }

  switch (currentLang) {
    case 'en':
      return `${months.en[month]} ${day}, ${year}`

    case 'zh':
      // Китайский формат: YYYY年M月D日
      return `${year}年${month + 1}月${day}日`

    case 'hi':
      // Индийский формат: 15 मई 2024
      return `${day} ${months.hi[month]} ${year}`

    default:
      return `${day} ${months.ru[month]} ${year} года`
  }
}

// Компонент Sidebar
// Компонент Sidebar для VendorPage с добавленным пунктом "Избранное"
const Sidebar: FC<{
  currentTab: TCurrentTab
  onTabChange: (tab: TCurrentTab) => void
  onLogout: () => void
  onDeleteAccount: () => void
  userData?: IVendorData
  isPageForVendor: boolean
  sidebarShow: boolean
  onLoginChange?: (newLogin: string) => void
  setShowSidebar: (val: boolean) => void
}> = ({currentTab, onTabChange, onLogout, userData, isPageForVendor, sidebarShow, setShowSidebar, onLoginChange}) => {
  const t = useTranslations('VendorPage')
  const {updateUserAvatar} = useActions()
  const {user} = useTypedSelector((state) => state.user)
  const {updateVendorDetails} = useActions()
  const {mutate: updateVendorDetailsAPI} = useUpdateVendorDetails()
  const handleAvatarChange = useCallback(
    (newAvatarUrl: string | null) => {
      if (isPageForVendor) {
        updateUserAvatar(newAvatarUrl || '')
      }
    },
    [updateUserAvatar, isPageForVendor]
  )
  const [login, setLogin] = useState(userData?.login || '')

  useEffect(() => {
    if (userData?.login) {
      setLogin(userData.login)
    }
  }, [userData?.login])

  return (
    <div className={`${styles.account_layout__sidebar} ${sidebarShow ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <nav className={styles.menu_company}>
        {/* Аватарка */}
        <div className={styles.acc_compavatar}>
          <Avatar onAvatarChange={handleAvatarChange} isOnlyShow={!isPageForVendor} avatarUrl={userData?.avatarUrl} />
          <div className={styles.acc_compavatar__group}>
            <span className={styles.acc_compavatar__name}>
              {isPageForVendor && (
                <TextAreaUI
                  extraClass={styles.extra_area_class}
                  currentValue={login}
                  onSetValue={(val) => {
                    setLogin(val)
                    if (onLoginChange) {
                      onLoginChange(val)
                    }
                  }}
                  minRows={1}
                  autoResize
                  onBlur={(e) => {
                    updateVendorDetailsAPI({
                      categories: user?.vendorDetails?.productCategories?.map((cat) => cat.name) || [],
                      countries: user?.vendorDetails?.countries?.map((country) => country) || [],
                      description: user?.vendorDetails?.description,
                      inn: user?.vendorDetails?.inn,
                      phoneNumber: user?.phoneNumber,
                      region: user?.region,
                      phoneNumbers: user?.vendorDetails?.phoneNumbers,
                      emails: user?.vendorDetails?.emails,
                      sites: user?.vendorDetails?.sites,
                      address: user?.vendorDetails?.address || '',
                      login: e.target.value || user?.login
                    })
                  }}
                  placeholder={t('enterLogin') || 'Введите логин'}
                  disabled={!isPageForVendor}
                />
              )}
              {!isPageForVendor && <span className={styles.acc_compavatar__name}>{userData?.login}</span>}
            </span>
            <span className={styles.acc_compavatar__email}>{userData?.email}</span>
          </div>
        </div>

        <div className={styles.menu_company__flex}>
          <ul className={styles.menu_company__list}>
            {/* Личные данные */}
            <li
              onClick={() => {
                setShowSidebar(false)
              }}
              className={currentTab === 'personalData' ? styles.active : ''}
            >
              <a
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                  onTabChange('personalData')
                }}
              >
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z'
                    stroke={currentTab === 'personalData' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={sidebarShow ? (currentTab === 'personalData' ? '1' : '0.5') : '1'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M20.5901 22C20.5901 18.13 16.7402 15 12.0002 15C7.26015 15 3.41016 18.13 3.41016 22'
                    stroke={currentTab === 'personalData' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={sidebarShow ? (currentTab === 'personalData' ? '1' : '0.5') : '1'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>{t('personalData')}</span>
              </a>
            </li>

            {/* Контакты */}
            <li
              onClick={() => {
                setShowSidebar(false)
              }}
              className={currentTab === 'contacts' ? styles.active : ''}
            >
              <a
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                  onTabChange('contacts')
                }}
              >
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M21.97 18.33C21.97 18.69 21.89 19.06 21.72 19.42C21.55 19.78 21.33 20.12 21.04 20.44C20.55 20.98 20.01 21.37 19.4 21.62C18.8 21.87 18.15 22 17.45 22C16.43 22 15.34 21.76 14.19 21.27C13.04 20.78 11.89 20.12 10.75 19.29C9.6 18.45 8.51 17.52 7.47 16.49C6.44 15.45 5.51 14.36 4.68 13.22C3.86 12.08 3.2 10.94 2.72 9.81C2.24 8.67 2 7.58 2 6.54C2 5.86 2.12 5.21 2.36 4.61C2.6 4 2.98 3.44 3.51 2.94C4.15 2.31 4.85 2 5.59 2C5.87 2 6.15 2.06 6.4 2.18C6.66 2.3 6.89 2.48 7.07 2.74L9.39 6.01C9.57 6.26 9.7 6.49 9.79 6.71C9.88 6.92 9.93 7.13 9.93 7.32C9.93 7.56 9.86 7.8 9.72 8.03C9.59 8.26 9.4 8.5 9.16 8.74L8.4 9.53C8.29 9.64 8.24 9.77 8.24 9.93C8.24 10.01 8.25 10.08 8.27 10.16C8.3 10.24 8.33 10.3 8.35 10.36C8.53 10.69 8.84 11.12 9.28 11.64C9.73 12.16 10.21 12.69 10.73 13.22C11.27 13.75 11.79 14.24 12.32 14.69C12.84 15.13 13.27 15.43 13.61 15.61C13.66 15.63 13.72 15.66 13.79 15.69C13.87 15.72 13.95 15.73 14.04 15.73C14.21 15.73 14.34 15.67 14.45 15.56L15.21 14.81C15.46 14.56 15.7 14.37 15.93 14.25C16.16 14.11 16.39 14.04 16.64 14.04C16.83 14.04 17.03 14.08 17.25 14.17C17.47 14.26 17.7 14.39 17.95 14.56L21.26 16.91C21.52 17.09 21.7 17.3 21.81 17.55C21.91 17.8 21.97 18.05 21.97 18.33Z'
                    stroke={currentTab === 'contacts' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={currentTab === 'contacts' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                    strokeWidth='1.5'
                    strokeMiterlimit='10'
                  />
                </svg>
                <span>{t('contacts')}</span>
              </a>
            </li>

            {/* Избранное - НОВЫЙ ПУНКТ */}
            {isPageForVendor && (
              <li
                onClick={() => {
                  setShowSidebar(false)
                }}
                className={currentTab === 'favorites' ? styles.active : ''}
              >
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault()
                    onTabChange('favorites')
                  }}
                >
                  <Heart
                    width={24}
                    height={24}
                    className={
                      currentTab === 'favorites'
                        ? sidebarShow
                          ? styles.accentColor
                          : styles.accentColorHalf
                        : styles.defaultColor
                    }
                  />
                  <span>{t('favorites')}</span>
                </a>
              </li>
            )}

            {/* Мои сессии */}
            {isPageForVendor && (
              <li
                onClick={() => {
                  setShowSidebar(false)
                }}
                className={currentTab === 'sessions' ? styles.active : ''}
              >
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault()
                    onTabChange('sessions')
                  }}
                >
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z'
                      stroke={currentTab === 'sessions' ? '#0047BA' : '#2F2F2F'}
                      strokeOpacity={currentTab === 'sessions' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M15.7109 15.1798L12.6109 13.3298C12.0709 13.0098 11.6309 12.2398 11.6309 11.6098V7.50977'
                      stroke={currentTab === 'sessions' ? '#0047BA' : '#2F2F2F'}
                      strokeOpacity={currentTab === 'sessions' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <span>{t('mySessions')}</span>
                </a>
              </li>
            )}

            {/* Отзывы */}
            <li
              onClick={() => {
                setShowSidebar(false)
              }}
              className={currentTab === 'reviews' ? styles.active : ''}
            >
              <a
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                  onTabChange('reviews')
                }}
              >
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M22 6.25V11.35C22 12.62 21.58 13.69 20.83 14.43C20.09 15.18 19.02 15.6 17.75 15.6V17.41C17.75 18.09 16.99 18.5 16.43 18.12L15.46 17.48C15.55 17.17 15.59 16.83 15.59 16.47V12.4C15.59 10.36 14.23 9 12.19 9H5.39999C5.25999 9 5.13 9.01002 5 9.02002V6.25C5 3.7 6.7 2 9.25 2H17.75C20.3 2 22 3.7 22 6.25Z'
                    stroke={currentTab === 'reviews' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={currentTab === 'reviews' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M15.59 12.4V16.47C15.59 16.83 15.55 17.17 15.46 17.48C15.09 18.95 13.87 19.87 12.19 19.87H9.47L6.45 21.88C6 22.19 5.39999 21.86 5.39999 21.32V19.87C4.37999 19.87 3.53 19.53 2.94 18.94C2.34 18.34 2 17.49 2 16.47V12.4C2 10.5 3.18 9.19002 5 9.02002C5.13 9.01002 5.25999 9 5.39999 9H12.19C14.23 9 15.59 10.36 15.59 12.4Z'
                    stroke={currentTab === 'reviews' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={currentTab === 'reviews' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>{t('reviews')}</span>
              </a>
            </li>

            {/* Частые вопросы */}
            <li
              onClick={() => {
                setShowSidebar(false)
              }}
              className={currentTab === 'faq' ? styles.active : ''}
            >
              <a
                href='#'
                onClick={(e) => {
                  e.preventDefault()
                  onTabChange('faq')
                }}
              >
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M17 18.43H13L8.54999 21.39C7.88999 21.83 7 21.36 7 20.56V18.43C4 18.43 2 16.43 2 13.43V7.42993C2 4.42993 4 2.42993 7 2.42993H17C20 2.42993 22 4.42993 22 7.42993V13.43C22 16.43 20 18.43 17 18.43Z'
                    stroke={currentTab === 'faq' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={currentTab === 'faq' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                    strokeWidth='1.5'
                    strokeMiterlimit='10'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M12 11.36V11.15C12 10.47 12.42 10.11 12.84 9.82001C13.25 9.54001 13.66 9.18002 13.66 8.52002C13.66 7.60002 12.92 6.85999 12 6.85999C11.08 6.85999 10.34 7.60002 10.34 8.52002'
                    stroke={currentTab === 'faq' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={currentTab === 'faq' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M11.9955 13.75H12.0045'
                    stroke={currentTab === 'faq' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={currentTab === 'faq' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>{t('faq')}</span>
              </a>
            </li>

            {/* Создать товар */}
            {isPageForVendor && (
              <li
                className={styles.spec__create}
                onClick={() => {
                  setShowSidebar(false)
                }}
              >
                <Link href='/create-card'>
                  <svg
                    className={styles.stroke__white}
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M6 12H18'
                      stroke='#FFFFFF'
                      strokeOpacity='0.5'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M12 18V6'
                      stroke='#FFFFFF'
                      strokeOpacity='0.5'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <span style={{color: '#FFFFFF', opacity: '1'}}>{t('createProduct')}</span>
                </Link>
              </li>
            )}
          </ul>

          {/* Нижние кнопки */}
          {isPageForVendor && (
            <ul className={styles.menu_company__list}>
              <DeleteAccountButton buttonText='delete' />
              <li>
                <a
                  href='#'
                  onClick={(e) => {
                    e.preventDefault()
                    onLogout()
                  }}
                >
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M8.90039 7.56023C9.21039 3.96023 11.0604 2.49023 15.1104 2.49023H15.2404C19.7104 2.49023 21.5004 4.28023 21.5004 8.75023V15.2702C21.5004 19.7402 19.7104 21.5302 15.2404 21.5302H15.1104C11.0904 21.5302 9.24039 20.0802 8.91039 16.5402'
                      stroke='#2F2F2F'
                      strokeOpacity='0.5'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M14.9991 12H3.61914'
                      stroke='#2F2F2F'
                      strokeOpacity='0.5'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M5.85 8.6499L2.5 11.9999L5.85 15.3499'
                      stroke='#2F2F2F'
                      strokeOpacity='0.5'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <span>{t('logout')}</span>
                </a>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </div>
  )
}

// Компонент SessionsTab
const SessionsTab: FC = () => {
  const t = useTranslations('VendorPage')
  const currentLang = useCurrentLanguage()

  const [sessions, setSessions] = useState<
    {
      id: string
      deviceId: string
      deviceType: string
      browser: string
      os: string
      ipAddress: string
      lastLoginDate: string | Date
    }[]
  >([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await instance.get('/me/sessions', {
          headers: {
            'Accept-Language': currentLang,
            'x-language': currentLang
          }
        })
        setSessions(response.data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSessions()
  }, [currentLang])

  const handleDeleteSession = async (id: string) => {
    const loadingToast = toast.loading(t('deleting'))
    try {
      await instance.delete(`/me/sessions/${id}`, {
        headers: {
          'Accept-Language': currentLang,
          'x-language': currentLang
        }
      })
      setSessions((prev) => prev.filter((session) => session.id !== id))
      toast.dismiss(loadingToast)
      toast.success(t('deletedSuccess'))
    } catch (e) {
      console.error(e)
      toast.dismiss(loadingToast)
      toast.error(t('deletedError'))
    }
  }

  return (
    <>
      <ul className={styles.modal__sessions__list}>
        {sessions.map((el, i) => (
          <li key={i}>
            <div className={styles.modal__sessions__list__item}>
              <p>
                <span className={styles.sessions__item__title}>{t('deviceType')}:</span>{' '}
                <span className={styles.sessions__item__value}>{el.deviceType}</span>
              </p>
              <p>
                <span className={styles.sessions__item__title}>{t('browser')}:</span>{' '}
                <span className={styles.sessions__item__value}>{el.browser}</span>
              </p>
              <p>
                <span className={styles.sessions__item__title}>{t('os')}:</span>{' '}
                <span className={styles.sessions__item__value}>{el.os}</span>
              </p>
              <p>
                <span className={styles.sessions__item__title}>{t('lastLoginDate')}:</span>{' '}
                <span className={styles.sessions__item__value}>
                  {typeof el.lastLoginDate === 'string'
                    ? formatDateLocalized(el.lastLoginDate, currentLang)
                    : formatDateLocalized(el.lastLoginDate.toISOString(), currentLang)}
                </span>
              </p>
              <button className={styles.modal__sessions__list__item__button} onClick={() => handleDeleteSession(el.id)}>
                <Image alt='delete session' width={26} height={26} src='/iconsNew/crestNew.svg' />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

const VendorPageComponent: FC<IVendorPageProps> = ({
  isPageForVendor = true,
  vendorData: initialVendorData,
  numberCode = '',
  initialProductsForView,
  onlyShowDescr,
  onlyShowAddress,
  onlyShowPhones,
  onlyShowWebsites,
  onlyShowEmail
}) => {
  const [currentTab, setCurrentTab] = useState<TCurrentTab>('personalData')
  const [sidebarShow, setSidebarShow] = useState(true)
  const [needToSave, setNeedToSave] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [startAnimation, setStartAnimation] = useState(false)
  const [wantQuite, setWantQuite] = useState(false)
  const [currentReviewPage, setCurrentReviewPage] = useState(1)
  const [openFaqId, setOpenFaqId] = useState<number | null>(null)
  const {data: userData, isLoading: loading} = useUserQuery()
  const {mutate: logout, isPending: isLogoutPending} = useLogout()
  const currentLang = useCurrentLanguage()
  const [vendorData, setVendorData] = useState(initialVendorData)

  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const activeTab = searchParams.get('activeTab')
    const validTabs: TCurrentTab[] = ['personalData', 'contacts', 'sessions', 'reviews', 'faq', 'favorites']

    if (activeTab && validTabs.includes(activeTab as TCurrentTab)) {
      setCurrentTab(activeTab as TCurrentTab)
      setSidebarShow(false)
    }
  }, [searchParams.toString()])

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const response = await instance.get(`/vendor/${initialVendorData?.id}`, {
          headers: {
            'Accept-Language': currentLang,
            'x-language': currentLang
          }
        })
        setVendorData(response.data)
      } catch (error) {
        console.error('Error fetching vendor data:', error)
      }
    }

    if (initialVendorData?.id) {
      fetchVendorData()
    }
  }, [currentLang, initialVendorData?.id])

  const currentUserData = useMemo(() => {
    return vendorData || (userData as any)
  }, [vendorData, userData, currentLang])

  const t = useTranslations('VendorPage')

  const [isQuestOpen, setIsQuestOpen] = useState(false)
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
  const [editQuestion, setEditQuestion] = useState('')
  const [editAnswer, setEditAnswer] = useState('')
  const {user} = useTypedSelector((state) => state.user)
  const {updateVendorDetails} = useActions()
  const {mutate: updateVendorDetailsAPI} = useUpdateVendorDetails()

  const handleCancelEdit = useCallback(() => {
    setEditingFaqId(null)
    setEditQuestion('')
    setEditAnswer('')
  }, [])

  // Медиа-файлы
  const canUpdateVendorMedia = useRef(false)
  const [isSavingMedia, setIsSavingMedia] = useState(false)
  const {saveMedia} = useSaveVendorMedia()
  const [descriptionImages, setDescriptionImages] = useState<string[]>(
    vendorData?.vendorDetails?.media?.map((el) => el?.url || '') || []
  )
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  // FAQ
  const [activeFaq, setActiveFaq] = useState(vendorData?.vendorDetails?.faq)
  const [newQuestionValue, setNewQuestionValue] = useState('')
  const [newAnswerValue, setNewAnswerValue] = useState('')

  // Состояния для текущих значений
  const [userPhoneNumber, setUserPhoneNumber] = useState('')
  useEffect(() => {
    if (vendorData?.phoneNumber) {
      setUserPhoneNumber(vendorData.phoneNumber)
    }
  }, [])
  const [userCountries, setUserCountries] = useState(
    vendorData?.vendorDetails?.countries?.map((country) => country.name)
  )
  const [userCategories, setUserCategories] = useState(
    vendorData?.vendorDetails?.productCategories?.map((category) => category.name)
  )
  const [userInn, setUserInn] = useState(vendorData?.vendorDetails?.inn)
  const [userAddress, setUserAddress] = useState(vendorData?.vendorDetails?.address)
  const [userLogin, setUserLogin] = useState(vendorData?.login)
  const REGIONS = [
    {imageSrc: ASSETS_COUNTRIES.belarusSvg, title: t('belarus'), altName: 'Belarus'},
    {imageSrc: ASSETS_COUNTRIES.kazakhstanSvg, title: t('kazakhstan'), altName: 'Kazakhstan'},
    {imageSrc: ASSETS_COUNTRIES.chinaSvg, title: t('china'), altName: 'China'},
    {imageSrc: ASSETS_COUNTRIES.russiaSvg, title: t('russia'), altName: 'Russia'}
  ]

  // Reviews с пагинацией
  const reviewsParams = useMemo(
    () => ({
      size: 2,
      page: currentReviewPage - 1, // API использует 0-индексацию
      ...(!isPageForVendor && vendorData?.id ? {specialRoute: `vendor/${vendorData.id}`} : {})
    }),
    [isPageForVendor, vendorData?.id, currentReviewPage]
  )

  const {reviews, isLoading: reviewsLoading, totalElements, fullResponseData} = useProductReviews(reviewsParams)

  useEffect(() => {
    console.log('reviews log hi', reviews)
  }, [reviews])
  // Вычисляем количество страниц
  const totalPages = Math.ceil(totalElements / 2)

  // Сброс страницы при смене таба
  useEffect(() => {
    if (currentTab === 'reviews') {
      setCurrentReviewPage(1)
    }
  }, [currentTab])

  // Анимированные счетчики
  const viewsCount = useMemo(
    () => Number(vendorData?.vendorDetails?.viewsCount || '0'),
    [vendorData?.vendorDetails?.viewsCount]
  )

  const animatedViews = useAnimatedCounter({
    targetValue: viewsCount,
    duration: 300,
    startAnimation
  })

  const animatedComments = useAnimatedCounter({
    targetValue: totalElements,
    duration: 300,
    startAnimation
  })

  const averageRating = useMemo(
    () =>
      reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0',
    [reviews]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!loading && userData) {
      setNeedToSave(false)
      setInitialLoadComplete(true)
    }
  }, [loading])

  const handleActiveImagesChange = useCallback((remainingUrls: string[]) => {
    setDescriptionImages(remainingUrls)
    canUpdateVendorMedia.current = true
  }, [])

  const handleUploadedFilesChange = useCallback((files: File[]) => {
    setTimeout(() => {
      setUploadedFiles(files)
      canUpdateVendorMedia.current = true
    }, 0)
  }, [])

  const handleSaveMediaFiles = useCallback(async () => {
    if (!user?.vendorDetails) return

    setIsSavingMedia(true)

    try {
      const result = await saveMedia({
        newFiles: uploadedFiles,
        existingImages: descriptionImages,
        allExistingMedia: vendorData?.vendorDetails?.media || [],
        currentLanguage: currentLang,
        t
      })

      if (result.success) {
        canUpdateVendorMedia.current = false
        setUploadedFiles([])
      }
    } catch (error) {
      console.error('Failed to save media:', error)
    } finally {
      setIsSavingMedia(false)
    }
  }, [
    user?.vendorDetails,
    uploadedFiles,
    descriptionImages,
    vendorData?.vendorDetails?.media,
    currentLang,
    t,
    saveMedia
  ])

  const handleFaqEdit = useCallback(
    (itemId: string) => {
      const faqItem = activeFaq?.find((item) => item.id === itemId)
      if (faqItem) {
        setEditingFaqId(itemId)
        setEditQuestion(faqItem.question)
        setEditAnswer(faqItem.answer)
        setOpenFaqId(Number(itemId))
      }
    },
    [activeFaq]
  )

  const handleFaqSave = useCallback(
    async (itemId: string) => {
      const loadingToast = toast.loading(t('saving'))
      try {
        await instance.put(
          `/vendor/faq/${itemId}`,
          {
            question: editQuestion,
            answer: editAnswer
          },
          {
            headers: {
              'Accept-Language': currentLang
            }
          }
        )

        // Обновляем локальный стейт
        setActiveFaq((prev) =>
          prev?.map((item) => (item.id === itemId ? {...item, question: editQuestion, answer: editAnswer} : item))
        )

        setEditingFaqId(null)
        setEditQuestion('')
        setEditAnswer('')

        toast.dismiss(loadingToast)
        toast.success(t('successUpdatedFaq'))
      } catch (e) {
        console.error(e)
        toast.dismiss(loadingToast)
        toast.error(t('errorUpdatingFaq'))
      }
    },
    [editQuestion, editAnswer, currentLang, t]
  )

  const handleCreateNewQuestion = useCallback(() => {
    try {
      instance
        .post(
          '/vendor/faq',
          {
            question: newQuestionValue,
            answer: newAnswerValue
          },
          {
            headers: {
              'Accept-Language': currentLang
            }
          }
        )
        .then((res) => {
          setActiveFaq((prev) => [
            ...(prev || []),
            {question: newQuestionValue, answer: newAnswerValue, id: res.data.id}
          ])
          toast.success(t('successPublishedNewQuest'))
        })
        .catch(() => {
          toast.error(t('errorCreatingQuestion'))
        })

      setNewQuestionValue('')
      setNewAnswerValue('')
    } catch (e) {
      console.log(e)
      toast.error(t('errorCreatingQuestion'))
    }
  }, [newQuestionValue, newAnswerValue, currentLang, t])

  const handleDeleteQuestion = useCallback(
    async (questionId: string) => {
      try {
        await instance.delete(`/vendor/faq/${questionId}`, {
          headers: {
            'Accept-Language': currentLang
          }
        })

        setActiveFaq((prev) => (prev ? prev.filter((faq) => faq.id !== questionId) : prev))

        toast.success(t('sucessDeleatFaq'))
      } catch (e) {
        console.error(e)
        toast.error(t('errorDeleatFaq'))
      }
    },
    [currentLang, t]
  )

  const handleFaqDelete = useCallback(
    (item: any) => {
      console.log('delete item', item)
      handleDeleteQuestion(item.id || item)
      setActiveFaq(activeFaq?.filter((itemMap) => itemMap.id !== item.id))
    },
    [activeFaq, handleDeleteQuestion]
  )

  const handleLogout = useCallback(() => {
    if (isLogoutPending) return
    setWantQuite(false)
    logout()
  }, [isLogoutPending, logout])

  const handleVendorDataChange = useCallback((data: any) => {
    setUserPhoneNumber(data.phoneNumber)
    setUserCountries(data.countries.map((country: any) => country.label))
    setUserCategories(data.productCategories.map((category: any) => category.label))
    setUserInn(data.inn)
    setUserAddress(data?.address)
  }, [])

  const safeSetNeedToSave = useCallback(
    (value: boolean) => {
      if (initialLoadComplete && !isLogoutPending) {
        setNeedToSave(value)
      }
    },
    [initialLoadComplete, isLogoutPending]
  )

  const faqItems = useMemo(
    () =>
      activeFaq?.map((item) => ({
        title: item.question,
        value: item.answer,
        id: item.id
      })) || [],
    [activeFaq]
  )

  // Функция рендера пагинации для отзывов
  const renderReviewsPagination = () => {
    if (totalPages <= 1) return null

    const pages = []

    // Первая страница
    pages.push(
      <a
        key={1}
        href='#'
        onClick={(e) => {
          e.preventDefault()
          setCurrentReviewPage(1)
        }}
        className={`${styles.exp_pagination__link} ${currentReviewPage === 1 ? styles.exp_pagination__link_active : ''}`}
      >
        1
      </a>
    )

    const startPage = Math.max(2, currentReviewPage - 1)
    const endPage = Math.min(totalPages - 1, currentReviewPage + 1)

    // Многоточие после первой страницы
    if (startPage > 2) {
      pages.push(
        <span key='ellipsis-start' className={styles.exp_pagination__ellipsis}>
          ...
        </span>
      )
    }

    // Страницы в середине
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <a
          key={i}
          href='#'
          onClick={(e) => {
            e.preventDefault()
            setCurrentReviewPage(i)
          }}
          className={`${styles.exp_pagination__link} ${currentReviewPage === i ? styles.exp_pagination__link_active : ''}`}
        >
          {i}
        </a>
      )
    }

    // Многоточие перед последней страницей
    if (endPage < totalPages - 1) {
      pages.push(
        <span key='ellipsis-end' className={styles.exp_pagination__ellipsis}>
          ...
        </span>
      )
    }

    // Последняя страница
    if (totalPages > 1) {
      pages.push(
        <a
          key={totalPages}
          href='#'
          onClick={(e) => {
            e.preventDefault()
            setCurrentReviewPage(totalPages)
          }}
          className={`${styles.exp_pagination__link} ${
            currentReviewPage === totalPages ? styles.exp_pagination__link_active : ''
          }`}
        >
          {totalPages}
        </a>
      )
    }

    if (isLogoutPending) {
      return null
    }
    return (
      <div className={styles.justify_content_center}>
        <div className={styles.exp_pagination}>
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault()
              if (currentReviewPage > 1) setCurrentReviewPage(currentReviewPage - 1)
            }}
            className={`${styles.exp_pagination__link} ${styles.exp_pagination__link_prev} ${
              currentReviewPage === 1 ? styles.exp_pagination__link_disabled : ''
            }`}
          />
          {pages}
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault()
              if (currentReviewPage < totalPages) setCurrentReviewPage(currentReviewPage + 1)
            }}
            className={`${styles.exp_pagination__link} ${styles.exp_pagination__link_next} ${
              currentReviewPage === totalPages ? styles.exp_pagination__link_disabled : ''
            }`}
          />
        </div>
      </div>
    )
  }

  const getTabTitle = () => {
    switch (currentTab) {
      case 'personalData':
        return t('personalData')
      case 'contacts':
        return t('contacts')
      case 'favorites':
        return t('favorites')
      case 'sessions':
        return t('mySessions')
      case 'reviews':
        return t('reviews')
      case 'faq':
        return t('faq')
      default:
        return t('personalData')
    }
  }

  return (
    <>
      <Header />

      <div className='container'>
        <div className={styles.account_human}>
          {isPageForVendor && (
            <div className={styles.section_header}>
              <div className={styles.section_header__title}>{t('myAccount')}</div>
            </div>
          )}

          <div className={styles.account_layout}>
            <Sidebar
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              onLogout={() => setWantQuite(true)}
              onDeleteAccount={() => {}}
              userData={currentUserData}
              isPageForVendor={isPageForVendor}
              sidebarShow={sidebarShow}
              setShowSidebar={setSidebarShow}
              onLoginChange={(newLogin) => {
                setUserLogin(newLogin)
                safeSetNeedToSave(true)
              }}
            />

            {/* Mobile header */}
            <div
              onClick={() => setSidebarShow(true)}
              className={`${styles.hide__sidebar__menu} ${!sidebarShow ? styles.showPhoneTitleSide : styles.hidePhoneTitleSide}`}
            >
              <h2 className={styles.account__title}>{getTabTitle()}</h2>
              <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                {currentTab === 'personalData' && (
                  <div className={styles.account__date}>
                    <span>{t('registrationDate')}</span>
                    <span>
                      {vendorData?.registrationDate
                        ? formatDateLocalized(vendorData.registrationDate, currentLang)
                        : userData?.registrationDate
                          ? formatDateLocalized(userData.registrationDate, currentLang)
                          : ''}
                    </span>
                  </div>
                )}
                <svg width='30' height='30' viewBox='0 0 22 23' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M9.16602 5.08325H18.3327'
                    stroke='#000000'
                    strokeWidth='1.375'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M3.66602 11.5H18.3327'
                    stroke='#000000'
                    strokeWidth='1.375'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M3.66602 17.9167H12.8327'
                    stroke='#000000'
                    strokeWidth='1.375'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div
              className={`${styles.account_layout__content} ${!sidebarShow ? styles.showPhoneMainContent : styles.hidePhoneMainContent}`}
            >
              {/* Личные данные */}
              {currentTab === 'personalData' && (
                <div className={styles.account_tile}>
                  {/* Структура: заголовок + статистика */}
                  <div className={styles.account_tile__accgrid}>
                    <div className={styles.account_tile__accgrid__short}>
                      <div className={styles.account_tile__title}>{t('personalData')}</div>
                    </div>
                    <div className={styles.account_tile__accgrid__long}>
                      <div className={styles.account_stats_grid}>
                        <div className={styles.account_stat_card}>
                          <div className={styles.account_stat_card__header}>
                            <svg
                              width='24'
                              height='24'
                              viewBox='0 0 24 24'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M15.58 12C15.58 13.98 13.98 15.58 12 15.58C10.02 15.58 8.42004 13.98 8.42004 12C8.42004 10.02 10.02 8.42004 12 8.42004C13.98 8.42004 15.58 10.02 15.58 12Z'
                                stroke='#0047BA'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                              <path
                                d='M12 20.27C15.53 20.27 18.82 18.19 21.11 14.59C22.01 13.18 22.01 10.81 21.11 9.39997C18.82 5.79997 15.53 3.71997 12 3.71997C8.46997 3.71997 5.17997 5.79997 2.88997 9.39997C1.98997 10.81 1.98997 13.18 2.88997 14.59C5.17997 18.19 8.46997 20.27 12 20.27Z'
                                stroke='#0047BA'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                            <h3>{t('accountViews')}</h3>
                          </div>
                          <div className={styles.account_stat_card__value}>{animatedViews.toLocaleString()}</div>
                        </div>

                        <div
                          onClick={() => {
                            setCurrentTab('reviews')
                          }}
                          style={{cursor: 'pointer'}}
                          className={styles.account_stat_card}
                        >
                          <div className={styles.account_stat_card__header}>
                            <svg
                              width='28'
                              height='28'
                              viewBox='0 0 28 28'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M25.6673 7.29167V13.2416C25.6673 14.7233 25.1773 15.9717 24.3023 16.835C23.439 17.71 22.1907 18.2 20.709 18.2V20.3116C20.709 21.105 19.8223 21.5833 19.169 21.14L18.0373 20.3933C18.1423 20.0316 18.189 19.635 18.189 19.215V14.4667C18.189 12.0867 16.6023 10.5 14.2223 10.5H6.30064C6.13731 10.5 5.98565 10.5117 5.83398 10.5234V7.29167C5.83398 4.31667 7.81732 2.33334 10.7923 2.33334H20.709C23.684 2.33334 25.6673 4.31667 25.6673 7.29167Z'
                                stroke='#0047BA'
                                stroke-width='1.5'
                                stroke-miterlimit='10'
                                stroke-linecap='round'
                                stroke-linejoin='round'
                              />
                              <path
                                d='M18.189 14.4667V19.215C18.189 19.635 18.1423 20.0316 18.0373 20.3933C17.6057 22.1083 16.1823 23.1817 14.2223 23.1817H11.049L7.52565 25.5267C7.00065 25.8883 6.30064 25.5033 6.30064 24.8733V23.1817C5.11064 23.1817 4.11899 22.785 3.43065 22.0967C2.73065 21.3967 2.33398 20.405 2.33398 19.215V14.4667C2.33398 12.25 3.71065 10.7217 5.83398 10.5234C5.98565 10.5117 6.13731 10.5 6.30064 10.5H14.2223C16.6023 10.5 18.189 12.0867 18.189 14.4667Z'
                                stroke='#0047BA'
                                stroke-width='1.5'
                                stroke-miterlimit='10'
                                stroke-linecap='round'
                                stroke-linejoin='round'
                              />
                            </svg>

                            <h3>{t('accountComments')}</h3>
                          </div>
                          <div className={styles.account_stat_card__value}>{animatedComments.toLocaleString()}</div>
                        </div>

                        <div className={styles.account_stat_card}>
                          <div className={styles.account_stat_card__header}>
                            <svg
                              width='28'
                              height='28'
                              viewBox='0 0 28 28'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M5.74023 23.66L7.80524 25.2583C8.07357 25.5267 8.66857 25.655 9.0769 25.655H11.6086C12.4136 25.655 13.2769 25.06 13.4752 24.255L15.0736 19.39C15.4119 18.4566 14.8052 17.6516 13.8019 17.6516H11.1302C10.7336 17.6516 10.3952 17.3132 10.4652 16.8466L10.8036 14.7116C10.9319 14.1166 10.5352 13.4399 9.94023 13.2416C9.40357 13.0433 8.73857 13.3116 8.47024 13.7083L5.74023 17.78'
                                stroke='#0047BA'
                                stroke-width='1.5'
                                stroke-miterlimit='10'
                              />
                              <path
                                d='M2.33398 23.66V17.1267C2.33398 16.1934 2.73065 15.855 3.66398 15.855H4.32898C5.26232 15.855 5.65898 16.1934 5.65898 17.1267V23.66C5.65898 24.5934 5.26232 24.9317 4.32898 24.9317H3.66398C2.73065 24.9317 2.33398 24.605 2.33398 23.66Z'
                                stroke='#0047BA'
                                stroke-width='1.5'
                                stroke-linecap='round'
                                stroke-linejoin='round'
                              />
                              <path
                                d='M22.2596 4.33996L20.1946 2.74164C19.9263 2.4733 19.3313 2.34501 18.923 2.34501H16.3913C15.5863 2.34501 14.723 2.93995 14.5246 3.74495L12.9263 8.61C12.588 9.54334 13.1946 10.3483 14.198 10.3483H16.8696C17.2663 10.3483 17.6046 10.6867 17.5346 11.1534L17.1963 13.2883C17.068 13.8833 17.4646 14.56 18.0596 14.7584C18.5963 14.9567 19.2613 14.6883 19.5296 14.2917L22.2596 10.22'
                                stroke='#0047BA'
                                stroke-width='1.5'
                                stroke-miterlimit='10'
                              />
                              <path
                                d='M25.6668 4.33996V10.8733C25.6668 11.8066 25.2701 12.145 24.3368 12.145H23.6718C22.7385 12.145 22.3418 11.8066 22.3418 10.8733V4.33996C22.3418 3.40663 22.7385 3.06834 23.6718 3.06834H24.3368C25.2701 3.06834 25.6668 3.39496 25.6668 4.33996Z'
                                stroke='#0047BA'
                                stroke-width='1.5'
                                stroke-linecap='round'
                                stroke-linejoin='round'
                              />
                            </svg>
                            <h3>{t('rating')}</h3>
                          </div>
                          <div className={styles.account_stat_card__value_row}>
                            <span className={styles.account_stat_card__value}>{averageRating}</span>
                            <span className={styles.account_stat_card__star}>
                              <svg
                                width='24'
                                height='22'
                                viewBox='0 0 24 22'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M12 0L15.1811 7.6216L23.4127 8.2918L17.1471 13.6724L19.0534 21.7082L12 17.412L4.94658 21.7082L6.85288 13.6724L0.587322 8.2918L8.81891 7.6216L12 0Z'
                                  fill='#EEB611'
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ProfileForm
                    isShowForOwner={isPageForVendor}
                    isVendor={true}
                    onVendorDataChange={handleVendorDataChange}
                    setNeedToSave={safeSetNeedToSave}
                    isLoading={loading}
                    onlyShowAddress={onlyShowAddress}
                    userData={currentUserData}
                    regions={REGIONS}
                  />

                  {/* Описание и фото */}
                  <div className={styles.vendor__description__section}>
                    <div className={styles.vendor__description__label}>{t('description')}</div>

                    {/* <TextAreaUI
                      autoResize
                      minRows={10}
                      maxRows={25}
                      readOnly={!isPageForVendor}
                      currentValue={!isPageForVendor ? onlyShowDescr || '' : user?.vendorDetails?.description || ''}
                      onSetValue={(val) => {
                        updateVendorDetails({...user?.vendorDetails, description: val})
                        canUpdateVendorMedia.current = true
                      }}
                      theme='newWhite'
                      placeholder={t('descriptionPlaceholder')}
                    /> */}
                    <MarkdownEditor
                      initialValue={!isPageForVendor ? onlyShowDescr || '' : user?.vendorDetails?.description || ''}
                      onValueChange={(val) => {
                        updateVendorDetails({...user?.vendorDetails, description: val})
                        canUpdateVendorMedia.current = true
                      }}
                      readOnly={!isPageForVendor}
                    />
                    <div className={styles.vendor__description__photos}>
                      <div
                        style={{marginTop: '30px'}}
                        className={`${styles.vendor__description__label} ${styles.vendor__description__photos_new}`}
                      >
                        {isPageForVendor ? t('photos') : descriptionImages.length === 0 ? t('noPhotos') : t('photos')}
                      </div>
                      <CreateImagesInput
                        showBigFirstItem={false}
                        activeImages={descriptionImages}
                        onFilesChange={handleUploadedFilesChange}
                        onActiveImagesChange={handleActiveImagesChange}
                        maxFiles={5}
                        minFiles={0}
                        inputIdPrefix='vendorImages'
                        maxFileSize={20 * 1024 * 1024}
                        allowMultipleFiles={true}
                        allowedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
                        isOnlyShow={!isPageForVendor}
                      />
                    </div>

                    {((isPageForVendor && canUpdateVendorMedia.current) || needToSave) && (
                      <button
                        className={styles.vendor__save__button}
                        onClick={() => {
                          handleSaveMediaFiles()
                          updateVendorDetailsAPI({
                            categories: user?.vendorDetails?.productCategories?.map((cat) => cat.name) || [],
                            countries: user?.vendorDetails?.countries?.map((country) => country) || [],
                            description: user?.vendorDetails?.description,
                            inn: user?.vendorDetails?.inn,
                            phoneNumber: user?.phoneNumber,
                            region: user?.region,
                            phoneNumbers: user?.vendorDetails?.phoneNumbers,
                            emails: user?.vendorDetails?.emails,
                            sites: user?.vendorDetails?.sites,
                            address: user?.vendorDetails?.address || '',
                            login: userLogin || user?.login
                          })
                        }}
                        disabled={isSavingMedia}
                      >
                        {isSavingMedia ? t('saving') : t('save')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Контакты */}
              {currentTab === 'contacts' && (
                <div className={styles.account_tile}>
                  <div className={styles.account__header}>
                    <h2 className={styles.account__title}>{t('contacts')}</h2>
                  </div>
                  <VendorAdditionalContacts
                    onlyShowEmails={onlyShowEmail}
                    onlyShowPhones={onlyShowPhones}
                    onlyShowWebsites={onlyShowWebsites}
                    isOnlyShow={!isPageForVendor}
                  />
                </div>
              )}

              {currentTab === 'favorites' && (
                <div className={`${styles.account_tile} ${styles.account_tile_catalog}`}>
                  <div className={styles.account__header}>
                    <h2 className={styles.account__title}>{t('favorites')}</h2>
                  </div>
                  <FavoritesForProfile />
                </div>
              )}

              {/* Мои сессии */}
              {currentTab === 'sessions' && (
                <div className={styles.account_tile}>
                  <div className={styles.account__header}>
                    <h2 className={styles.account__title}>{t('mySessions')}</h2>
                  </div>
                  <SessionsTab />
                </div>
              )}

              {/* Отзывы */}
              {currentTab === 'reviews' && (
                <div className={styles.account_tile}>
                  <div className={styles.account__header}>
                    <h2 className={styles.account__title}>{t('reviews')}</h2>
                  </div>
                  <div className={styles.vendor__comments__wrapper}>
                    {reviewsLoading && reviews.length === 0 ? (
                      <div className={styles.vendor__comments__loading}>{t('loadComments')}</div>
                    ) : reviews.length === 0 && !reviewsLoading ? (
                      <div className={styles.vendor__comments__empty}>{t('noComments')}</div>
                    ) : (
                      <>
                        <ul className={styles.vendor__comments__list}>
                          {reviews.map((review) => (
                            <li key={review.id}>
                              <Comment isForVendor={true} {...review} product={review.product} />
                            </li>
                          ))}
                        </ul>
                        {renderReviewsPagination()}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* FAQ */}
              {currentTab === 'faq' && (
                <div className={styles.account_tile}>
                  {/* Header */}
                  <div className={styles.account_tile__header}>
                    <h2 style={{marginBottom: isPageForVendor ? 0 : '15px'}} className={styles.account_tile__title}>
                      {t('faq')}
                    </h2>
                  </div>

                  {/* Add FAQ Form (only for vendor) */}
                  {isPageForVendor && (
                    <div className={styles.vendor__faq__add__box}>
                      <TextInputUI
                        theme='newWhite'
                        placeholder={t('question')}
                        currentValue={newQuestionValue}
                        onSetValue={setNewQuestionValue}
                      />
                      <TextAreaUI
                        theme='newWhite'
                        minRows={1}
                        maxRows={5}
                        extraClass={styles.extra__area__class}
                        autoResize
                        placeholder={t('answer')}
                        currentValue={newAnswerValue}
                        onSetValue={setNewAnswerValue}
                      />
                      <button onClick={handleCreateNewQuestion} className={styles.vendor__faq__add__button}>
                        +
                      </button>
                    </div>
                  )}

                  {/* FAQ Accordion */}
                  <div className={styles.accordion}>
                    {faqItems.length === 0 ? (
                      <div className={styles.vendor__comments__empty}>{t('noFaqYet')}</div>
                    ) : (
                      faqItems.map((item) => {
                        const isEditing = editingFaqId === item.id
                        return (
                          <div
                            key={item.id}
                            className={`${styles.accordion__item} ${openFaqId && openFaqId?.toString() === item.id.toString() ? styles.accordion__item_open : ''} ${isEditing ? styles.accordion__item_editing : ''}`}
                          >
                            <div
                              className={styles.accordion__header}
                              onClick={() =>
                                !isEditing &&
                                setOpenFaqId(
                                  openFaqId && openFaqId.toString() === item.id.toString() ? null : Number(item.id)
                                )
                              }
                            >
                              {isEditing ? (
                                <TextInputUI
                                  theme='newWhite'
                                  placeholder={t('question')}
                                  currentValue={editQuestion}
                                  onSetValue={setEditQuestion}
                                  extraClass={styles.edit_faq_input}
                                />
                              ) : (
                                <h2 className={styles.accordion__title}>{item.title}</h2>
                              )}
                              <div className={styles.accordion__controls}>
                                {isPageForVendor && !isEditing && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleFaqDelete(item.id)
                                    }}
                                    className={styles.accordion__delete_button}
                                  >
                                    <svg
                                      width='20'
                                      height='20'
                                      viewBox='0 0 20 20'
                                      fill='none'
                                      xmlns='http://www.w3.org/2000/svg'
                                    >
                                      <path
                                        d='M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332'
                                        stroke='#AC2525'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                      />
                                      <path
                                        d='M7.08301 4.14167L7.26634 3.05C7.39967 2.25833 7.49967 1.66667 8.90801 1.66667H11.0913C12.4997 1.66667 12.608 2.29167 12.733 3.05833L12.9163 4.14167'
                                        stroke='#AC2525'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                      />
                                      <path
                                        d='M15.708 7.61667L15.1663 16.0083C15.0747 17.3167 14.9997 18.3333 12.6747 18.3333H7.32467C4.99967 18.3333 4.92467 17.3167 4.83301 16.0083L4.29134 7.61667'
                                        stroke='#AC2525'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                      />
                                      <path
                                        d='M8.60986 13.75H11.3849'
                                        stroke='#AC2525'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                      />
                                      <path
                                        d='M7.91699 10.4167H12.0837'
                                        stroke='#AC2525'
                                        strokeWidth='1.5'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                      />
                                    </svg>
                                  </button>
                                )}
                                {isPageForVendor && !isEditing && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleFaqEdit(item.id)
                                    }}
                                    className={styles.accordion__delete_button}
                                  >
                                    <svg
                                      width='22'
                                      height='22'
                                      viewBox='0 0 22 22'
                                      fill='none'
                                      xmlns='http://www.w3.org/2000/svg'
                                    >
                                      <path
                                        d='M12.1554 3.29963L4.62956 11.2655C4.34539 11.568 4.07039 12.1638 4.01539 12.5763L3.67623 15.5463C3.55706 16.6188 4.32706 17.3521 5.39039 17.1688L8.34206 16.6646C8.75456 16.5913 9.33206 16.2888 9.61623 15.9771L17.1421 8.0113C18.4437 6.6363 19.0304 5.0688 17.0046 3.15296C14.9879 1.25546 13.4571 1.92463 12.1554 3.29963Z'
                                        stroke='#2F2F2F'
                                        strokeWidth='1.5'
                                        strokeMiterlimit='10'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                      />
                                      <path
                                        d='M10.8984 4.62891C11.2926 7.15891 13.3459 9.09307 15.8943 9.34974'
                                        stroke='#2F2F2F'
                                        strokeWidth='1.5'
                                        strokeMiterlimit='10'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                      />
                                      <path
                                        d='M2.75 20.167H19.25'
                                        stroke='#2F2F2F'
                                        strokeWidth='1.5'
                                        strokeMiterlimit='10'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                      />
                                    </svg>
                                  </button>
                                )}
                                {!isEditing && <span className={styles.accordion__toggle}></span>}
                              </div>
                            </div>
                            <div className={styles.accordion__content}>
                              {isEditing ? (
                                <div className={styles.edit_faq_content}>
                                  <TextAreaUI
                                    theme='newWhite'
                                    minRows={3}
                                    maxRows={10}
                                    autoResize
                                    placeholder={t('answer')}
                                    currentValue={editAnswer}
                                    onSetValue={setEditAnswer}
                                    extraClass={styles.edit_faq_textarea}
                                  />
                                  <div className={styles.edit_faq_buttons}>
                                    <button onClick={handleCancelEdit} className={styles.edit_faq_cancel}>
                                      {t('cancel')}
                                    </button>
                                    <button
                                      onClick={() => handleFaqSave(item.id)}
                                      className={styles.edit_faq_save}
                                      disabled={!editQuestion.trim() || !editAnswer.trim()}
                                    >
                                      {t('save')}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className={styles.value__text}>{item.value}</p>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Товары компании */}
          <div className={styles.vendor__products__box}>
            {/* <div className={styles.products__titles__box}>
              <h3 className={styles.vendor__products__title}>
                {isPageForVendor ? t('myProducts') : t('companyProducts')}
              </h3>
              <SearchInputUI useNewBorder vendorId={vendorData?.id?.toString()} />
            </div> */}
            <div className={styles.products__list}>
              <div className={styles.full_width}>
                {/* <Filters />
              <CardsCatalog
                extraButtonsBoxClass={styles.extraButtonsBoxClass}
                initialProducts={initialProductsForView}
                canCreateNewProduct={isPageForVendor}
                specialRoute={isPageForVendor ? '/me/products-summary' : `/vendor/${vendorData?.id}/products-summary`}
              /> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно выхода */}
      <ModalWindowDefault isOpen={wantQuite && !isLogoutPending} onClose={() => setWantQuite(false)}>
        <p style={{textAlign: 'center', fontWeight: '500', fontSize: '24px', margin: '10px 0 40px 0'}}>
          {t('wannaGetOut')}
        </p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '40px'}}>
          <button
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: '500',
              // backgroundColor: '#0047BA',
              background: ' linear-gradient(#0047ba, #1869ef)',
              color: '#fff'
            }}
            onClick={() => setWantQuite(false)}
          >
            {t('cancel')}
          </button>
          <button
            style={{
              padding: '10px 35px',
              fontSize: '16px',
              fontWeight: '500',
              background: 'linear-gradient(#e1251b, #eb5a53)',
              color: '#fff'
            }}
            onClick={handleLogout}
          >
            {t('logout')}
          </button>
        </div>
      </ModalWindowDefault>
    </>
  )
}

export default VendorPageComponent
