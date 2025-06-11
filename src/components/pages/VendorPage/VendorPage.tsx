/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import Header from '@/components/MainComponents/Header/Header'
import {FC, useCallback, useEffect, useState, useRef} from 'react'
import ProfileForm from '../ProfilePage/ProfileForm/ProfileForm'
import {ProfileHeader, QuickActions, ProfileActions, useUserData, REGIONS} from '../ProfilePage/ProfilePage'
import styles from './VendorPage.module.scss'
import instance from '@/api/api.interceptor'
import Image from 'next/image'
import {HelpListButton} from '../ProfilePage/ProfilePageBottom/ProfilePageBottomHelp'
import {useAnimatedCounter} from '@/hooks/useAnimatedCounter'
import Comment from '@/components/UI-kit/elements/Comment/Comment'
import {Review} from '@/services/card/card.types'
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

const helpListButtonData = [
  {
    linkTo: '#',
    iconSrc: '/profile/help_chat_svg.svg',
    text: 'Написать в поддержку'
  },
  {
    linkTo: '#',
    iconSrc: '/profile/quest.svg',
    text: 'Частые вопросы'
  }
]

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

const VendorPageComponent: FC = () => {
  const [needToSave, setNeedToSave] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [startAnimation, setStartAnimation] = useState(false)
  const {userData, loading, error} = useUserData()
  const router = useRouter()
  const [isCommentsOpen, setIsCommentsOpen] = useState(true)
  const windowWidth = useWindowWidth()
  const [isQuestOpen, setIsQuestOpen] = useState(false)

  useEffect(() => {
    if (windowWidth && windowWidth < 700) {
      setIsCommentsOpen(false)
    }
  }, [windowWidth])

  // Используем хук для получения отзывов
  const {
    reviews,
    isLoading: reviewsLoading,
    hasMore,
    loadMoreReviews,
    totalElements
  } = useProductReviews({
    size: 10 // Количество отзывов на страницу
    // minRating: 3, // Опционально: фильтр по минимальному рейтингу
  })

  const observerRef = useRef<IntersectionObserver | null>(null)
  const scrollContainerRef = useRef<HTMLUListElement | null>(null)
  const observerTargetRef = useRef<HTMLDivElement | null>(null)

  // Анимированные счетчики
  const animatedViews = useAnimatedCounter({
    targetValue: 7875,
    duration: 300,
    startAnimation
  })

  const animatedComments = useAnimatedCounter({
    targetValue: totalElements,
    duration: 300,
    startAnimation
  })

  // Вычисляем средний рейтинг
  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '4.5'

  // useEffect(() => {
  //   console.log('userData', userData)
  // }, [userData])

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
          // console.log('Loading more reviews via IntersectionObserver')
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
  }, [hasMore, reviewsLoading, loadMoreReviews, isCommentsOpen]) // Добавили isCommentsOpen в зависимости

  // Отладка: проверяем высоту контейнера и позицию скролла
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100

      // Если близко к концу и можно загрузить еще - загружаем
      if (isNearBottom && hasMore && !reviewsLoading) {
        // console.log('Near bottom, loading more via scroll event')
        loadMoreReviews()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMore, reviewsLoading, loadMoreReviews])

  const handleDevicesClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // TODO: Implement devices logic
  }

  const handlePaymentClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // TODO: Implement payment logic
  }

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

  const handleLogout = () => {
    try {
      const response = instance.post('/auth/logout')
      // console.log(response)
      removeFromStorage()
      router.push('/')
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <Header />
      <div className='container'>
        <div className={`${styles.vendor__inner} ${styles.profile__inner}`}>
          <div className={styles.profile__user__box}>
            <ProfileHeader userData={userData} />
            <QuickActions onDevicesClick={handleDevicesClick} onPaymentClick={handlePaymentClick} />
            <ProfileForm
              isVendor={true}
              setNeedToSave={safeSetNeedToSave}
              isLoading={loading}
              userData={userData}
              regions={REGIONS}
            />
            <ProfileActions
              isLoading={loading}
              needToSave={needToSave}
              onDeleteAccount={handleDeleteAccount}
              onLogout={handleLogout}
            />
          </div>
          <div className={styles.vendor__info__second}>
            <div className={styles.vendor__stats}>
              <div className={styles.vendor__stat}>
                <h3 className={styles.vendor__stat__title}>Просмотры аккаунта за месяц</h3>
                <div className={styles.vendor__stat__value}>{animatedViews.toLocaleString()}</div>
              </div>
              <div className={styles.vendor__stat}>
                <h3 className={styles.vendor__stat__title}>Комментарии и рейтинг за месяц</h3>
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
                  extraClass={`${styles.vendor__second__help__item}`}
                  key={index}
                  {...item}
                  onClick={() => {
                    if (index === 1) {
                      setIsQuestOpen(true)
                    }
                  }}
                />
              ))}
            </div>

            <div className={`${styles.vendor__mini__blocks__box}`}>
              <div className={styles.vendor__stats}>
                <div className={styles.vendor__stat}>
                  <h3 className={styles.vendor__stat__title}>Просмотры аккаунта за месяц</h3>
                  <div className={styles.vendor__stat__value}>{animatedViews.toLocaleString()}</div>
                </div>
                <div className={styles.vendor__stat}>
                  <h3 className={styles.vendor__stat__title}>Комментарии и рейтинг за месяц</h3>
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
                  <HelpListButton extraClass={`${styles.vendor__second__help__item}`} key={index} {...item} />
                ))}
              </div>
            </div>

            {/* Секция комментариев с бесконечным скроллом */}
            <div
              style={{
                height: !isCommentsOpen ? 'fit-content' : '100%',
                maxHeight: reviews.length === 0 ? 'none' : '590px'
              }}
              className={`${styles.list__box}`}
            >
              <div
                style={{cursor: windowWidth && windowWidth <= 700 ? 'pointer' : 'default'}}
                onClick={() => {
                  if (windowWidth && windowWidth <= 700) {
                    setIsCommentsOpen(!isCommentsOpen)
                  }
                }}
                className={`${styles.titles__some__box}`}
              >
                <h3 className={`${styles.comments__title}`}>Комментарии</h3>
                <Arrow extraClass={`${styles.comments__arrow}`} isActive={isCommentsOpen} onClick={() => {}} />
              </div>
              <ul
                style={{display: isCommentsOpen ? 'flex' : 'none', height: isCommentsOpen ? 'auto' : '0'}}
                className={styles.vendor__comments__list}
                ref={scrollContainerRef}
              >
                {reviewsLoading && reviews.length === 0 ? (
                  <li className={styles.vendor__comments__loading}>Загрузка комментариев...</li>
                ) : reviews.length === 0 && !reviewsLoading ? (
                  <li className={styles.vendor__comments__empty}>Пока нет отзывов о ваших товарах</li>
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
                      <li className={styles.vendor__comments__loading__more}>Загружаем ещё отзывы...</li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className={styles.vendor__products__box}>
            <div className={styles.products__titles__box}>
              <h3 className={styles.vendor__products__title}>Мои товары</h3>
              <SearchInputUI />
            </div>
            <div className={styles.products__list}>
              <Filters />
              <CardsCatalog specialRoute={'/me/products-summary'} />
            </div>
          </div>
        </div>
      </div>
      <ModalWindowDefault isOpen={isQuestOpen} onClose={() => setIsQuestOpen(false)}>
        <h3 style={{fontSize: '30px', fontWeight: '500', textAlign: 'center', margin: '10px 60px 40px 60px'}}>
          Частые вопросы
        </h3>
        <Accordion
          items={[
            {
              title: 'Как зарегистрировать аккаунт?',
              value:
                'Нажмите "Регистрация" в правом верхнем углу сайта, заполните форму (имя, email, телефон, пароль) и подтвердите email. После этого аккаунт будет создан.'
            },
            {
              title: 'Как восстановить пароль?',
              value:
                'На странице входа нажмите "Забыли пароль?", введите email, указанный при регистрации. Вам придет ссылка для сброса пароля. Следуйте инструкциям в письме.'
            },
            {
              title: 'Как изменить личные данные в профиле?',
              value:
                'Зайдите в "Личный кабинет" → "Мои данные". Здесь можно изменить ФИО, контакты и другие данные. Не забудьте сохранить изменения.'
            },
            {
              title: 'Где посмотреть историю заказов?',
              value:
                'В личном кабинете в разделе "Мои заказы" хранится полная история с датами, статусами и составом заказов.'
            },
            {
              title: 'Как добавить или удалить адрес доставки?',
              value:
                'В личном кабинете откройте "Адреса доставки". Для добавления нажмите "+ Новый адрес", для удаления — значок корзины рядом с адресом.'
            },
            {
              title: 'Почему я не могу войти в аккаунт?',
              value:
                'Проверьте правильность email и пароля. Если проблема сохраняется, воспользуйтесь восстановлением пароля или обратитесь в поддержку.'
            },
            {
              title: 'Как подписаться на рассылку акций?',
              value:
                'В личном кабинете в "Настройках уведомлений" активируйте опцию "Email-рассылка". Также можно подписаться при оформлении заказа.'
            },
            {
              title: 'Как отменить или изменить заказ?',
              value:
                'Если заказ еще не собран, откройте его в "Моих заказах" и нажмите "Отменить". Для изменений свяжитесь с поддержкой по телефону или через чат.'
            },
            {
              title: 'Где ввести промокод или скидочный купон?',
              value:
                'В корзине перед оформлением заказа есть поле "Промокод". Введите код и нажмите "Применить". Скидка отразится в итоговой сумме.'
            },
            {
              title: 'Как связать аккаунт с соцсетями?',
              value:
                'В "Настройках профиля" выберите "Привязать соцсети" и авторизуйтесь через Facebook, Google или другой доступный сервис.'
            },
            {
              title: 'Как проверить статус заказа?',
              value:
                'В личном кабинете в разделе "Мои заказы" найдите нужный заказ. Его текущий статус (например, "В обработке", "Отправлен") будет указан рядом.'
            },
            {
              title: 'Как удалить аккаунт?',
              value:
                'Напишите в поддержку с запросом на удаление. Учтите: это приведет к потере истории заказов и бонусных баллов.'
            },
            {
              title: 'Почему не приходит письмо с подтверждением?',
              value:
                'Проверьте папку "Спам". Если письма нет, запросите повторную отправку на странице регистрации или входа. Также убедитесь, что email введен верно.'
            },
            {
              title: 'Как изменить email или телефон в профиле?',
              value:
                'В "Личном кабинете" → "Мои данные" нажмите "Изменить" рядом с email/телефоном. Для email потребуется подтверждение через новую почту.'
            },
            {
              title: 'Как оформить заказ без регистрации?',
              value:
                'При оформлении выберите "Продолжить без регистрации". Однако для отслеживания заказа и скидок рекомендуем создать аккаунт.'
            }
          ]}
        />
      </ModalWindowDefault>
    </>
  )
}

export default VendorPageComponent
