/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import CardSlider from '@/components/UI-kit/elements/CardSlider/CardSlider'
import StringDescriptionGroup from '@/components/UI-kit/Texts/StringDescriptionGroup/StringDescriptionGroup'
import Link from 'next/link'
import Head from 'next/head'
import styles from './CardPage.module.scss'
import Image from 'next/image'
import {ReactNode, useEffect, useMemo, useRef, useState} from 'react'
import useWindowWidth from '@/hooks/useWindoWidth'
import ICardFull from '@/services/card/card.types'
import {useLocale, useTranslations} from 'next-intl'
import PurchaseModal from './PurchaseModal/PurchaseModal'
import {axiosClassic} from '@/api/api.interceptor'
import {toast} from 'sonner'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useUserQuery} from '@/hooks/useUserApi'
import ServiceFavorites from '@/services/favorite/favorite.service'
import {chatService} from '@/services/chat/chat.service'
import {useRouter} from 'next/navigation'
import {Heart} from 'lucide-react'

interface IPriceItem {
  title: string | ReactNode
  currentPrice?: string | null
  originalPrice: string | null
  priceUnit: string
}

interface IPriceList {
  items: IPriceItem[]
  discountExpiration?: string | null
}

// Компонент микроразметки
const ProductSchema = ({
  cardData,
  priceList,
  shopName
}: {
  cardData: ICardFull | null
  priceList: IPriceList
  shopName: string
}) => {
  if (!cardData) return null

  // Получаем минимальную и максимальную цены
  const prices = priceList.items
    .map((item) => parseFloat(item.currentPrice || item.originalPrice || '0'))
    .filter((price) => price > 0)

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  console.log('priceList', priceList)
  // Формируем массив предложений для AggregateOffer
  const offers = priceList.items.map((item, index) => ({
    '@type': 'Offer',
    price: item.currentPrice || item.originalPrice,
    priceCurrency: item?.priceUnit,
    priceValidUntil: priceList.discountExpiration,
    availability: 'https://schema.org/InStock',
    eligibleQuantity: {
      '@type': 'Quantitative-Value',
      name: item.title,
      unitCode: item.priceUnit
    }
  }))

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: cardData.title,
    description: cardData.furtherDescription || cardData.title,
    sku: cardData.article,
    mpn: cardData.article,
    image: cardData.media?.map((media) => media.url) || [],
    brand: {
      '@type': 'Organization',
      name: shopName
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: cardData.rating,
      reviewCount: cardData.reviewsCount,
      bestRating: '5',
      worstRating: '1'
    },
    offers: {
      '@type': 'AggregateOffer',
      offerCount: priceList.items.length,
      lowPrice: minPrice,
      highPrice: maxPrice,
      priceCurrency: cardData.prices[0].currency,
      availability: 'https://schema.org/InStock',
      priceValidUntil: priceList.discountExpiration,
      offers: offers
    },
    additionalProperty:
      cardData.characteristics?.map((char) => ({
        '@type': 'PropertyValue',
        name: char.name,
        value: char.value
      })) || [],
    shippingDetails: [
      {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          currency: cardData.prices[0].currency
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue:
              Number(cardData?.deliveryMethodsDetails?.[0]?.value) - 2 <= 0
                ? 0
                : Number(cardData?.deliveryMethodsDetails?.[0]?.value) - 2 || 5,
            maxValue: Number(cardData?.deliveryMethodsDetails?.[0]?.value) + 1 || 10,
            unitCode: 'DAY'
          }
        }
      },
      {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          currency: cardData.prices[0].currency
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue:
              Number(cardData?.deliveryMethodsDetails?.[0]?.value) - 2 <= 0
                ? 0
                : Number(cardData?.deliveryMethodsDetails?.[0]?.value) - 2 || 5,
            maxValue: Number(cardData?.deliveryMethodsDetails?.[0]?.value) + 1 || 10,
            unitCode: 'DAY'
          }
        }
      }
    ]
  }

  return (
    <Head>
      <script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData)}} />
    </Head>
  )
}

