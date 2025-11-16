'use client'
import {FC, useCallback, useEffect, useState} from 'react'
import styles from './ProfilePage.module.scss'
import Header from '@/components/MainComponents/Header/Header'
import instance from '@/api/api.interceptor'
import {getAccessToken} from '@/services/auth/auth.helper'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import Card from '@/components/UI-kit/elements/card/card'
import ProfilePageBottomDelivery from './ProfilePageBottom/ProfilePageBottomDelivery'
import ProfileForm from './ProfileForm/ProfileForm'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {User} from '@/services/users.types'
import {useRouter} from 'next/navigation'
import Footer from '@/components/MainComponents/Footer/Footer'
import {toast} from 'sonner'
import {useLocale, useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import Avatar from '@/components/UI-kit/inputs/Avatar/Avatar'
import {useLogout} from '@/hooks/useUserApi'
import DeleteAccountButton from '@/components/UI-kit/buttons/DeleteAccountButton/DeleteAccountButton'
import {useActions} from '@/hooks/useActions'
import Image from 'next/image'
import FavoritesForProfile from '../FavoritesPage/FavoritesForProfile/FavoritesForProfile'

// Константы
export const ASSETS_COUNTRIES = {
  avatar1: '/avatars/avatar-v-2.svg',
  belarusSvg: '/belarus.svg',
  kazakhstanSvg: '/countries/kazakhstan.svg',
  chinaSvg: '/countries/china.svg',
  russiaSvg: '/countries/russia.svg',
  redStar: '/profile/red_star.svg',
  basket: '/profile/red_basket.svg',
  paymentsList: [
    {title: 'Банковская карта – Альфа банк', value: '1234 1234 1234 1234'},
    {title: 'Банковская карта – Сбербанк', value: '4132 1234 4123 1234'},
    {title: 'ERIP', value: '1234567ER0000001231PB'}
  ]
}

type TCurrentLang = 'ru' | 'en' | 'zh' | 'hi'

function formatDateLocalized(dateString: string, currentLang: TCurrentLang): string {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    switch (currentLang) {
      case 'en':
        return 'Invalid date'
      case 'zh':
        return '无效日期'
      case 'hi':
        return 'अमान्य तिथि'
      default:
        return 'Некорректная дата'
    }
  }

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
      return `${year}年 ${months.zh[month]} ${day}日`

    case 'hi':
      // обычный формат: 15 मई 2024
      return `${day} ${months.hi[month]} ${year}`

    default:
      return `${day} ${months.ru[month]} ${year} года`
  }
}

// Типы
interface ProfileHeaderProps {
  userData?: User
  isPageForVendor?: boolean
  onLoginChange?: (newLogin: string) => void
}

interface ProfileActionsProps {
  onDeleteAccount: () => void
  onLogout: () => void
  needToSave: boolean
  isLoading: boolean
  isForVendor?: boolean
  phoneNumber?: string
  region?: string
  inn?: string
  address?: string
  countries?: string[]
  categories?: string[]
  login?: string
}

interface RecentlyViewedProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  latestViews: any[]
  isEmpty: boolean
}

// Хук для загрузки данных пользователя
export const useUserData = () => {
  const [userData, setUserData] = useState<User>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const accessToken = getAccessToken()
  const currentLang = useCurrentLanguage()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await instance.get<User>('/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!,
            'Accept-Language': currentLang,
            'x-language': currentLang
          }
        })
        setUserData(response.data)
      } catch (e) {
        setError(e as Error)
        console.error('Failed to fetch user data:', e)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken) {
      fetchUserData()
    }
  }, [accessToken])

  return {userData, loading, error}
}

// Компонент заголовка профиля
export const ProfileHeader: FC<ProfileHeaderProps> = ({userData, isPageForVendor = true, onLoginChange}) => {
  const {updateUserAvatar} = useActions()
  const [login, setLogin] = useState(userData?.login || '')
  const t = useTranslations('ProfilePage')

  useEffect(() => {
    if (userData?.login) {
      setLogin(userData.login)
    }
  }, [userData?.login])

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLogin = e.target.value
    setLogin(newLogin)
    if (onLoginChange) {
      onLoginChange(newLogin)
    }
  }

  return (
    <div className={styles.profile__user__box__inner}>
      <Avatar
        onAvatarChange={(newAvatarUrl: string | null) => {
          console.log('newAvatarUrl', newAvatarUrl)
          updateUserAvatar(newAvatarUrl || '')
        }}
        isOnlyShow={!isPageForVendor}
        avatarUrl={userData?.avatarUrl}
      />
      <div className={styles.user__names__box}>
        <input
          type='text'
          value={login}
          onChange={handleLoginChange}
          className={styles.user__name__input}
          placeholder={t('enterLogin') || 'Введите логин'}
          disabled={!isPageForVendor}
        />
        <p className={styles.user__email}>{userData?.email}</p>
      </div>
    </div>
  )
}

