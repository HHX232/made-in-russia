'use client'
import {FC, useCallback, useEffect, useState} from 'react'
import styles from './ProfilePage.module.scss'
import Header from '@/components/MainComponents/Header/Header'
import instance from '@/api/api.interceptor'
import {getAccessToken} from '@/services/auth/auth.helper'
import Image from 'next/image'
import Link from 'next/link'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import Card from '@/components/UI-kit/elements/card/card'
import ProfilePageBottomHelp from './ProfilePageBottom/ProfilePageBottomHelp'
import ProfilePageBottomDelivery from './ProfilePageBottom/ProfilePageBottomDelivery'
import ProfileForm from './ProfileForm/ProfileForm'
import ModalWindowDefault from '@/components/UI-kit/modals/ModalWindowDefault/ModalWindowDefault'
import {User} from '@/services/users.types'
import {useRouter} from 'next/navigation'
import Footer from '@/components/MainComponents/Footer/Footer'
import {toast} from 'sonner'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import Avatar from '@/components/UI-kit/inputs/Avatar/Avatar'
import {useLogout} from '@/hooks/useUserApi'
import DeleteAccountButton from '@/components/UI-kit/buttons/DeleteAccountButton/DeleteAccountButton'

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

type TCurrentLang = 'ru' | 'en' | 'zh'

function formatDateLocalized(dateString: string, currentLang: TCurrentLang = 'ru'): string {
  const date = new Date(dateString)

  // Проверка на валидность даты
  if (isNaN(date.getTime())) {
    switch (currentLang) {
      case 'en':
        return 'Invalid date'
      case 'zh':
        return '无效日期'
      default:
        return 'Некорректная дата'
    }
  }

  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  // Локализованные названия месяцев
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
    zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  }

  // Форматирование в зависимости от языка
  switch (currentLang) {
    case 'en':
      return `${months.en[month]} ${day}, ${year}` // "May 15, 2024"
    case 'zh':
      return `${year}年 ${months.zh[month]} ${day}日` // "2024年 五月 15日"
    default:
      return `${day} ${months.ru[month]} ${year} года` // "15 мая 2024 года"
  }
}

// Типы

interface ProfileHeaderProps {
  userData?: User
  isPageForVendor?: boolean
}

interface QuickActionsProps {
  onDevicesClick: (e: React.MouseEvent) => void
  onPaymentClick: (e: React.MouseEvent) => void
  isForVendor?: boolean
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
  countries?: string[]
  categories?: string[]
}

interface ProfileStatsProps {
  favoriteCount: number
  registrationDate: string
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
export const ProfileHeader: FC<ProfileHeaderProps> = ({userData, isPageForVendor = true}) => {
  return (
    <div className={styles.profile__user__box__inner}>
      <Avatar isOnlyShow={!isPageForVendor} avatarUrl={userData?.avatarUrl} />
      <div className={styles.user__names__box}>
        <p className={styles.user__name}>{userData?.login} </p>
        <p className={styles.user__email}>{userData?.email}</p>
      </div>
    </div>
  )
}

// Компонент быстрых действий
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const QuickActions: FC<QuickActionsProps> = ({onDevicesClick, onPaymentClick, isForVendor = true}) => {
  const t = useTranslations('ProfilePage')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
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

  const onNewDeviceClick = async (e: React.MouseEvent) => {
    onDevicesClick(e)
    e.preventDefault()
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
      setIsModalOpen(true)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <ul className={styles.fast__buttons__box}>
      {isForVendor && (
        <ModalWindowDefault isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <p className={styles.modal__sessions__title}>{t('mySessions')}</p>
          <ul className={styles.modal__sessions__list}>
            {sessions.map((el, i) => {
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
                          ? formatDateLocalized(el.lastLoginDate, (currentLang as TCurrentLang) || 'en')
                          : formatDateLocalized(el.lastLoginDate.toISOString(), (currentLang as TCurrentLang) || 'en')}
                      </span>
                    </p>
                  </div>
                  <button
                    className={styles.modal__sessions__list__item__button}
                    onClick={() => {
                      handleDeleteSession(el.id)
                    }}
                  >
                    X
                  </button>
                </li>
              )
            })}
          </ul>
        </ModalWindowDefault>
      )}
      {isForVendor && (
        <li className={styles.fast__buttons__box__item}>
          <button className={styles.fast__buttons__box__item__button} onClick={onNewDeviceClick}>
            {t('mySessions')}
          </button>
        </li>
      )}
      {/* <li className={styles.fast__buttons__box__item}>
        <button
          className={styles.fast__buttons__box__item__button}
          onClick={(e) => {
            e.preventDefault()
            setIsPaymentModalOpen(true)
            onPaymentClick(e)
          }}
        >
          {t('paymentsMethods')}
        </button>
      </li> */}

      <ModalWindowDefault isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
        <h3 className={styles.payments__methods__title}>{t('paymentsMethodsTitle')}</h3>

        <ul className={styles.payments__methods__list}>
          {ASSETS_COUNTRIES.paymentsList.map((el, i) => {
            return (
              <li className={styles.payments__methods__list__item} key={i}>
                <p className={styles.payments__methods__list__item__title}>{el.title}</p>
                <p className={styles.payments__methods__list__item__value}>{el.value}</p>
              </li>
            )
          })}
        </ul>
      </ModalWindowDefault>
    </ul>
  )
}

// Компонент для телефонного ввода

// Компонент формы профиля

