/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import Header from '@/components/MainComponents/Header/Header'
import {FC, useCallback, useEffect, useState, useRef, useMemo} from 'react'
import ProfileForm from '../ProfilePage/ProfileForm/ProfileForm'
import {ProfileHeader, ASSETS_COUNTRIES} from '../ProfilePage/ProfilePage'
import styles from './VendorPage.module.scss'
import instance from '@/api/api.interceptor'
import Image from 'next/image'
import {useAnimatedCounter} from '@/hooks/useAnimatedCounter'
import Comment from '@/components/UI-kit/elements/Comment/Comment'
import {useProductReviews} from '@/hooks/useMyProductsReviews'
import SearchInputUI from '@/components/UI-kit/inputs/SearchInputUI/SearchInputUI'
import CardsCatalog from '@/components/screens/Catalog/CardsCatalog/CardsCatalog'
import useWindowWidth from '@/hooks/useWindoWidth'
import {removeFromStorage} from '@/services/auth/auth.helper'
import {useRouter} from 'next/navigation'
import {Product} from '@/services/products/product.types'
import Accordion from '@/components/UI-kit/Texts/Accordions/Accordions'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import Filters from '@/components/screens/Filters/Filters'
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

const yellowStars = '/comments/yellow__start.svg'

type TCurrentTab = 'personalData' | 'contacts' | 'sessions' | 'reviews' | 'faq'

// Компонент для IntersectionObserver
const IntersectionObserverElement = ({observerRef}: {observerRef: (node: HTMLDivElement | null) => void}) => {
  return (
    <div
      style={{
        height: '20px',
        width: '100%',
        background: 'transparent'
      }}
      ref={observerRef}
    />
  )
}

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
    ]
  }

  if (currentLang === 'en') {
    return `${months.en[month]} ${day}, ${year}`
  }
  return `${day} ${months.ru[month]} ${year} года`
}