// Компонент сайдбара меню
const Sidebar: FC<{
  extraClass?: string
  sidebarShow: boolean
  setShowSidebar: (val: boolean) => void
  currentTab: string
  onTabChange: (tab: 'profile' | 'recentlyView' | 'favorites' | 'comments' | 'sessions') => void
  onLogout: () => void
  onDeleteAccount: () => void
}> = ({currentTab, onTabChange, onLogout, extraClass, setShowSidebar, sidebarShow}) => {
  const t = useTranslations('ProfilePage')

  return (
    <div
      className={`${styles.account_layout__sidebar} ${extraClass} ${
        sidebarShow ? styles.sidebarOpen : styles.sidebarClosed
      }`}
    >
      <nav className={styles.menu_human}>
        <div className={styles.menu_human__flex}>
          <ul className={styles.menu_human__list}>
            {/* PROFILE */}
            <li
              onClick={() => {
                setShowSidebar(false)
              }}
              className={currentTab === 'profile' ? styles.active : ''}
            >
              <a
                href='#'
                className={sidebarShow ? styles.defaultColor : styles.accentColor}
                onClick={(e) => {
                  e.preventDefault()
                  onTabChange('profile')
                }}
              >
                <svg
                  className={`${sidebarShow ? styles.defaultColor : styles.accentColor}`}
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z'
                    stroke={currentTab === 'profile' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={sidebarShow ? (currentTab === 'profile' ? '1' : '0.5') : '1'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M20.5901 22C20.5901 18.13 16.7402 15 12.0002 15C7.26015 15 3.41016 18.13 3.41016 22'
                    stroke={currentTab === 'profile' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={sidebarShow ? (currentTab === 'profile' ? '1' : '0.5') : '1'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>{t('personalData')}</span>
              </a>
            </li>

            {/* FAVORITES */}
            <li
              onClick={() => {
                setShowSidebar(false)
              }}
              className={currentTab === 'favorites' ? styles.active : ''}
            >
              <a
                href='#'
                className={sidebarShow ? styles.defaultColor : styles.accentColor}
                onClick={(e) => {
                  e.preventDefault()
                  onTabChange('favorites')
                }}
              >
                <svg
                  className={sidebarShow ? styles.defaultColor : styles.accentColor}
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M13.7309 3.51014L15.4909 7.03014C15.7309 7.52014 16.3709 7.99014 16.9109 8.08014L20.1009 8.61014C22.1409 8.95014 22.6209 10.4301 21.1509 11.8901L18.6709 14.3701C18.2509 14.7901 18.0209 15.6001 18.1509 16.1801L18.8609 19.2501C19.4209 21.6801 18.1309 22.6201 15.9809 21.3501L12.9909 19.5801C12.4509 19.2601 11.5609 19.2601 11.0109 19.5801L8.02089 21.3501C5.88089 22.6201 4.58089 21.6701 5.14089 19.2501L5.85089 16.1801C5.98089 15.6001 5.75089 14.7901 5.33089 14.3701L2.85089 11.8901C1.39089 10.4301 1.86089 8.95014 3.90089 8.61014L7.09089 8.08014C7.62089 7.99014 8.26089 7.52014 8.50089 7.03014L10.2609 3.51014C11.2209 1.60014 12.7809 1.60014 13.7309 3.51014Z'
                    stroke={currentTab === 'favorites' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={currentTab === 'favorites' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>{t('favorites')}</span>
              </a>
            </li>

            {/* RECENTLY VIEWED */}
            <li
              onClick={() => {
                setShowSidebar(false)
              }}
              className={currentTab === 'recentlyView' ? styles.active : ''}
            >
              <a
                href='#'
                className={sidebarShow ? styles.defaultColor : styles.accentColor}
                onClick={(e) => {
                  e.preventDefault()
                  onTabChange('recentlyView')
                }}
              >
                <svg
                  className={sidebarShow ? styles.defaultColor : styles.accentColor}
                  width='22'
                  height='23'
                  viewBox='0 0 22 23'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M16.041 16.5415L20.166 20.6665'
                    stroke={currentTab === 'recentlyView' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={currentTab === 'recentlyView' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M18.334 10.5835C18.334 6.02715 14.6404 2.3335 10.084 2.3335C5.52764 2.3335 1.83398 6.02715 1.83398 10.5835C1.83398 15.1399 5.52764 18.8335 10.084 18.8335C14.6404 18.8335 18.334 15.1399 18.334 10.5835Z'
                    stroke={currentTab === 'recentlyView' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={currentTab === 'recentlyView' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                    strokeWidth='1.5'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>{t('recentlyViewed')}</span>
              </a>
            </li>

            {/* COMMENTS */}
            <li
              onClick={() => {
                setShowSidebar(false)
              }}
              className={currentTab === 'comments' ? styles.active : ''}
            >
              <a
                href='#'
                className={sidebarShow ? styles.defaultColor : styles.accentColor}
                onClick={(e) => {
                  e.preventDefault()
                  onTabChange('comments')
                }}
              >
                <svg
                  className={sidebarShow ? styles.defaultColor : styles.accentColor}
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M22 6.25V11.35C22 12.62 21.58 13.69 20.83 14.43C20.09 15.18 19.02 15.6 17.75 15.6V17.41C17.75 18.09 16.99 18.5 16.43 18.12L15.46 17.48C15.55 17.17 15.59 16.83 15.59 16.47V12.4C15.59 10.36 14.23 9 12.19 9H5.39999C5.25999 9 5.13 9.01002 5 9.02002V6.25C5 3.7 6.7 2 9.25 2H17.75C20.3 2 22 3.7 22 6.25Z'
                    stroke={currentTab === 'comments' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={currentTab === 'comments' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M15.59 12.4V16.47C15.59 16.83 15.55 17.17 15.46 17.48C15.09 18.95 13.87 19.87 12.19 19.87H9.47L6.45 21.88C6 22.19 5.39999 21.86 5.39999 21.32V19.87C4.37999 19.87 3.53 19.53 2.94 18.94C2.34 18.34 2 17.49 2 16.47V12.4C2 10.5 3.18 9.19002 5 9.02002C5.13 9.01002 5.25999 9 5.39999 9H12.19C14.23 9 15.59 10.36 15.59 12.4Z'
                    stroke={currentTab === 'comments' ? '#0047BA' : '#2F2F2F'}
                    strokeOpacity={currentTab === 'comments' ? (sidebarShow ? '1' : '0.5') : '0.5'}
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>{t('myReviews')}</span>
              </a>
            </li>

            {/* SESSIONS */}
            <li
              onClick={() => {
                setShowSidebar(false)
              }}
              className={currentTab === 'sessions' ? styles.active : ''}
            >
              <a
                href='#'
                className={sidebarShow ? styles.defaultColor : styles.accentColor}
                onClick={(e) => {
                  e.preventDefault()
                  onTabChange('sessions')
                }}
              >
                <svg
                  className={sidebarShow ? styles.defaultColor : styles.accentColor}
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
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
          </ul>

          <ul className={styles.menu_human__list}>
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
        </div>
      </nav>
    </div>
  )
}

// Компонент действий профиля
export const ProfileActions: FC<ProfileActionsProps> = ({
  needToSave,
  isLoading,
  phoneNumber,
  region,
  inn,
  countries,
  categories,
  isForVendor,
  address,
  login
}) => {
  const t = useTranslations('ProfilePage')
  const currentLang = useCurrentLanguage()
  const vendorDetails = useTypedSelector((state) => state.user?.user?.vendorDetails)
  const userData = useTypedSelector((state) => state.user?.user)

  const onSave = () => {
    let numberStartWith = ''
    switch (region) {
      case 'Belarus':
        numberStartWith = '+375'
        break
      case 'Kazakhstan':
        numberStartWith = '+7'
        break
      case 'China':
        numberStartWith = '+86'
        break
      case 'Russia':
        numberStartWith = '+7'
        break
      case 'Other':
        numberStartWith = '+'
        break
    }
    try {
      if (isForVendor) {
        const res = instance.patch(
          '/me',
          {
            phoneNumber: numberStartWith + phoneNumber,
            inn,
            countries,
            categories,
            address: vendorDetails?.address || address || '',
            login: login || userData?.login
          },
          {
            headers: {
              'Accept-Language': currentLang,
              'x-language': currentLang
            }
          }
        )
        console.log(res)
      } else {
        const res = instance.patch(
          '/me',
          {
            phoneNumber: (() => {
              const fullNumber = numberStartWith + phoneNumber
              return !['+7', '+375', '+86', '7', '375', '86'].includes(fullNumber.trim()) ? fullNumber : ''
            })(),
            region,
            login: login || userData?.login
          },
          {
            headers: {
              'Accept-Language': currentLang,
              'x-language': currentLang
            }
          }
        )
        console.log(res)
      }
      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('congratulations')}</strong>
          <span>{t('dataSuccessfullyChanged')}</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          }
        }
      )
    } catch {
      toast.error(t('dataErrorChange'))
    }
  }

  return (
    <div className={styles.buttons__box__save__logout}>
      {needToSave && !isLoading && (
        <button className={styles.save__button} onClick={onSave}>
          {t('save')}
        </button>
      )}
    </div>
  )
}

const RecentlyViewed: FC<RecentlyViewedProps> = ({latestViews, isEmpty}) => {
  const [isClient, setIsClient] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const t = useTranslations('ProfilePage')

  useEffect(() => {
    setIsClient(true)

    const calculateItemsPerPage = () => {
      const containerWidth = window.innerWidth - 80
      const minColWidth = 200
      const gap = 20

      let columns = Math.floor((containerWidth + gap) / (minColWidth + gap))
      columns = Math.max(2, Math.min(3, columns))

      setItemsPerPage(columns * 2)
    }

    calculateItemsPerPage()
    window.addEventListener('resize', calculateItemsPerPage)

    return () => window.removeEventListener('resize', calculateItemsPerPage)
  }, [])

  const totalPages = Math.ceil(latestViews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = latestViews.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({top: 0, behavior: 'smooth'})
    }
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []

    pages.push(
      <a
        key={1}
        href='#'
        onClick={(e) => {
          e.preventDefault()
          handlePageChange(1)
        }}
        className={`${styles.exp_pagination__link} ${currentPage === 1 ? styles.exp_pagination__link_active : ''}`}
      >
        1
      </a>
    )

    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    if (startPage > 2) {
      pages.push(
        <span key='ellipsis-start' className={styles.exp_pagination__ellipsis}>
          ...
        </span>
      )
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <a
          key={i}
          href='#'
          onClick={(e) => {
            e.preventDefault()
            handlePageChange(i)
          }}
          className={`${styles.exp_pagination__link} ${currentPage === i ? styles.exp_pagination__link_active : ''}`}
        >
          {i}
        </a>
      )
    }

    if (endPage < totalPages - 1) {
      pages.push(
        <span key='ellipsis-end' className={styles.exp_pagination__ellipsis}>
          ...
        </span>
      )
    }

    if (totalPages > 1) {
      pages.push(
        <a
          key={totalPages}
          href='#'
          onClick={(e) => {
            e.preventDefault()
            handlePageChange(totalPages)
          }}
          className={`${styles.exp_pagination__link} ${
            currentPage === totalPages ? styles.exp_pagination__link_active : ''
          }`}
        >
          {totalPages}
        </a>
      )
    }

    return (
      <div className={styles.justify_content_center}>
        <div className={styles.exp_pagination}>
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(currentPage - 1)
            }}
            className={`${styles.exp_pagination__link} ${styles.exp_pagination__link_prev} ${
              currentPage === 1 ? styles.exp_pagination__link_disabled : ''
            }`}
          />
          {pages}
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(currentPage + 1)
            }}
            className={`${styles.exp_pagination__link} ${styles.exp_pagination__link_next} ${
              currentPage === totalPages ? styles.exp_pagination__link_disabled : ''
            }`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.account_tile} ${styles.account_tile_catalog}`}>
      {isClient && !isEmpty && (
        <>
          <div className={styles.account_vitrine}>
            <div className={styles.products_grid}>
              {currentProducts.map((product) => (
                <div key={product.id} className={styles.product_card_wrapper}>
                  <Card
                    isLoading={false}
                    id={product.id}
                    title={product.title}
                    price={product.originalPrice}
                    discount={product.discount}
                    previewImageUrl={product.previewImageUrl}
                    discountedPrice={product.discountedPrice}
                    deliveryMethod={product.deliveryMethods?.[0]}
                    fullProduct={product}
                  />
                </div>
              ))}
            </div>
          </div>
          {renderPagination()}
        </>
      )}
      {isClient && isEmpty && <p className={styles.empty__message}>{t('notHaveRecentlyViewed')}</p>}
    </div>
  )
}

// Компонент сессий
const SessionsTab: FC = () => {
  const t = useTranslations('ProfilePage')
  const currentLang = useCurrentLanguage()
  const locale = useLocale()
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await instance.get<
          {
            id: string
            deviceId: string
            deviceType: string
            browser: string
            os: string
            ipAddress: string
            lastLoginDate: string | Date
          }[]
        >('/me/sessions', {
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
      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('congratulations')}</strong>
          <span>{t('deletedSuccess')}</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          }
        }
      )
    } catch (e) {
      console.error(e)
      toast.dismiss(loadingToast)
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('defaultError')}</strong>
          <span>{t('deletedError')}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
    }
  }

  return (
    <div className={styles.account_tile}>
      <div className={styles.account__header}>
        <h2 className={styles.account__title}>{t('mySessions')}</h2>
      </div>
      <ul className={styles.modal__sessions__list}>
        {sessions.map((el, i) => {
          if (el.deviceType === 'Unknown' && el.browser === 'Unknown') return
          return (
            <li style={{width: '100%', display: 'flex', alignItems: 'center'}} key={i}>
              <div className={styles.modal__sessions__list__item}>
                <p className={`${styles.device__type}`}>
                  <span className={`${styles.sessions__item__title}`}> {t('deviceType')}:</span>{' '}
                  <span className={`${styles.sessions__item__value}`}>{el.deviceType}</span>
                </p>
                <p className={`${styles.browser}`}>
                  <span className={`${styles.sessions__item__title}`}> {t('browser')}:</span>{' '}
                  <span className={`${styles.sessions__item__value}}`}>{el.browser}</span>
                </p>
                <p className={`${styles.os}`}>
                  <span className={`${styles.sessions__item__title}`}> {t('os')}:</span>{' '}
                  <span className={`${styles.sessions__item__value}}`}>{el.os}</span>
                </p>
                <p className={`${styles.last__login__date}`}>
                  <span className={`${styles.sessions__item__title}`}> {t('lastLoginDate')}:</span>{' '}
                  <span className={`${styles.sessions__item__value}`}>
                    {typeof el.lastLoginDate === 'string'
                      ? formatDateLocalized(el.lastLoginDate, (locale || currentLang) as TCurrentLang)
                      : formatDateLocalized(el.lastLoginDate.toISOString(), (locale || currentLang) as TCurrentLang)}
                  </span>
                </p>
                <button
                  className={styles.modal__sessions__list__item__button}
                  onClick={() => {
                    handleDeleteSession(el.id)
                  }}
                >
                  <Image alt='delete session' width={26} height={26} src='iconsNew/crestNew.svg' />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const ProfilePage: FC<{firstUserData?: User}> = ({firstUserData}) => {
  const {userData, loading, error} = useUserData()
  const {latestViews, isEmpty} = useTypedSelector((state) => state.latestViews)
  const [needToSave, setNeedToSave] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const router = useRouter()
  const {mutate: logout, isPending: isLogoutPending} = useLogout()
  const [wantQuite, setWantQuite] = useState(false)
  const [sidebarShow, setSidebarShow] = useState(true)
  const [currentTab, setCurrentTab] = useState<'profile' | 'recentlyView' | 'favorites' | 'comments' | 'sessions'>(
    'profile'
  )
  const currentLang = useCurrentLanguage()
  const handleLogout = () => {
    if (isLogoutPending) return
    logout()
  }

  const [userPhoneNumber, setUserPhoneNumber] = useState(firstUserData?.phoneNumber)
  const [userRegion, setUserRegion] = useState(firstUserData?.region)
  const [userLogin, setUserLogin] = useState(firstUserData?.login)

  const t = useTranslations('ProfilePage')

  useEffect(() => {
    if (!loading && userData) {
      setNeedToSave(false)
      setInitialLoadComplete(true)
    }
  }, [loading, userData])

  const safeSetNeedToSave = useCallback(
    (value: boolean) => {
      if (initialLoadComplete) {
        setNeedToSave(value)
      }
    },
    [initialLoadComplete]
  )

  const handleDeleteAccount = () => {
    // TODO: Implement delete account logic
  }

  interface RegionType {
    imageSrc: string
    title: string
    altName: string
  }
  const REGIONS: RegionType[] = [
    {imageSrc: ASSETS_COUNTRIES.belarusSvg, title: t('belarus'), altName: 'Belarus'},
    {imageSrc: ASSETS_COUNTRIES.kazakhstanSvg, title: t('kazakhstan'), altName: 'Kazakhstan'},
    {imageSrc: ASSETS_COUNTRIES.chinaSvg, title: t('china'), altName: 'China'},
    {imageSrc: ASSETS_COUNTRIES.russiaSvg, title: t('russia'), altName: 'Russia'}
  ]

  if (error) {
    router.push('/login')
    return
  }

  const getTabTitle = () => {
    switch (currentTab) {
      case 'profile':
        return t('personalData')
      case 'favorites':
        return t('favorites')
      case 'recentlyView':
        return t('recentlyViewed')
      case 'comments':
        return t('myReviews')
      case 'sessions':
        return t('mySessions')
      default:
        return t('personalData')
    }
  }

  return (
    <div>
      <Header />
      <div className='container'>
        <div className={styles.account_human}>
          <div className={styles.section_header}>
            <div className={styles.section_header__title}>{t('personalCabinet')}</div>
          </div>

          <div className={styles.account_layout}>
            <Sidebar
              extraClass={sidebarShow ? styles.showPhoneSidebar : styles.hidePhoneSidebar}
              setShowSidebar={setSidebarShow}
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              onLogout={() => setWantQuite(true)}
              sidebarShow={sidebarShow}
              onDeleteAccount={handleDeleteAccount}
            />

            <div
              onClick={() => {
                setSidebarShow(true)
              }}
              className={`${styles.hide__sidebar__menu} ${!sidebarShow ? styles.showPhoneTitleSide : styles.hidePhoneTitleSide}`}
            >
              <h2 className={styles.account__title}>{getTabTitle()}</h2>
              <div className={styles.full__mobile__width} style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                {currentTab === 'profile' && (
                  <div className={styles.account__date}>
                    <span>{t('registrationDate')}</span>
                    <span>
                      {userData?.registrationDate
                        ? formatDateLocalized(
                            userData.registrationDate,
                            (currentLang as TCurrentLang) || ('en' as TCurrentLang)
                          )
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

            <div
              className={`${styles.account_layout__content} ${!sidebarShow ? styles.showPhoneMainContent : styles.hidePhoneMainContent}`}
            >
              {currentTab === 'profile' && (
                <div className={styles.account_tile}>
                  <div className={styles.account__header}>
                    <h2 className={styles.account__title}>{getTabTitle()}</h2>
                    <div className={styles.account__inrow}>
                      <div className={styles.account__date}>
                        <span>{t('registrationDate')}</span>
                        <span>
                          {userData?.registrationDate
                            ? formatDateLocalized(
                                userData.registrationDate,
                                (currentLang as TCurrentLang) || ('en' as TCurrentLang)
                              )
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ProfileHeader
                    userData={firstUserData || userData}
                    isPageForVendor={true}
                    onLoginChange={(newLogin) => {
                      setUserLogin(newLogin)
                      safeSetNeedToSave(true)
                    }}
                  />

                  <ProfileForm
                    setNeedToSave={safeSetNeedToSave}
                    isLoading={loading}
                    userData={firstUserData || userData}
                    regions={REGIONS}
                    onUserDataChange={(data) => {
                      console.log('Обновленные данные:', data)
                      setUserPhoneNumber(data.phoneNumber)
                      setUserRegion(data.region)
                    }}
                  />
                  <ProfileActions
                    phoneNumber={userPhoneNumber}
                    region={userRegion}
                    login={userLogin}
                    isLoading={loading}
                    needToSave={needToSave}
                    onDeleteAccount={handleDeleteAccount}
                    onLogout={handleLogout}
                  />
                </div>
              )}

              {currentTab === 'recentlyView' && <RecentlyViewed latestViews={latestViews} isEmpty={isEmpty} />}

              {currentTab === 'favorites' && (
                <div className={`${styles.account_tile} ${styles.account_tile_catalog}`}>
                  <div className={styles.account__header}>
                    <h2 className={styles.account__title}>{t('favorites')}</h2>
                  </div>
                  <FavoritesForProfile />
                </div>
              )}

              {currentTab === 'comments' && (
                <div className={styles.account_tile}>
                  <div className={styles.account__header}>
                    <h2 className={styles.account__title}>{t('myReviews')}</h2>
                  </div>
                  <ProfilePageBottomDelivery />
                </div>
              )}

              {currentTab === 'sessions' && <SessionsTab />}
            </div>
          </div>
        </div>
      </div>

      <ModalWindowDefault
        isOpen={wantQuite}
        onClose={() => {
          setWantQuite(false)
        }}
      >
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

      <Footer useFixedFooter />
    </div>
  )
}

export default ProfilePage
