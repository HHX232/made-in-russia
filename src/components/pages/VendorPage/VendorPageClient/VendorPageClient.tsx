'use client'
import {useEffect, useMemo, useRef} from 'react'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useActions} from '@/hooks/useActions'
import VendorPageComponent from '@/components/pages/VendorPage/VendorPage'
import {User} from '@/store/User/user.slice'
import {useUserQuery} from '@/hooks/useUserApi'
import {useTranslations} from 'next-intl'
import Footer from '@/components/MainComponents/Footer/Footer'
import Catalog from '@/components/screens/Catalog/Catalog'
import styles from './VendorPageClient.module.scss'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {useQueryClient} from '@tanstack/react-query'

interface VendorPageClientProps {
  serverUser: User | null
  phoneNumberCode?: string
  serverError?: string
  cacheKey: string
  initialLang: string
}

export default function VendorPageClient({
  serverUser,
  phoneNumberCode,
  serverError,
  cacheKey,
  initialLang
}: VendorPageClientProps) {
  const {isAuthenticated, user} = useTypedSelector((state) => state.user)
  const {setUser, setPhoneNumberCode, clearUser} = useActions()
  const queryClient = useQueryClient()
  const currentLang = useCurrentLanguage()
  const t = useTranslations('vendorCatalog')
  const prevLangRef = useRef(currentLang)

  // Агрессивная инвалидация при смене языка
  useEffect(() => {
    if (prevLangRef.current !== currentLang) {
      console.log('Language changed from', prevLangRef.current, 'to', currentLang)

      // Очищаем Redux store
      clearUser()

      // Удаляем ВСЕ кэшированные данные пользователя
      queryClient.removeQueries({queryKey: ['user']})

      // Принудительно запрашиваем новые данные
      queryClient.invalidateQueries({
        queryKey: ['user', currentLang],
        refetchType: 'active'
      })

      prevLangRef.current = currentLang
    }
  }, [currentLang, queryClient, clearUser])

  // React Query hook с правильным ключом для текущего языка
  const {isLoading, error: queryError, data: queryUser, isFetching} = useUserQuery()

  // Синхронизируем серверные данные с Redux при первой загрузке
  useEffect(() => {
    // Только при первой загрузке и если нет данных из React Query
    if (serverUser && !isAuthenticated && !queryUser && currentLang === initialLang) {
      console.log('Setting server user data')
      setUser(serverUser)

      if (phoneNumberCode) {
        setPhoneNumberCode(phoneNumberCode)
      }
    }
  }, []) // Запускаем только один раз

  // Синхронизируем данные из React Query с Redux
  useEffect(() => {
    if (queryUser && !isFetching) {
      console.log('Updating Redux with fresh query data for lang:', currentLang)
      setUser(queryUser)
    }
  }, [queryUser, isFetching, currentLang, setUser])

  // Определяем источник данных
  const currentUser = useMemo(() => {
    // Если идёт загрузка новых данных и язык изменился, показываем загрузку
    if (isFetching && currentLang !== initialLang) {
      return null
    }

    // Приоритет: свежие данные из React Query > Redux > Server
    if (queryUser) {
      console.log('Using React Query data')
      return queryUser
    }

    if (user) {
      console.log('Using Redux data')
      return user
    }

    // Серверные данные используем только если язык не менялся
    if (serverUser && currentLang === initialLang) {
      console.log('Using server data')
      return serverUser
    }

    return null
  }, [queryUser, user, serverUser, currentLang, initialLang, isFetching])

  const currentError = queryError || serverError

  useEffect(() => {
    console.log('=== VendorPageClient Debug ===', {
      currentLang,
      initialLang,
      hasQueryUser: !!queryUser,
      hasReduxUser: !!user,
      hasServerUser: !!serverUser,
      hasCurrentUser: !!currentUser,
      isLoading,
      isFetching,
      userLogin: currentUser?.login
    })
  }, [currentLang, queryUser, user, serverUser, currentUser, isLoading, isFetching, initialLang])

  // Показываем скелетон если нет данных и идёт загрузка
  if ((isLoading || isFetching) && !currentUser) {
    return <VendorPageSkeleton />
  }

  if (currentError && !currentUser) {
    return <VendorPageError error={currentError as string} />
  }

  if (!currentUser) {
    return <VendorPageNotFound />
  }

  if (currentUser.role === 'user') {
    return <AccessDenied userRole={currentUser.role} />
  }

  return (
    <>
      <VendorPageComponent
        key={`vendor-${currentLang}-${currentUser.id}-${cacheKey}`}
        isPageForVendor={true}
        vendorData={currentUser}
        numberCode={phoneNumberCode}
      />
      <div className='container'>
        <h2 className={styles.title}>{t('vendorProducts')}</h2>
      </div>
      <Catalog
        isShowFilters
        isPageForVendor={true}
        initialHasMore
        usePagesCatalog
        mathMinHeight
        showTableFilters={false}
        showSpecialSearchFilters={false}
        showSearchFilters={false}
        initialProducts={[]}
        specialRoute={'/me/products-summary'}
      />
      <Footer />
    </>
  )
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
