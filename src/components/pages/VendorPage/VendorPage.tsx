/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import Header from '@/components/MainComponents/Header/Header'
import {FC, useCallback, useEffect, useState, useRef, useMemo} from 'react'
import ProfileForm from '../ProfilePage/ProfileForm/ProfileForm'
import {ProfileHeader, QuickActions, ProfileActions, useUserData, ASSETS_COUNTRIES} from '../ProfilePage/ProfilePage'
import styles from './VendorPage.module.scss'
import instance from '@/api/api.interceptor'
import Image from 'next/image'
import {HelpListButton} from '../ProfilePage/ProfilePageBottom/ProfilePageBottomHelp'
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

const Arrow = ({isActive, onClick, extraClass}: {isActive: boolean; onClick: () => void; extraClass?: string}) => {
  return (
    <svg
      onClick={onClick}
      style={{transition: 'all .3s', transform: `${isActive ? 'rotate(180deg)' : ''}`}}
      width='27'
      height='14'
      viewBox='0 0 27 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={extraClass}
    >
      <g clipPath='url(#clip0_2136_26)'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M12.7002 11.4267L6.33603 5.06255L7.92678 3.4718L13.4955 9.04055L19.0643 3.4718L20.655 5.06255L14.2909 11.4267C14.0799 11.6376 13.7938 11.7561 13.4955 11.7561C13.1972 11.7561 12.9111 11.6376 12.7002 11.4267Z'
          fill='#2A2E46'
        />
      </g>
      <defs>
        <clipPath id='clip0_2136_26'>
          <rect x='27' width='13.5' height='27' rx='6.75' transform='rotate(90 27 0)' fill='white' />
        </clipPath>
      </defs>
    </svg>
  )
}

const yellowStars = '/comments/yellow__start.svg'

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
  vendorDetails?: {
    id: number
    inn: string
    paymentDetails: string
    countries: Country[]
    productCategories: Category[]
    creationDate: string
    lastModificationDate: string
    viewsCount?: number | string
    faq?: {question: string; answer: string; id: string}[]
  }
}
export interface IVendorPageProps {
  isPageForVendor?: boolean
  vendorData?: IVendorData
  numberCode?: string // Новый пропс для кода страны
  initialProductsForView?: Product[]
}