export const CardTopPage = ({isLoading, cardData}: {isLoading: boolean; cardData: ICardFull | null}) => {
  const t = useTranslations('CardPage.CardTopPage')
  const [cardMiniData, setCardMiniData] = useState<ICardFull | null>(cardData)
  const [isMounted, setIsMounted] = useState(false)

  const locale = useLocale()

  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const router = useRouter()
  const tChat = useTranslations('chat')

  const {toggleToFavorites} = useActions()
  const {productInFavorites} = useTypedSelector((state) => state.favorites)
  const {user} = useTypedSelector((state) => state.user)
  const {isPending: isUserLoading} = useUserQuery()

  const isOwner = user?.id !== undefined && cardData?.user?.id !== undefined && user.id === cardData.user.id
  const showContactButton = !isUserLoading && !isOwner

  const handleContactSeller = async () => {
    if (isCreatingChat || !cardData) return

    if (!user) {
      toast.error('Необходимо авторизоваться')
      router.push(`/${locale}/login`)
      return
    }

    if (user.id === cardData.user.id) {
      toast.error('Вы не можете написать самому себе')
      return
    }

    setIsCreatingChat(true)
    try {
      const chat = await chatService.createChat(cardData.id)
      router.push(`/chats?chatId=${chat.id}`)
    } catch (error) {
      console.error('Error creating chat:', error)
      toast.error(tChat('sendError'))
    } finally {
      setIsCreatingChat(false)
    }
  }

  useEffect(() => {
    console.log('productInFavorites', productInFavorites)
  }, [productInFavorites])

  const handleToggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()

    if (isTogglingFavorite || !cardData) return

    setIsTogglingFavorite(true)

    try {
      // Сначала обновляем UI оптимистично
      toggleToFavorites(cardData as any)

      // Затем отправляем на сервер
      await ServiceFavorites.toggleFavorite(cardData.id, locale)
    } catch (error) {
      console.error('Failed to toggle favorite:', error)

      // Откатываем изменения при ошибке
      toggleToFavorites(cardData as any)

      toast.error(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('error')}</strong>
          <span>{t('errorUpdatingFavorites')}</span>
        </div>,
        {
          style: {
            background: '#AC2525'
          }
        }
      )
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const handlePurchaseSubmit = async (data: {
    name: string
    email: string
    phone: string
    quantity: number
    selectedPrice: any
    totalPrice: number
  }) => {
    console.log('Данные заказа:', data)
    try {
      const {data: orderData} = await axiosClassic.post(`/products/${cardData?.id}/create-order`, {
        email: data?.email,
        firstName: data?.name,
        phoneNumber: data?.phone || '',
        quantity: data?.quantity || 1
      })
      toast.success(
        <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
          <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('successCreateOrder')}</strong>
          <span>{t('successCreateBody')}</span>
        </div>,
        {
          style: {background: '#2E7D32'}
        }
      )
    } catch {
      toast.error(
        <div style={{lineHeight: 1.5}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('errorCreateOrder')}</strong>
        </div>,
        {
          style: {background: '#AC2525'}
        }
      )
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    console.log('cardData', cardData)
    if (cardData) {
      setCardMiniData(cardData)
    }
  }, [cardData])

  const isReallyLoading = isLoading || !cardMiniData

  // Проверяем, находится ли товар в избранном
  const isInFavorite = productInFavorites.some((product) => product.id?.toString() === cardData?.id?.toString())

  const NewFullTopInfo = () => {
    const t = useTranslations('CardTopPage')
    const t2 = useTranslations('ReviewsToNumber')

    const getMinimalValueText = () => {
      const quantity = cardData?.minimumOrderQuantity || 1
      const unitSlug = cardData?.prices[0]?.unitSlug

      if (!unitSlug || quantity === 0) {
        return quantity.toString()
      }

      try {
        return t2(unitSlug, {count: quantity})
      } catch (error) {
        return `${quantity} ${unitSlug}`
      }
    }

    return (
      <div className={styles.full__info__box}>
        <h1 className={styles.productTitle}>{cardData?.title}</h1>
        <div className={styles.reviews}>
          <p className={styles.ratingNumber}>{cardData?.rating}</p>
          <svg width='16' height='16' viewBox='0 0 24 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M12 0L15.1811 7.6216L23.4127 8.2918L17.1471 13.6724L19.0534 21.7082L12 17.412L4.94658 21.7082L6.85288 13.6724L0.587322 8.2918L8.81891 7.6216L12 0Z'
              fill='#EEB611'
            />
          </svg>
          <div className={styles.gray__dot}></div>
          <a href='#reviews-title' className={styles.reviews__count}>
            {/* {cardData?.reviewsCount} {t('revues')} */}
            {t2('count', {count: cardData?.reviewsCount ?? 0})}
          </a>
        </div>
        <div className={styles.prices__box__new}>
          <p className={styles.main__price}>
            {t('from')} {cardData?.prices[0].discountedPrice} {cardData?.prices[0].currency}/{cardData?.prices[0].unit}
          </p>
          {cardData?.prices[0].originalPrice !== cardData?.prices[0].discountedPrice && (
            <p className={styles.original__price}>
              {cardData?.prices[0].originalPrice} {cardData?.prices[0].currency}/{cardData?.prices[0].unit}
            </p>
          )}
          {cardData?.prices[0].originalPrice !== cardData?.prices[0].discountedPrice && (
            <p className={styles.disc__days}>
              {cardData?.daysBeforeDiscountExpires} {t('daysBeforeDiscountExpires')}
            </p>
          )}
        </div>
        <div className={styles.buttons__box__new}>
          <button className={styles.byNow} onClick={() => setPurchaseModalOpen(true)}>
            {t('byNow')}
          </button>
          {/* Кнопка "Написать продавцу" - только если это не свой товар и пользователь загружен */}
          {showContactButton && (
            <button className={styles.contactSeller} onClick={handleContactSeller} disabled={isCreatingChat}>
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H16C20 2 22 4 22 8V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19Z'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeMiterlimit='10'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M7 8H17'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M7 13H13'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              {isCreatingChat ? '...' : tChat('writeToSeller')}
            </button>
          )}
          <button
            onClick={handleToggleFavorite}
            className={styles.fav__button}
            disabled={isTogglingFavorite}
            aria-label={isInFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            {/* <svg
              className={!isInFavorite ? styles.active__star : ''}
              width='28'
              height='28'
              viewBox='0 0 28 28'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M16.0187 4.09499L18.072 8.20165C18.352 8.77332 19.0987 9.32165 19.7287 9.42665L23.4504 10.045C25.8304 10.4417 26.3904 12.1683 24.6754 13.8717L21.782 16.765C21.292 17.255 21.0237 18.2 21.1754 18.8767L22.0037 22.4583C22.657 25.2933 21.152 26.39 18.6437 24.9083L15.1554 22.8433C14.5254 22.47 13.487 22.47 12.8454 22.8433L9.35705 24.9083C6.86038 26.39 5.34372 25.2817 5.99705 22.4583L6.82538 18.8767C6.97705 18.2 6.70872 17.255 6.21872 16.765L3.32538 13.8717C1.62205 12.1683 2.17038 10.4417 4.55038 10.045L8.27205 9.42665C8.89038 9.32165 9.63705 8.77332 9.91705 8.20165L11.9704 4.09499C13.0904 1.86665 14.9104 1.86665 16.0187 4.09499Z'
                stroke={!isInFavorite ? '#FFFFFF' : 'transparent'}
                fill={isInFavorite ? '#FF0000' : 'none'}
                strokeWidth={!isInFavorite ? '1.5' : '0'}
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg> */}
            <Heart className={isInFavorite ? styles.activeHeart : styles.inactiveHeart} />
          </button>
        </div>

        <div className={styles.characteristics__list}>
          <StringDescriptionGroup
            extraBoxClass={`${styles.extra__group__class}`}
            titleFontSize='16'
            listGap='10'
            items={[
              {
                title: t('minimalValue'),
                value: getMinimalValueText()
              },
              {title: t('articul'), value: cardData?.article || ''},
              ...(cardData?.characteristics?.map((el) => ({
                title: el.name,
                value: el.value
              })) || [])
            ]}
            titleMain={t('technicalCharacteristics')}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Микроразметка Schema.org */}
      <ProductSchema
        cardData={cardMiniData}
        priceList={{
          items:
            cardData?.prices.map((el) => {
              return {
                title: el.from + '-' + el.to + ' ' + el.unit,
                currentPrice: el.discountedPrice.toString(),
                originalPrice: el.originalPrice.toString(),
                priceUnit: el.currency + '/' + el.unit
              }
            }) || []
        }}
        shopName={cardMiniData?.user.login || ''}
      />

      <div className={`${styles.card__slider__box}`}>
        <CardSlider
          imagesCustom={cardMiniData?.media?.map((el) => {
            return el.url
          })}
          isLoading={isReallyLoading}
          extraClass={styles.card__slider__box__extra}
        />
      </div>

      {/* Первая секция */}
      <span className={`${styles.card__row__info} ${styles.card__col__info__first}`}>
        <NewFullTopInfo />
        <Link
          href={`/data-vendor/${cardData?.user?.id}`}
          className={`${styles.about__vendor} ${styles.about__vendor_none}`}
        >
          <h3 className={styles.vendor__title}>{t('companyDescription')}</h3>
          <div className={styles.vendor__box__info}>
            <div className={styles.vendor__avatar}>
              {!!cardData?.user.avatarUrl ? (
                <Image
                  className={styles.avatar__image}
                  width={80}
                  height={80}
                  src={cardData.user.avatarUrl}
                  alt='avatar'
                />
              ) : (
                <div className={styles.char__box}>
                  {' '}
                  <p className={styles.avatar__char}>
                    {!!cardData?.user.login.split('"')[1]?.charAt(0).toUpperCase()
                      ? cardData.user.login.split('"')[1]?.charAt(0).toUpperCase()
                      : cardData?.user.login.charAt(0).toUpperCase()}
                  </p>
                </div>
              )}
              <p className={styles.vendor__name}>{cardData?.user.login}</p>
            </div>
            <p className={styles.vendor__inn}>
              {t('INN')}: {cardData?.user.vendorDetails?.inn}
            </p>
          </div>
        </Link>
      </span>

      <PurchaseModal
        useAbsoluteClose
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        productTitle={cardMiniData?.title || ''}
        prices={cardMiniData?.prices || []}
        minimumOrderQuantity={cardMiniData?.minimumOrderQuantity || 1}
        onSubmit={handlePurchaseSubmit}
      />
    </>
  )
}