// Компонент Sidebar
const Sidebar: FC<{
  currentTab: TCurrentTab
  onTabChange: (tab: TCurrentTab) => void
  onLogout: () => void
  onDeleteAccount: () => void
  userData?: IVendorData
  isPageForVendor: boolean
  sidebarShow: boolean

  setShowSidebar: (val: boolean) => void
}> = ({currentTab, onTabChange, onLogout, userData, isPageForVendor, sidebarShow, setShowSidebar}) => {
  const t = useTranslations('VendorPage')
  const {updateUserAvatar} = useActions()

  return (
    <div className={`${styles.account_layout__sidebar} ${sidebarShow ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <nav className={styles.menu_company}>
        {/* Аватарка */}
        <div className={styles.acc_compavatar}>
          <Avatar
            onAvatarChange={(newAvatarUrl: string | null) => {
              updateUserAvatar(newAvatarUrl || '')
            }}
            isOnlyShow={!isPageForVendor}
            avatarUrl={userData?.avatarUrl}
          />
          <div className={styles.acc_compavatar__group}>
            <span className={styles.acc_compavatar__name}>{userData?.login}</span>
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
                {/* <span>Личные данные</span> */}
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

            {/* Мои сессии */}
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
                onClick={() => {
                  setShowSidebar(false)
                }}
              >
                <Link href='/create-card'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M8 12H16'
                      stroke='#2F2F2F'
                      strokeOpacity='0.5'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M12 16V8'
                      stroke='#2F2F2F'
                      strokeOpacity='0.5'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z'
                      stroke='#2F2F2F'
                      strokeOpacity='0.5'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <span>{t('createProduct')}</span>
                </Link>
              </li>
            )}
          </ul>

          {/* Нижние кнопки */}
          <ul className={styles.menu_company__list}>
            {isPageForVendor && <DeleteAccountButton buttonText='delete' />}
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
  vendorData,
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

  const {data: userData, isLoading: loading} = useUserQuery()
  const {mutate: logout, isPending: isLogoutPending} = useLogout()
  const router = useRouter()
  const windowWidth = useWindowWidth()
  const t = useTranslations('VendorPage')
  const currentLang = useCurrentLanguage()

  const {user} = useTypedSelector((state) => state.user)
  const {updateVendorDetails} = useActions()
  const {mutate: updateVendorDetailsAPI} = useUpdateVendorDetails()

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
  const [isQuestOpen, setIsQuestOpen] = useState(false)

  // Состояния для текущих значений
  const [userPhoneNumber, setUserPhoneNumber] = useState(vendorData?.phoneNumber)
  const [userCountries, setUserCountries] = useState(
    vendorData?.vendorDetails?.countries?.map((country) => country.name)
  )
  const [userCategories, setUserCategories] = useState(
    vendorData?.vendorDetails?.productCategories?.map((category) => category.name)
  )
  const [userInn, setUserInn] = useState(vendorData?.vendorDetails?.inn)
  const [userAddress, setUserAddress] = useState(vendorData?.vendorDetails?.address)

  const REGIONS = [
    {imageSrc: ASSETS_COUNTRIES.belarusSvg, title: t('belarus'), altName: 'Belarus'},
    {imageSrc: ASSETS_COUNTRIES.kazakhstanSvg, title: t('kazakhstan'), altName: 'Kazakhstan'},
    {imageSrc: ASSETS_COUNTRIES.chinaSvg, title: t('china'), altName: 'China'},
    {imageSrc: ASSETS_COUNTRIES.russiaSvg, title: t('russia'), altName: 'Russia'}
  ]

  // Reviews
  const reviewsParams = useMemo(
    () => ({
      size: 10,
      ...(!isPageForVendor && vendorData?.id ? {specialRoute: `vendor/${vendorData.id}`} : {})
    }),
    [isPageForVendor, vendorData?.id]
  )

  const {reviews, isLoading: reviewsLoading, hasMore, loadMoreReviews, totalElements} = useProductReviews(reviewsParams)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const scrollContainerRef = useRef<HTMLUListElement | null>(null)
  const observerTargetRef = useRef<HTMLDivElement | null>(null)

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
  }, [loading, userData])

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

  const handleCreateNewQuestion = useCallback(() => {
    try {
      instance.post(
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
      toast.success(t('successPublishedNewQuest'))
      setNewQuestionValue('')
      setNewAnswerValue('')
    } catch (e) {
      console.log(e)
      toast.error(t('errorCreatingQuestion'))
    }
  }, [newQuestionValue, newAnswerValue, currentLang, t])

  const handleDeleteQuestion = useCallback(
    (questionId: string) => {
      try {
        instance.delete(`/vendor/faq/${questionId}`, {
          headers: {
            'Accept-Language': currentLang
          }
        })
        toast.success(t('sucessDeleatFaq'))
      } catch (e) {
        console.log(e)
        toast.error(t('errorDeleatFaq'))
      }
    },
    [currentLang, t]
  )

  const handleFaqDelete = useCallback(
    (item: any) => {
      handleDeleteQuestion(item.id)
      setActiveFaq(activeFaq?.filter((itemMap) => itemMap.id !== item.id))
    },
    [activeFaq, handleDeleteQuestion]
  )

  const handleLogout = useCallback(() => {
    if (isLogoutPending) return
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
      if (initialLoadComplete) {
        setNeedToSave(value)
      }
    },
    [initialLoadComplete]
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

  // IntersectionObserver для отзывов
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (!scrollContainerRef.current || !observerTargetRef.current || !hasMore || reviewsLoading) {
      return
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !reviewsLoading) {
          loadMoreReviews()
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '150px',
        threshold: 0.1
      }
    )

    observerRef.current.observe(observerTargetRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, reviewsLoading, loadMoreReviews])

  const getTabTitle = () => {
    switch (currentTab) {
      case 'personalData':
        return t('personalData')
      case 'contacts':
        return t('contacts')
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
          <div className={styles.section_header}>
            <div className={styles.section_header__title}>{isPageForVendor ? t('myAccount') : vendorData?.login}</div>
          </div>

          <div className={styles.account_layout}>
            <Sidebar
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              onLogout={() => setWantQuite(true)}
              onDeleteAccount={() => {}}
              userData={vendorData || (userData as any)}
              isPageForVendor={isPageForVendor}
              sidebarShow={sidebarShow}
              setShowSidebar={setSidebarShow}
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
                      <div className={styles.account_tile__title}>Личные данные</div>
                      {/* <div className={styles.account_tile__title}>{t('personalData')}</div> */}
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
                                d='M22 6.25V11.35C22 12.62 21.58 13.69 20.83 14.43C20.09 15.18 19.02 15.6 17.75 15.6V17.41C17.75 18.09 16.99 18.5 16.43 18.12L15.46 17.48C15.55 17.17 15.59 16.83 15.59 16.47V12.4C15.59 10.36 14.23 9 12.19 9H5.39999C5.25999 9 5.13 9.01002 5 9.02002V6.25C5 3.7 6.7 2 9.25 2H17.75C20.3 2 22 3.7 22 6.25Z'
                                stroke='#0047BA'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                            <h3>{t('accountComments')}</h3>
                          </div>
                          <div className={styles.account_stat_card__value}>{animatedComments.toLocaleString()}</div>
                        </div>

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
                                d='M13.7309 3.51014L15.4909 7.03014C15.7309 7.52014 16.3709 7.99014 16.9109 8.08014L20.1009 8.61014C22.1409 8.95014 22.6209 10.4301 21.1509 11.8901L18.6709 14.3701C18.2509 14.7901 18.0209 15.6001 18.1509 16.1801L18.8609 19.2501C19.4209 21.6801 18.1309 22.6201 15.9809 21.3501L12.9909 19.5801C12.4509 19.2601 11.5609 19.2601 11.0109 19.5801L8.02089 21.3501C5.88089 22.6201 4.58089 21.6701 5.14089 19.2501L5.85089 16.1801C5.98089 15.6001 5.75089 14.7901 5.33089 14.3701L2.85089 11.8901C1.39089 10.4301 1.86089 8.95014 3.90089 8.61014L7.09089 8.08014C7.62089 7.99014 8.26089 7.52014 8.50089 7.03014L10.2609 3.51014C11.2209 1.60014 12.7809 1.60014 13.7309 3.51014Z'
                                stroke='#0047BA'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                            <h3>{t('rating')}</h3>
                          </div>
                          <div className={styles.account_stat_card__value_row}>
                            <span className={styles.account_stat_card__value}>{averageRating}</span>
                            <span className={styles.account_stat_card__star}>
                              <Image src={yellowStars} width={24} height={24} alt='rating' />
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
                    userData={vendorData || (userData as any)}
                    regions={REGIONS}
                  />

                  {/* Описание и фото */}
                  <div className={styles.vendor__description__section}>
                    <div className={styles.vendor__description__label}>{t('description')}</div>

                    <TextAreaUI
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
                    />

                    <div className={styles.vendor__description__photos}>
                      <div className={`${styles.vendor__description__label} ${styles.vendor__description__photos_new}`}>
                        {t('photos')}
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

                    {canUpdateVendorMedia.current && (
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
                            sites: user?.vendorDetails?.sites
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
                  <ul className={styles.vendor__comments__list} ref={scrollContainerRef}>
                    {reviewsLoading && reviews.length === 0 ? (
                      <li className={styles.vendor__comments__loading}>{t('loadComments')}</li>
                    ) : reviews.length === 0 && !reviewsLoading ? (
                      <li className={styles.vendor__comments__empty}>{t('noComments')}</li>
                    ) : (
                      <>
                        {reviews.map((review) => (
                          <li key={review.id}>
                            <Comment {...review} />
                          </li>
                        ))}
                        {hasMore && !reviewsLoading && reviews.length > 0 && (
                          <li style={{listStyle: 'none'}}>
                            <IntersectionObserverElement
                              observerRef={(node) => {
                                observerTargetRef.current = node
                              }}
                            />
                          </li>
                        )}
                        {reviewsLoading && reviews.length > 0 && (
                          <li className={styles.vendor__comments__loading__more}>{t('loadMoreCommets')}</li>
                        )}
                      </>
                    )}
                  </ul>
                </div>
              )}

              {/* FAQ */}
              {currentTab === 'faq' && (
                <div className={styles.account_tile}>
                  <div className={styles.account__header}>
                    <h2 className={styles.account__title}>{t('faq')}</h2>
                  </div>
                  {isPageForVendor && (
                    <div className={styles.vendor__faq__add__box}>
                      <TextInputUI
                        theme='lightBlue'
                        placeholder={t('question')}
                        currentValue={newQuestionValue}
                        onSetValue={setNewQuestionValue}
                      />
                      <TextInputUI
                        theme='lightBlue'
                        placeholder={t('answer')}
                        currentValue={newAnswerValue}
                        onSetValue={setNewAnswerValue}
                      />
                      <button onClick={handleCreateNewQuestion} className={styles.vendor__faq__add__button}>
                        +
                      </button>
                    </div>
                  )}
                  {isPageForVendor ? (
                    <Accordion needDeleteButton={true} onDelete={handleFaqDelete} items={faqItems} />
                  ) : (
                    <Accordion items={faqItems} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Товары компании */}
          <div className={styles.vendor__products__box}>
            <div className={styles.products__titles__box}>
              <h3 className={styles.vendor__products__title}>
                {isPageForVendor ? t('myProducts') : t('companyProducts')}
              </h3>
              <SearchInputUI vendorId={vendorData?.id?.toString()} />
            </div>
            <div className={styles.products__list}>
              <Filters />
              <CardsCatalog
                extraButtonsBoxClass={styles.extraButtonsBoxClass}
                initialProducts={initialProductsForView}
                canCreateNewProduct={isPageForVendor}
                specialRoute={isPageForVendor ? '/me/products-summary' : `/vendor/${vendorData?.id}/products-summary`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно выхода */}
      <ModalWindowDefault isOpen={wantQuite} onClose={() => setWantQuite(false)}>
        <p style={{textAlign: 'center', fontWeight: '500', fontSize: '24px', margin: '10px 0 40px 0'}}>
          {t('wannaGetOut')}
        </p>
        <div style={{display: 'flex', justifyContent: 'center', gap: '40px'}}>
          <button
            style={{
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: '500',
              backgroundColor: '#2A2E46',
              color: '#fff'
            }}
            onClick={() => setWantQuite(false)}
          >
            {t('cancel')}
          </button>
          <button
            style={{
              borderRadius: '10px',
              padding: '10px 35px',
              fontSize: '16px',
              fontWeight: '500',
              backgroundColor: '#AC2525',
              color: '#fff'
            }}
            onClick={handleLogout}
          >
            {t('logout')}
          </button>
        </div>
      </ModalWindowDefault>

      <Footer />
    </>
  )
}

export default VendorPageComponent
