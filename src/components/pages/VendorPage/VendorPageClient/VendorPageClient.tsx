'use client'
import {useEffect} from 'react'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useActions} from '@/hooks/useActions'
import VendorPageComponent from '@/components/pages/VendorPage/VendorPage'
import {User} from '@/store/User/user.slice'
import {useUserQuery} from '@/hooks/useUserApi'
import {useTranslations} from 'next-intl'

interface VendorPageClientProps {
  serverUser: User | null
  phoneNumberCode?: string
  serverError?: string
}

export default function VendorPageClient({serverUser, phoneNumberCode, serverError}: VendorPageClientProps) {
  // Получаем данные из Redux store
  const {isAuthenticated, user} = useTypedSelector((state) => state.user)
  const {setUser, setPhoneNumberCode} = useActions()

  // React Query hook - будет использовать закэшированные данные с сервера
  const {isLoading, error: queryError, data: queryUser} = useUserQuery()

  // Синхронизируем серверные данные с Redux store при монтировании
  useEffect(() => {
    if (serverUser && !isAuthenticated) {
      setUser(serverUser)

      if (phoneNumberCode) {
        setPhoneNumberCode(phoneNumberCode)
      }
    }
  }, [serverUser, phoneNumberCode, isAuthenticated, setUser, setPhoneNumberCode])

  // Определяем источник данных пользователя
  const currentUser = user || queryUser || serverUser
  const currentError = queryError || serverError

  // Обработка состояний загрузки и ошибок
  if (isLoading && !currentUser) {
    return <VendorPageSkeleton />
  }

  if (currentError && !currentUser) {
    return <VendorPageError error={currentError as string} />
  }

  if (!currentUser) {
    return <VendorPageNotFound />
  }

  // Проверяем, является ли пользователь vendor'ом
  if (currentUser.role == 'user') {
    return <AccessDenied userRole={currentUser.role} />
  }

  return <VendorPageComponent isPageForVendor={true} vendorData={currentUser} numberCode={phoneNumberCode} />
}

// Компоненты для различных состояний
const VendorPageSkeleton = () => (
  <div className='vendor-page-skeleton'>
    <div className='skeleton-header' />
    <div className='skeleton-content' />
    <div className='skeleton-sidebar' />
  </div>
)

const VendorPageError = ({error}: {error: string}) => {
  const t = useTranslations('VendorPageClient')
  return (
    <div className='vendor-page-error'>
      <h1>{t('errorLoadingData')}</h1>
      <p>
        {t('errorLoadingDataDescription')} {error}
      </p>
      <button onClick={() => window.location.reload()}>{t('tryAgain')}</button>
    </div>
  )
}

const VendorPageNotFound = () => {
  const t = useTranslations('VendorPageClient')
  return (
    <div className='vendor-page-not-found'>
      <h1>{t('userNotFound')}</h1>
      <p>{t('pleaseLogin')}</p>
    </div>
  )
}

const AccessDenied = ({userRole}: {userRole: string}) => {
  const t = useTranslations('VendorPageClient')
  return (
    <div className='access-denied'>
      <h1>{t('accessDenied')}</h1>
      <p>
        {t('accessDeniedDescription')} {userRole}
      </p>
    </div>
  )
}