// Компонент действий профиля
export const ProfileActions: FC<ProfileActionsProps> = ({
  needToSave,
  // onDeleteAccount,
  onLogout,
  isLoading,
  phoneNumber,
  region,
  inn,
  countries,
  categories,
  isForVendor
}) => {
  const t = useTranslations('ProfilePage')
  const currentLang = useCurrentLanguage()
  const onSave = () => {
    // console.log('Saving data:', {phoneNumber, region})
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
            categories
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
            phoneNumber: numberStartWith + phoneNumber,
            region
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

  const [wantQuite, setWantQuite] = useState(false)

  return (
    <>
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
            onClick={onLogout}
          >
            {t('logout')}
          </button>
        </div>
      </ModalWindowDefault>
      {/* <ul className={styles.buttons__logouts__box}>
        <li className={styles.buttons__logouts__box__item}>
          <button className={styles.buttons__logouts__box__button} onClick={onDeleteAccount}>
            {t('deleteAccount')}
          </button>
        </li>
      </ul> */}
      <DeleteAccountButton buttonText={t('deleteAccount')} />
      <div className={styles.buttons__box__save__logout}>
        <button
          onClick={() => setWantQuite(true)}
          // ${needToSave && !isLoading && styles.logout__button__left}
          className={`${styles.logout__button} `}
        >
          {t('logout')}
        </button>
        {needToSave && !isLoading && (
          <button className={`${styles.save__button} ${styles.save__animation} `} onClick={onSave}>
            {t('save')}
          </button>
        )}
      </div>
    </>
  )
}

// Компонент статистики профиля
const ProfileStats: FC<ProfileStatsProps> = ({favoriteCount, registrationDate}) => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  const t = useTranslations('ProfilePage')
  return (
    <div className={styles.profile__data__mini}>
      <Link href={'/favorites'} className={styles.profile__data__box_item__span}>
        <span className={styles.profile__data__favourite}>
          <span className={styles.profile__data__favourite__span}>
            <h3 className={styles.mini__link__info__title}>{t('favorites')}</h3>
            <Image width={25} height={23} src={ASSETS_COUNTRIES.redStar} alt='go to favorite' />
          </span>
          <p className={styles.profile__data__favourite__subtitle}>
            {isClient ? favoriteCount : 0} {t('products')}
          </p>
        </span>
      </Link>
      <Link href={'#'} className={styles.profile__data__box_item__span}>
        <span className={styles.profile__data__basket}>
          <span className={styles.profile__data__favourite__span}>
            <h3 className={styles.mini__link__info__title}>
              {registrationDate.length > 0 ? t('shopping', {memberSince: new Date(registrationDate)}) : ''}
            </h3>
            <Image width={25} height={23} src={ASSETS_COUNTRIES.basket} alt='go to basket' />
          </span>
          <p className={styles.profile__data__favourite__subtitle}>{t('saw')} </p>
        </span>
      </Link>
    </div>
  )
}

// Компонент недавно просмотренных товаров
const RecentlyViewed: FC<RecentlyViewedProps> = ({latestViews, isEmpty}) => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  const t = useTranslations('ProfilePage')
  return (
    <div className={styles.profile__data__latest}>
      <h3 className={styles.mini__link__info__title__latest}>{t('recentlyViewed')}</h3>
      <ul className={styles.latest__list}>
        {isClient &&
          latestViews.map((product) => (
            <Card
              key={product.id}
              isLoading={false}
              id={product.id}
              title={product.title}
              price={product.originalPrice}
              discount={product.discount}
              previewImageUrl={product.previewImageUrl}
              discountedPrice={product.discountedPrice}
              deliveryMethod={product.deliveryMethod}
              fullProduct={product}
            />
          ))}
        {isClient && isEmpty && <p className={styles.empty__message}>{t('notHaveRecentlyViewed')}</p>}
      </ul>
    </div>
  )
}

const ProfilePage: FC<{firstUserData?: User}> = ({firstUserData}) => {
  const {userData, loading, error} = useUserData()
  const {latestViews, isEmpty} = useTypedSelector((state) => state.latestViews)
  const [needToSave, setNeedToSave] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const {productInFavorites} = useTypedSelector((state) => state.favorites)
  const router = useRouter()
  const {mutate: logout, isPending: isLogoutPending} = useLogout()
  const handleLogout = () => {
    if (isLogoutPending) return // Предотвращаем повторные клики
    logout()
  }

  // User custom data
  const [userPhoneNumber, setUserPhoneNumber] = useState(firstUserData?.phoneNumber)
  const [userRegion, setUserRegion] = useState(firstUserData?.region)

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

  // Обработчики событий
  const handleDevicesClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // TODO: Implement devices logic
  }

  const handlePaymentClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // TODO: Implement payment logic
  }

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

  return (
    <div>
      <Header />
      <div className='container'>
        <div className={styles.profile__inner}>
          <div className={styles.profile__user__box}>
            <ProfileHeader userData={firstUserData || userData} />
            <QuickActions onDevicesClick={handleDevicesClick} onPaymentClick={handlePaymentClick} />
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
              isLoading={loading}
              needToSave={needToSave}
              onDeleteAccount={handleDeleteAccount}
              onLogout={handleLogout}
            />
          </div>

          <div className={styles.profile__shops__data}>
            <ProfileStats
              favoriteCount={productInFavorites.length}
              registrationDate={userData?.registrationDate || ''}
            />
            <RecentlyViewed latestViews={latestViews} isEmpty={isEmpty} />
          </div>

          <ProfilePageBottomHelp />

          <ProfilePageBottomDelivery />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ProfilePage

// Дополнительные стили для empty message (добавить в ProfilePage.module.scss)
// .empty__message {
//   font-size: 35px;
//   color: #818181;
//   text-align: center;
//   margin-top: 20px;
//   margin-bottom: 20px;
//   font-weight: 500;
//   max-width: 100%;
//   width: 100%;
//   min-width: 100%;
// }