const VendorPageComponent: FC<IVendorPageProps> = ({
  isPageForVendor = true,
  vendorData,
  numberCode = '',
  initialProductsForView
}) => {
  const [needToSave, setNeedToSave] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [startAnimation, setStartAnimation] = useState(false)
  const {userData, loading, error} = useUserData()
  const router = useRouter()
  const [isCommentsOpen, setIsCommentsOpen] = useState(true)
  const windowWidth = useWindowWidth()
  const [isQuestOpen, setIsQuestOpen] = useState(false)

  const t = useTranslations('VendorPage')
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

  // Состояния для текущих значений
  const [userPhoneNumber, setUserPhoneNumber] = useState(vendorData?.phoneNumber)
  const [userCountries, setUserCountries] = useState(
    vendorData?.vendorDetails?.countries?.map((country) => country.name)
  )
  const [userCategories, setUserCategories] = useState(
    vendorData?.vendorDetails?.productCategories?.map((category) => category.name)
  )
  const [userInn, setUserInn] = useState(vendorData?.vendorDetails?.inn)
  const [activeFaq, setActiveFaq] = useState(vendorData?.vendorDetails?.faq)

  useEffect(() => {
    console.log('vendorData', vendorData)
  }, [vendorData])

  // Сохраняем начальные значения для сравнения
  const initialDataRef = useRef<{
    phoneNumber?: string
    countries?: string[]
    categories?: string[]
    inn?: string
  }>({})

  // Инициализация начальных данных
  useEffect(() => {
    if (!initialLoadComplete && (vendorData || userData)) {
      const currentData = vendorData || userData
      initialDataRef.current = {
        phoneNumber: currentData?.phoneNumber,
        countries: vendorData?.vendorDetails?.countries?.map((country) => country.name) || [],
        categories: vendorData?.vendorDetails?.productCategories?.map((category) => category.name) || [],
        inn: vendorData?.vendorDetails?.inn || ''
      }
      setInitialLoadComplete(true)
    }
  }, [vendorData, userData, initialLoadComplete])

  // Функция для сравнения массивов - мемоизируем
  const arraysEqual = useCallback((a?: string[], b?: string[]) => {
    if (!a && !b) return true
    if (!a || !b) return false
    if (a.length !== b.length) return false
    return a.every((val, index) => val === b[index])
  }, [])

  // Проверка изменений
  useEffect(() => {
    if (!initialLoadComplete) return

    const hasChanges =
      userPhoneNumber !== initialDataRef.current.phoneNumber ||
      userInn !== initialDataRef.current.inn ||
      !arraysEqual(userCountries, initialDataRef.current.countries) ||
      !arraysEqual(userCategories, initialDataRef.current.categories)

    setNeedToSave(hasChanges)
  }, [userPhoneNumber, userInn, userCountries, userCategories, initialLoadComplete, arraysEqual])

  useEffect(() => {
    if (windowWidth && windowWidth < 700) {
      setIsCommentsOpen(false)
    }
  }, [windowWidth])

  // Мемоизируем параметры для хука useProductReviews
  const reviewsParams = useMemo(
    () => ({
      size: 10,
      ...(!isPageForVendor && vendorData?.id ? {specialRoute: `vendor/${vendorData.id}`} : {})
    }),
    [isPageForVendor, vendorData?.id]
  )

  // Детальное логирование параметров
  useEffect(() => {
    console.log('=== VENDOR PAGE DEBUG ===')
    console.log('isPageForVendor:', isPageForVendor)
    console.log('vendorData:', vendorData)
    console.log('vendorData?.id:', vendorData?.id)
    console.log('reviewsParams:', reviewsParams)
    console.log('specialRoute condition:', !isPageForVendor && vendorData?.id)
    console.log('Calculated specialRoute:', !isPageForVendor && vendorData?.id ? `vendor/${vendorData.id}` : 'none')
    console.log('========================')
  }, [isPageForVendor, vendorData, reviewsParams])

  const {reviews, isLoading: reviewsLoading, hasMore, loadMoreReviews, totalElements} = useProductReviews(reviewsParams)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const scrollContainerRef = useRef<HTMLUListElement | null>(null)
  const observerTargetRef = useRef<HTMLDivElement | null>(null)
  const [newQuestionValue, setNewQuestionValue] = useState('')
  const [newAnswerValue, setNewAnswerValue] = useState('')

  // Анимированные счетчики - мемоизируем значения
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

  // Вычисляем средний рейтинг - мемоизируем
  const averageRating = useMemo(
    () =>
      reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0',
    [reviews]
  )

  // Запускаем анимацию после загрузки компонента
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Эффект для создания/обновления IntersectionObserver
  useEffect(() => {
    // Очищаем предыдущий observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Проверяем все необходимые условия
    if (!scrollContainerRef.current || !observerTargetRef.current || !hasMore || reviewsLoading) {
      return
    }

    // Создаем новый observer
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

    // Начинаем наблюдение
    observerRef.current.observe(observerTargetRef.current)

    // Cleanup функция
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, reviewsLoading, loadMoreReviews, isCommentsOpen])

  // Отладка: проверяем высоту контейнера и позицию скролла
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100

      // Если близко к концу и можно загрузить еще - загружаем
      if (isNearBottom && hasMore && !reviewsLoading) {
        loadMoreReviews()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMore, reviewsLoading, loadMoreReviews])

  // Мемоизируем обработчики событий
  const handleDevicesClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    // TODO: Implement devices logic
  }, [])

  const safeSetNeedToSave = useCallback(
    (value: boolean) => {
      if (initialLoadComplete) {
        setNeedToSave(value)
      }
    },
    [initialLoadComplete]
  )

  const handleDeleteAccount = useCallback(() => {
    // TODO: Implement delete account logic
  }, [])

  const currentLang = useCurrentLanguage()

  const handleCreateNewQuestion = useCallback(() => {
    try {
      const response = instance.post(
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
      console.log(response)
      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('success')}</strong>
          <span>{t('successPublishedNewQuest')}</span>
        </div>,
        {
          style: {
            background: '#2E7D32'
          }
        }
      )
      setNewQuestionValue('')
      setNewAnswerValue('')
    } catch (e) {
      console.log(e)
      toast.error('Ошибка при создании вопроса')
    }
  }, [newQuestionValue, newAnswerValue])

  const handleDeleteQuestion = useCallback((questionId: string) => {
    try {
      const response = instance.delete(`/vendor/faq/${questionId}`, {
        headers: {
          'Accept-Language': currentLang
        }
      })
      console.log(response)
      toast.success(t('sucessDeleatFaq'))
    } catch (e) {
      console.log(e)
      toast.error(t('errorDeleatFaq'))
    }
  }, [])

  const handleLogout = useCallback(() => {
    try {
      const response = instance.post(
        '/auth/logout',
        {},
        {
          headers: {
            'Accept-Language': currentLang
          }
        }
      )
      removeFromStorage()
      router.push('/')
    } catch (e) {
      console.log(e)
    }
  }, [router])

  // Функция для форматирования номера телефона с кодом страны - мемоизируем
  const formatPhoneNumberWithCode = useCallback(
    (phoneNumber?: string) => {
      if (!phoneNumber) return phoneNumber

      // Удаляем все нецифровые символы из номера
      const cleanNumber = phoneNumber.replace(/\D/g, '')

      // Если номер уже начинается с кода страны (без +), возвращаем как есть
      const codeWithoutPlus = numberCode.replace('+', '')
      if (cleanNumber.startsWith(codeWithoutPlus)) {
        return '+' + cleanNumber
      }

      // Добавляем код страны к номеру
      return numberCode + cleanNumber
    },
    [numberCode]
  )

  // Детальное логирование состояния комментариев
  // useEffect(() => {
  //   console.log('=== COMMENTS STATE DEBUG ===')
  //   console.log('reviews:', reviews)
  //   console.log('reviews.length:', reviews.length)
  //   console.log('totalElements:', totalElements)
  //   console.log('reviewsLoading:', reviewsLoading)
  //   console.log('hasMore:', hasMore)
  //   console.log('isCommentsOpen:', isCommentsOpen)
  //   console.log('===========================')
  // }, [reviews, totalElements, reviewsLoading, hasMore, isCommentsOpen])

  // Мемоизируем данные для кнопок помощи
  const helpListButtonData = useMemo(
    () => [
      {
        linkTo: '#',
        iconSrc: '/profile/help_chat_svg.svg',
        text: t('help')
      },
      {
        linkTo: '/favorites',
        iconSrc: '/profile/gray_star_for_profile.svg',
        text: t('favorites')
      },
      {
        linkTo: '#',
        iconSrc: '/profile/quest.svg',
        text: t('quest')
      }
    ],
    [t]
  )

  // Мемоизируем обработчики для кнопок помощи
  const handleHelpButtonClick = useCallback((index: number) => {
    if (index === 2) {
      setIsQuestOpen(true)
    }
  }, [])

  const handleCommentsToggle = useCallback(() => {
    if (windowWidth && windowWidth <= 700) {
      setIsCommentsOpen(!isCommentsOpen)
    }
  }, [windowWidth, isCommentsOpen])

  // Мемоизируем обработчик изменения данных вендора
  const handleVendorDataChange = useCallback((data: any) => {
    setUserPhoneNumber(data.phoneNumber)
    setUserCountries(data.countries.map((country: any) => country.label))
    setUserCategories(data.productCategories.map((category: any) => category.label))
    setUserInn(data.inn)
  }, [])

  // Мемоизируем обработчик удаления вопроса в FAQ
  const handleFaqDelete = useCallback(
    (item: any) => {
      handleDeleteQuestion(item.id)
      setActiveFaq(activeFaq?.filter((itemMap) => itemMap.id !== item.id))
    },
    [activeFaq, handleDeleteQuestion]
  )

  // Мемоизируем элементы FAQ
  const faqItems = useMemo(
    () =>
      activeFaq?.map((item) => ({
        title: item.question,
        value: item.answer,
        id: item.id
      })) || [],
    [activeFaq]
  )

  // Мемоизируем форматированный номер телефона
  const formattedPhoneNumber = useMemo(
    () => formatPhoneNumberWithCode(userPhoneNumber),
    [userPhoneNumber, formatPhoneNumberWithCode]
  )

  return (
    <>
      <Header />
      <div className='container'>
        <div className={`${styles.vendor__inner} ${styles.profile__inner}`}>
          <span style={{width: '100%', height: '100%', position: 'relative'}}>
            <div
              style={{
                position: !isPageForVendor ? 'sticky' : 'static',
                top: !isPageForVendor ? '10px' : '0',
                maxHeight: !isPageForVendor ? 'fit-content' : '100%'
              }}
              className={styles.profile__user__box}
            >
              <ProfileHeader userData={!!vendorData ? vendorData : userData} />
              <QuickActions
                isForVendor={isPageForVendor}
                onDevicesClick={handleDevicesClick}
                onPaymentClick={() => {}}
              />
              <ProfileForm
                isShowForOwner={isPageForVendor}
                isVendor={true}
                onVendorDataChange={handleVendorDataChange}
                setNeedToSave={safeSetNeedToSave}
                isLoading={loading}
                userData={!!vendorData ? vendorData : userData}
                regions={REGIONS}
              />
              {isPageForVendor && (
                <ProfileActions
                  categories={userCategories}
                  inn={userInn}
                  countries={userCountries}
                  phoneNumber={formattedPhoneNumber}
                  isForVendor={isPageForVendor}
                  isLoading={loading}
                  needToSave={needToSave}
                  onDeleteAccount={handleDeleteAccount}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </span>

          <div className={styles.vendor__info__second}>
            <div className={styles.vendor__stats}>
              <div className={styles.vendor__stat}>
                <h3 className={styles.vendor__stat__title}>{t('accountViews')}</h3>
                <div className={styles.vendor__stat__value}>{animatedViews.toLocaleString()}</div>
              </div>
              <div className={styles.vendor__stat}>
                <h3 className={styles.vendor__stat__title}>{t('accountComments')}</h3>
                <div className={`${styles.vendor__stat__value} ${styles.vendor__stat__value__second}`}>
                  <div className={styles.vendor__stat__value__text}>{animatedComments.toLocaleString()}</div>
                  <div className={styles.vendor__stat__value__text__second}>
                    <Image style={{marginBottom: '2px'}} src={yellowStars} width={27} height={27} alt='yellowStars' />
                    <p className={styles.vendor__stat__value__text__second__text}>{averageRating}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.vendor__second__help}>
              {helpListButtonData.map((item, index) =>
                index !== 1 ? (
                  <HelpListButton
                    extraClass={`${styles.vendor__second__help__item} ${!isPageForVendor ? styles.vendor__second__help__item__only__vendor : ''}`}
                    key={index}
                    {...item}
                    onClick={() => handleHelpButtonClick(index)}
                  />
                ) : isPageForVendor ? (
                  <Link key={index} href={'/favorites'}>
                    <HelpListButton
                      extraClass={`${styles.vendor__second__help__item} ${!isPageForVendor ? styles.vendor__second__help__item__only__vendor : ''}`}
                      key={index}
                      {...item}
                    />
                  </Link>
                ) : (
                  <p></p>
                )
              )}
            </div>

            <div className={`${styles.vendor__mini__blocks__box}`}>
              <div className={styles.vendor__stats}>
                <div className={styles.vendor__stat}>
                  <h3 className={styles.vendor__stat__title}>{t('accountViews')}</h3>
                  <div className={styles.vendor__stat__value}>{animatedViews.toLocaleString()}</div>
                </div>
                <div className={styles.vendor__stat}>
                  <h3 className={styles.vendor__stat__title}>{t('accountComments')}</h3>
                  <div className={`${styles.vendor__stat__value} ${styles.vendor__stat__value__second}`}>
                    <div className={styles.vendor__stat__value__text}>{animatedComments.toLocaleString()}</div>
                    <div className={styles.vendor__stat__value__text__second}>
                      <Image style={{marginBottom: '2px'}} src={yellowStars} width={27} height={27} alt='yellowStars' />
                      <p className={styles.vendor__stat__value__text__second__text}>{averageRating}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.vendor__second__help}>
                {helpListButtonData.map((item, index) => (
                  <HelpListButton
                    extraClass={`${styles.vendor__second__help__item} ${!isPageForVendor ? styles.vendor__second__help__item__only__vendor : ''}`}
                    key={index}
                    {...item}
                    onClick={() => handleHelpButtonClick(index)}
                  />
                ))}
              </div>
            </div>

            {/* Секция комментариев с бесконечным скроллом */}
            <div
              style={{
                height: !isCommentsOpen ? 'fit-content' : '100%',
                maxHeight: reviews.length === 0 ? 'none' : isPageForVendor ? '644px' : '590px'
              }}
              className={`${styles.list__box}`}
            >
              <div
                style={{cursor: windowWidth && windowWidth <= 700 ? 'pointer' : 'default'}}
                onClick={handleCommentsToggle}
                className={`${styles.titles__some__box}`}
              >
                <h3 className={`${styles.comments__title}`}>{t('comments')}</h3>
                <Arrow extraClass={`${styles.comments__arrow}`} isActive={isCommentsOpen} onClick={() => {}} />
              </div>
              <ul
                style={{display: isCommentsOpen ? 'flex' : 'none', height: isCommentsOpen ? 'auto' : '0'}}
                className={styles.vendor__comments__list}
                ref={scrollContainerRef}
              >
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

                    {/* Элемент для IntersectionObserver */}
                    {hasMore && !reviewsLoading && reviews.length > 0 && (
                      <li style={{listStyle: 'none'}}>
                        <IntersectionObserverElement
                          observerRef={(node) => {
                            observerTargetRef.current = node
                          }}
                        />
                      </li>
                    )}

                    {/* Индикатор загрузки дополнительных комментариев */}
                    {reviewsLoading && reviews.length > 0 && (
                      <li className={styles.vendor__comments__loading__more}>{t('loadMoreCommets')}</li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className={styles.vendor__products__box}>
            <div className={styles.products__titles__box}>
              {isPageForVendor ? (
                <h3 className={styles.vendor__products__title}>{t('myProducts')}</h3>
              ) : (
                <h3 className={styles.vendor__products__title}>{t('noMyProducts')}</h3>
              )}
              <SearchInputUI vendorId={vendorData?.id.toString()} />
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
      {/* CREATE */}
      <ModalWindowDefault
        extraClass={`${styles.modalExtra}`}
        isOpen={isQuestOpen}
        onClose={() => setIsQuestOpen(false)}
      >
        <h3 style={{fontSize: '30px', fontWeight: '500', textAlign: 'center', margin: '10px 60px 40px 60px'}}>
          {t('quest')}
        </h3>
        {isPageForVendor && (
          <div className=''>
            <p style={{fontSize: '20px', fontWeight: '500', textAlign: 'center', margin: '10px 0 20px 0'}}>
              {t('addQuest')}
            </p>
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
          </div>
        )}
        {isPageForVendor ? (
          <Accordion needDeleteButton={true} onDelete={handleFaqDelete} items={faqItems} />
        ) : (
          <Accordion items={faqItems} />
        )}
      </ModalWindowDefault>
      <Footer />
    </>
  )
}

export default VendorPageComponent
