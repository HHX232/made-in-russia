'use client'
import {FC, useCallback, useEffect, useState} from 'react'
import styles from './ProfilePage.module.scss'
import Header from '@/components/MainComponents/Header/Header'
import instance from '@/api/api.interceptor'
import {getAccessToken, removeFromStorage} from '@/services/auth/auth.helper'
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

// Константы
const ASSETS = {
  avatar1: '/avatars/avatar-v-2.svg',
  belarusSvg: '/belarus.svg',
  redStar: '/profile/red_star.svg',
  basket: '/profile/red_basket.svg',
  paymentsList: [
    {title: 'Банковская карта – Альфа банк', value: '1234 1234 1234 1234'},
    {title: 'Банковская карта – Сбербанк', value: '4132 1234 4123 1234'},
    {title: 'ERIP', value: '1234567ER0000001231PB'}
  ]
}

// TODO: добавить поддержку языков
function formatDateToRussian(dateString: string): string {
  const date = new Date(dateString)

  // Проверка на валидность даты
  if (isNaN(date.getTime())) {
    return 'Некорректная дата'
  }

  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  // Массив с названиями месяцев в родительном падеже
  const months = [
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
  ]

  return `${day} ${months[month]} ${year}`
}

export const REGIONS: RegionType[] = [
  {imageSrc: ASSETS.belarusSvg, title: 'Беларусь', altName: 'Belarus'},
  {imageSrc: ASSETS.belarusSvg, title: 'Казахстан', altName: 'Kazakhstan'},
  {imageSrc: ASSETS.belarusSvg, title: 'Китай', altName: 'China'},
  {imageSrc: ASSETS.belarusSvg, title: 'Россия', altName: 'Russia'}
]

// Типы
interface RegionType {
  imageSrc: string
  title: string
  altName: string
}

interface ProfileHeaderProps {
  userData?: User
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
}

interface ProfileStatsProps {
  favoriteCount: number
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await instance.get<User>('/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'X-Internal-Request': process.env.INTERNAL_REQUEST_SECRET!
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
export const ProfileHeader: FC<ProfileHeaderProps> = ({userData}) => {
  return (
    <div className={styles.profile__user__box__inner}>
      <div className={styles.profile__user__box__inner__avatar}>
        <Image
          width={100}
          height={100}
          style={{width: '100%', height: '100%', borderRadius: '50%'}}
          src={userData?.avatar || ASSETS.avatar1}
          alt='avatar'
        />
      </div>
      <div className={styles.user__names__box}>
        <p className={styles.user__name}>{userData?.login}</p>
        <p className={styles.user__email}>{userData?.email}</p>
      </div>
    </div>
  )
}

// Компонент быстрых действий
export const QuickActions: FC<QuickActionsProps> = ({onDevicesClick, onPaymentClick, isForVendor = true}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
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
      >('/me/sessions')
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
          <p className={styles.modal__sessions__title}>Мои сессии</p>
          <ul className={styles.modal__sessions__list}>
            {sessions.map((el, i) => {
              return (
                <li key={i} className={styles.modal__sessions__list__item}>
                  <p className={`${styles.device__type}`}>
                    <span className={`${styles.sessions__item__title}`}> Тип устройства:</span>{' '}
                    <span className={`${styles.sessions__item__value}`}>{el.deviceType}</span>
                  </p>
                  <p className={`${styles.browser}`}>
                    <span className={`${styles.sessions__item__title}`}> Браузер:</span>{' '}
                    <span className={`${styles.sessions__item__value}}`}>{el.browser}</span>
                  </p>
                  <p className={`${styles.os}`}>
                    <span className={`${styles.sessions__item__title}`}> Операционная система:</span>{' '}
                    <span className={`${styles.sessions__item__value}}`}>{el.os}</span>
                  </p>
                  <p className={`${styles.last__login__date}`}>
                    <span className={`${styles.sessions__item__title}`}> Последний вход:</span>{' '}
                    <span className={`${styles.sessions__item__value}`}>
                      {typeof el.lastLoginDate === 'string'
                        ? formatDateToRussian(el.lastLoginDate)
                        : formatDateToRussian(el.lastLoginDate.toISOString())}
                    </span>
                  </p>
                </li>
              )
            })}
          </ul>
        </ModalWindowDefault>
      )}
      {isForVendor && (
        <li className={styles.fast__buttons__box__item}>
          <button className={styles.fast__buttons__box__item__button} onClick={onNewDeviceClick}>
            Мои сессии
          </button>
        </li>
      )}
      <li className={styles.fast__buttons__box__item}>
        <button
          className={styles.fast__buttons__box__item__button}
          onClick={(e) => {
            e.preventDefault()
            setIsPaymentModalOpen(true)
            onPaymentClick(e)
          }}
        >
          Способы оплаты
        </button>
      </li>

      <ModalWindowDefault isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
        <h3 className={styles.payments__methods__title}>Способы оплаты</h3>

        <ul className={styles.payments__methods__list}>
          {ASSETS.paymentsList.map((el, i) => {
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ProfileActions: FC<ProfileActionsProps> = ({needToSave, onDeleteAccount, onLogout, isLoading}) => {
  const onSave = () => {
    console.log('SAVE')
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
          Вы уверены что хотите выйти?
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
            Отменить
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
            Выйти
          </button>
        </div>
      </ModalWindowDefault>
      <ul className={styles.buttons__logouts__box}>
        <li className={styles.buttons__logouts__box__item}>
          <button className={styles.buttons__logouts__box__button} onClick={onDeleteAccount}>
            Удалить аккаунт
          </button>
        </li>
      </ul>
      <div className={styles.buttons__box__save__logout}>
        <button onClick={() => setWantQuite(true)} className={styles.logout__button}>
          Выйти
        </button>
        {needToSave && !isLoading && (
          <button className={styles.save__button} onClick={onSave}>
            Сохранить
          </button>
        )}
      </div>
    </>
  )
}

// Компонент статистики профиля
const ProfileStats: FC<ProfileStatsProps> = ({favoriteCount}) => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  return (
    <div className={styles.profile__data__mini}>
      <Link href={'#'} className={styles.profile__data__box_item__span}>
        <span className={styles.profile__data__favourite}>
          <span className={styles.profile__data__favourite__span}>
            <h3 className={styles.mini__link__info__title}>Избранное</h3>
            <Image width={25} height={23} src={ASSETS.redStar} alt='go to favorite' />
          </span>
          <p className={styles.profile__data__favourite__subtitle}>{isClient ? favoriteCount : 0} товар</p>
        </span>
      </Link>
      <Link href={'#'} className={styles.profile__data__box_item__span}>
        <span className={styles.profile__data__basket}>
          <span className={styles.profile__data__favourite__span}>
            <h3 className={styles.mini__link__info__title}>Покупки</h3>
            <Image width={25} height={23} src={ASSETS.basket} alt='go to basket' />
          </span>
          <p className={styles.profile__data__favourite__subtitle}>Смотреть</p>
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
  return (
    <div className={styles.profile__data__latest}>
      <h3 className={styles.mini__link__info__title__latest}>Недавно просмотренные</h3>
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
        {isClient && isEmpty && <p className={styles.empty__message}>Нет просмотренных товаров</p>}
      </ul>
    </div>
  )
}

const ProfilePage: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {userData, loading, error} = useUserData()
  const {latestViews, isEmpty} = useTypedSelector((state) => state.latestViews)
  const [needToSave, setNeedToSave] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const {productInFavorites} = useTypedSelector((state) => state.favorites)
  const router = useRouter()

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

  const handleLogout = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = instance.post('/auth/logout')
      // console.log(response)
      removeFromStorage()
      router.push('/')
    } catch (e) {
      console.log(e)
    }
  }

  // if (loading) {
  //   return <div>Loading...</div> // TODO: Добавить компонент загрузки
  // }

  if (error) {
    return <div>Error loading profile</div> // TODO: Добавить компонент ошибки
  }

  return (
    <div>
      <Header />
      <div className='container'>
        <div className={styles.profile__inner}>
          <div className={styles.profile__user__box}>
            <ProfileHeader userData={userData} />
            <QuickActions onDevicesClick={handleDevicesClick} onPaymentClick={handlePaymentClick} />
            <ProfileForm setNeedToSave={safeSetNeedToSave} isLoading={loading} userData={userData} regions={REGIONS} />

            <ProfileActions
              isLoading={loading}
              needToSave={needToSave}
              onDeleteAccount={handleDeleteAccount}
              onLogout={handleLogout}
            />
          </div>

          <div className={styles.profile__shops__data}>
            <ProfileStats favoriteCount={productInFavorites.length} />
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
