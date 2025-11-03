/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import Skeleton from 'react-loading-skeleton'
import CardSlider from '@/components/UI-kit/elements/CardSlider/CardSlider'
import StarsCount from '@/components/UI-kit/Texts/StarsCount/StarsCount'
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
import instance, {axiosClassic} from '@/api/api.interceptor'
import {toast} from 'sonner'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
// import BreadCrumbs from '@/components/UI-kit/Texts/Breadcrumbs/Breadcrumbs'
// import {useCachedNode} from '@dnd-kit/core/dist/hooks/utilities'
// import {useCategories} from '@/services/categoryes/categoryes.service'
// import {buildBreadcrumbsForCard} from '@/utils/findCategoryPath'
const ava = '/avatars/avatar-v.svg'
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

const im4 = '/shop__test.svg'

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
        // shippingDestination: {
        //   '@type': 'DefinedRegion',
        //   addressCountry: 'RU'
        // },
        shippingRate: {
          '@type': 'MonetaryAmount',
          currency: cardData.prices[0].currency
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          // businessDays: {
          //   '@type': 'OpeningHoursSpecification',
          //   dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          //   opens: '00:00',
          //   closes: '23:59'
          // },
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
        // shippingDestination: {
        //   '@type': 'DefinedRegion',
        //   addressCountry: 'CN'
        // },
        shippingRate: {
          '@type': 'MonetaryAmount',
          currency: cardData.prices[0].currency
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          // businessDays: {
          //   '@type': 'OpeningHoursSpecification',
          //   dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          //   opens: '08:00',
          //   closes: '20:00'
          // },
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

const ShopProfile = ({
  name,
  imageSrc,
  isLoading,
  vendorId
}: {
  name: string
  imageSrc: string
  isLoading: boolean
  vendorId: string
}) => {
  const t = useTranslations('CardPage.CardTopPage')
  return (
    <Link href={`/data-vendor/${vendorId}`} className={`${styles.shop__profile}`}>
      {!isLoading ? (
        <Image
          style={{borderRadius: '25%'}}
          className={`${styles.profile__image}`}
          src={imageSrc}
          alt='mini__comment'
          width={60}
          height={60}
        />
      ) : (
        <Skeleton style={{width: 100000, maxWidth: '60px'}} height={60} width={60} />
      )}
      <div className={`${styles.name__profile__box}`}>
        {!isLoading ? (
          <p className={`${styles.shop__name__text}`}>{name}</p>
        ) : (
          <Skeleton style={{width: 100000, maxWidth: '180px'}} height={20} />
        )}
        {!isLoading ? (
          <p className={`${styles.shop__name__subtext}`}>{t('company')}</p>
        ) : (
          <Skeleton style={{width: 100000, maxWidth: '180px'}} height={20} />
        )}
      </div>
    </Link>
  )
}

const VariantsBox = ({imagesUrls = [], idArray = []}: {imagesUrls: string[]; idArray: number[]}) => {
  return (
    <div className={`${styles.variants__content__box}`}>
      {imagesUrls.map((el, i) => {
        return (
          <Link href={`/card/${idArray[i]}`} key={i}>
            {el.includes('mp4') || el.includes('webm') || el.includes('mov') ? (
              <video src={el} autoPlay loop muted playsInline preload='metadata' width={60} height={60} />
            ) : (
              <Image
                // ${i == 2 && styles.variants__content__box__item__active}
                className={`${styles.variants__content__box__item}  `}
                src={el}
                alt='variant'
                width={60}
                height={60}
              />
            )}
          </Link>
        )
      })}
    </div>
  )
}

const ImagesSlider = ({
  isLoading,
  isLargeScreen,
  cardMiniData
}: {
  isLoading: boolean
  isLargeScreen: boolean
  cardMiniData: ICardFull | null
}) => {
  if (isLoading) {
    return (
      <div className={`${styles.images__comments__slider__box}`}>
        <Skeleton style={{width: 100000, maxWidth: '340px'}} count={1} height={60} width={60} />
      </div>
    )
  }

  const maxItems = isLargeScreen ? 3 : 4

  return (
    <div
      onClick={() => {
        window.scrollTo({top: document.getElementById('cardCommentsSection')?.offsetTop, behavior: 'smooth'})
      }}
      className={`${styles.images__comments__slider__box}`}
    >
      {cardMiniData?.reviewsMedia.map((el, i) => {
        if (cardMiniData.reviewsMedia.length > maxItems) {
          if (i === maxItems) {
            const moreCount = cardMiniData.reviewsMedia.length - maxItems
            return (
              <span style={{width: '60px', height: '60px', position: 'relative'}} key={el.id.toString()}>
                {el.mediaType === 'video' ? (
                  <video
                    className={`${styles.images__comments__slider__box__item_img} ${styles.images__comments__slider__box__item_img__more}`}
                    src={el.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload='metadata'
                    width={60}
                    height={60}
                    style={{
                      objectFit: 'cover',
                      backgroundColor: '#f0f0f0',
                      display: 'block'
                    }}
                    onError={(e) => {
                      console.error('Video loading error:', e)
                    }}
                  />
                ) : (
                  <Image
                    className={`${styles.images__comments__slider__box__item_img} ${styles.images__comments__slider__box__item_img__more}`}
                    src={el.url}
                    alt='mini__comment'
                    width={60}
                    height={60}
                  />
                )}
                <div className={`${styles.images__comments__slider__box__item_img__more__count}`}>
                  {`+ ${moreCount}`}
                </div>
              </span>
            )
          }
          if (i > maxItems) return null
        }

        return (
          <span style={{width: '60px', height: '60px', position: 'relative'}} key={el.id.toString()}>
            {el.mediaType === 'video' ? (
              <video
                className={`${styles.images__comments__slider__box__item_img}`}
                src={el.url}
                autoPlay
                loop
                muted
                playsInline
                preload='metadata'
                width={60}
                height={60}
                style={{
                  objectFit: 'cover',
                  backgroundColor: '#f0f0f0',
                  display: 'block'
                }}
                onError={(e) => {
                  console.error('Video loading error:', e)
                  // Можно заменить на placeholder изображение
                }}
                onLoadStart={() => console.log('Video loading started')}
                onCanPlay={() => console.log('Video can play')}
              />
            ) : (
              <Image
                className={`${styles.images__comments__slider__box__item_img}`}
                src={el.url}
                alt='mini__comment'
                width={60}
                height={60}
              />
            )}
            {el.mediaType === 'video' && (
              <svg
                className={`${styles.play__video__button}`}
                width='22'
                height='22'
                viewBox='0 0 22 22'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M11 21.4C13.7582 21.4 16.4035 20.3043 18.3539 18.3539C20.3043 16.4035 21.4 13.7582 21.4 11C21.4 8.24172 20.3043 5.59644 18.3539 3.64606C16.4035 1.69569 13.7582 0.599976 11 0.599976C8.24172 0.599976 5.59644 1.69569 3.64606 3.64606C1.69569 5.59644 0.599976 8.24172 0.599976 11C0.599976 13.7582 1.69569 16.4035 3.64606 18.3539C5.59644 20.3043 8.24172 21.4 11 21.4ZM10.4215 7.31838C10.2257 7.18775 9.99813 7.11273 9.76305 7.10131C9.52797 7.08989 9.2942 7.14251 9.08668 7.25354C8.87916 7.36457 8.70568 7.52986 8.58474 7.73176C8.4638 7.93367 8.39994 8.16462 8.39998 8.39998V13.6C8.39994 13.8353 8.4638 14.0663 8.58474 14.2682C8.70568 14.4701 8.87916 14.6354 9.08668 14.7464C9.2942 14.8574 9.52797 14.9101 9.76305 14.8986C9.99813 14.8872 10.2257 14.8122 10.4215 14.6816L14.3215 12.0816C14.4995 11.9629 14.6455 11.802 14.7465 11.6133C14.8474 11.4247 14.9003 11.214 14.9003 11C14.9003 10.786 14.8474 10.5753 14.7465 10.3866C14.6455 10.1979 14.4995 10.0371 14.3215 9.91838L10.4215 7.31838Z'
                  fill='white'
                />
              </svg>
            )}
          </span>
        )
      })}
    </div>
  )
}

export const CardTopPage = ({isLoading, cardData}: {isLoading: boolean; cardData: ICardFull | null}) => {
  const t = useTranslations('CardPage.CardTopPage')
  const [cardMiniData, setCardMiniData] = useState<ICardFull | null>(cardData)
  const [isMounted, setIsMounted] = useState(false)
  const [vendorModalOpen, setVendorModalOpen] = useState(false)
  const windowWidth = useWindowWidth()
  const [showPhone, setShowPhone] = useState(false)
  const currentLang = useLocale()
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const {toggleToFavorites} = useActions()
  const {productInFavorites} = useTypedSelector((state) => state.favorites)
  useEffect(() => {
    console.log('productInFavorites', productInFavorites)
  }, [productInFavorites])
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
  // const categories = useCategories(currentLang as any)
  // const normalizedSlug = cardData?.category?.slug?.replace(/^l\d+_/, '') || ''

  // const bread = buildBreadcrumbsForCard(categories?.data || [], normalizedSlug, cardData?.title || 'йцу')

  const handkeRequestCallback = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('handkeRequestCallback')
    e.preventDefault()
    console.log('cardData?.aboutVendor?.vendorId', cardData?.user?.vendorDetails?.id, 'cardData?.user', cardData?.user)
    try {
      await instance.post(`/vendor/${cardData?.user?.id}/request-call`).then(() => {
        setVendorModalOpen(false)
        toast.success(
          <div style={{lineHeight: 1.5, marginLeft: '10px', zIndex: '1000000030'}}>
            <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>{t('successCallback')}</strong>
            <span>{t('successCreateBody')}</span>
          </div>,
          {
            style: {background: '#2E7D32', zIndex: '1000000030'}
          }
        )
      })
    } catch {
      setVendorModalOpen(false)
      toast.error(
        <div style={{lineHeight: 1.5, zIndex: '1000000030'}}>
          <strong style={{display: 'block', marginBottom: 4}}>{t('errorCallback')}</strong>
        </div>,
        {
          style: {background: '#AC2525', zIndex: '1000000030'}
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
  const isLargeScreen = isMounted ? (windowWidth ? windowWidth : 0) > 1100 : true

  // Общий компонент для контента карточки
  const CardContent = () => (
    <>
      {!isReallyLoading ? (
        <h1 className={`${styles.card__mini__info__title}`}>{cardMiniData!.title || t('title')}</h1>
      ) : (
        <Skeleton style={{width: 100000, maxWidth: '350px'}} height={80} />
      )}
      <div className={`${styles.mini__counts}`}>
        {!isReallyLoading ? (
          <StarsCount count={cardMiniData!.rating} />
        ) : (
          <Skeleton style={{width: 100000, maxWidth: '350px'}} height={20} />
        )}
        {/* {!isReallyLoading ? <p className={`${styles.card__del__count}`}>{cardMiniData!.ordersCount} заказов</p> : <></>} */}
        {!isReallyLoading ? (
          <p className={`${styles.card__comments__count}`}>
            {' '}
            {cardMiniData!.reviewsCount} {t('revues')}
          </p>
        ) : (
          <></>
        )}
      </div>

      <ImagesSlider cardMiniData={cardMiniData} isLoading={isReallyLoading} isLargeScreen={isLargeScreen} />

      <ShopProfile
        isLoading={isReallyLoading}
        name={cardMiniData?.user.login || ''}
        imageSrc={cardData?.user.avatarUrl || im4}
        vendorId={cardMiniData?.user.id.toString() || ''}
      />

      <div className={`${styles.variants__box}`}>
        {!isReallyLoading ? (
          <h2 className={`${styles.variants__title}`}>{t('lookLoike')}</h2>
        ) : (
          <Skeleton height={24} width={100} />
        )}
        {/* {!isReallyLoading ? (
          <VariantsBox
            idArray={cardData?.similarProducts?.map((el) => el.id) || []}
            imagesUrls={cardData?.similarProducts?.map((el) => el.imageUrl) || []}
          />
        ) : (
          <div className={`${styles.variants__content__box}`}>
            <Skeleton height={60} width={60} />
            <Skeleton height={60} width={60} />
            <Skeleton height={60} width={60} />
          </div>
        )} */}
        {!isReallyLoading ? (
          <StringDescriptionGroup
            item__extra__class={`${styles.extra__descr__item__class__111}`}
            listGap={'15'}
            elementsFontSize={'15'}
            titleMain=''
            items={[
              {title: t('articul'), value: cardMiniData!.article},
              ...(cardMiniData?.characteristics
                ?.filter((char) => char?.name && char?.value)
                .map((char) => ({
                  title: char.name,
                  value: char.value
                })) || [])
            ]}
          />
        ) : (
          <div>
            <Skeleton height={16} width={200} />
            <Skeleton height={16} width={180} />
            <Skeleton height={16} width={160} />
            <Skeleton height={16} width={220} />
          </div>
        )}
        {!isReallyLoading ? (
          <span className={`${styles.descr__more__info}`}>
            <Link href={'#description__title__id'}>{t('podrobnee')}</Link>
          </span>
        ) : (
          <Skeleton height={16} width={80} />
        )}
      </div>
    </>
  )

  const NewFullTopInfo = () => {
    const t = useTranslations('CardTopPage')

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
          <p className={styles.reviews__count}>
            {cardData?.reviewsCount} {t('revues')}
          </p>
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
          <button
            onClick={() => {
              toggleToFavorites(cardData as any)
            }}
            className={styles.fav__button}
          >
            <svg
              className={
                !productInFavorites.find((item) => item?.id?.toString() === cardData?.id?.toString())
                  ? styles.active__star
                  : ''
              }
              width='28'
              height='28'
              viewBox='0 0 28 28'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M16.0187 4.09499L18.072 8.20165C18.352 8.77332 19.0987 9.32165 19.7287 9.42665L23.4504 10.045C25.8304 10.4417 26.3904 12.1683 24.6754 13.8717L21.782 16.765C21.292 17.255 21.0237 18.2 21.1754 18.8767L22.0037 22.4583C22.657 25.2933 21.152 26.39 18.6437 24.9083L15.1554 22.8433C14.5254 22.47 13.487 22.47 12.8454 22.8433L9.35705 24.9083C6.86038 26.39 5.34372 25.2817 5.99705 22.4583L6.82538 18.8767C6.97705 18.2 6.70872 17.255 6.21872 16.765L3.32538 13.8717C1.62205 12.1683 2.17038 10.4417 4.55038 10.045L8.27205 9.42665C8.89038 9.32165 9.63705 8.77332 9.91705 8.20165L11.9704 4.09499C13.0904 1.86665 14.9104 1.86665 16.0187 4.09499Z'
                stroke={
                  !productInFavorites.find((item) => item?.id?.toString() === cardData?.id?.toString())
                    ? 'transparent'
                    : '#FFFFFF'
                }
                fill={
                  productInFavorites.find((item) => item?.id?.toString() === cardData?.id?.toString())
                    ? '#FF0000'
                    : 'none'
                }
                strokeWidth={
                  !productInFavorites.find((item) => item?.id?.toString() === cardData?.id?.toString()) ? '1.5' : '0'
                }
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>

        <div className={styles.characteristics__list}>
          <StringDescriptionGroup
            extraBoxClass={`${styles.extra__group__class}`}
            titleFontSize='16'
            listGap='10'
            items={[
              {title: t('articul'), value: cardData?.article || ''},
              ...(cardData?.characteristics?.slice(0, 4)?.map((el) => ({
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

  // Общий компонент для информации о цене и доставке
  // const PriceAndDeliveryInfo = () => {
  //   const priceUnitRef = useRef<HTMLParagraphElement>(null)
  //   const [isWide, setIsWide] = useState(false)

  //   useLayoutEffect(() => {
  //     if (priceUnitRef.current) {
  //       setIsWide(priceUnitRef.current.offsetWidth >= 190)
  //     }
  //   }, [cardData])

  //   const urlForLogo = useMemo(() => cardData?.user.avatarUrl || ava || '', [])
  //   return (
  //     <div className={`${styles.card__state}`}>
  //       <ModalWindowDefault
  //         extraClass={styles.vendor__modal__extra}
  //         isOpen={vendorModalOpen}
  //         onClose={() => setVendorModalOpen(false)}
  //       >
  //         <div className={`${styles.modal__vendor__box__first}`}>
  //           <h2 className={styles.vendor__modal__title}>{cardData?.user.login}</h2>
  //           <div className={`${styles.modal__vendor__content}`}>
  //             <Image
  //               style={{borderRadius: '20px'}}
  //               src={urlForLogo}
  //               alt={cardData?.user.login || ''}
  //               width={200}
  //               height={200}
  //             />
  //             <div className={`${styles.texts__box}`}>
  //               <div className={`${styles.inn__box}`}>
  //                 <span>
  //                   {' '}
  //                   <b className={styles.mini__title__vendor}> {t('innTitle')}</b>
  //                 </span>{' '}
  //                 {cardData?.user.vendorDetails?.inn}
  //               </div>
  //               <div className={`${styles.inn__box}`}>
  //                 <span>
  //                   {' '}
  //                   <b className={styles.mini__title__vendor}> {t('countriesTitle')}</b>{' '}
  //                 </span>{' '}
  //                 <ul className={`${styles.countries__list}`}>
  //                   {cardData?.user.vendorDetails?.countries?.map((el, i) => (
  //                     <li key={i + el?.id}>{el?.name}</li>
  //                   ))}
  //                 </ul>
  //               </div>
  //               <div className={`${styles.inn__box}`}>
  //                 <span>
  //                   {' '}
  //                   <b className={styles.mini__title__vendor}> {t('addressTitle')}</b>{' '}
  //                 </span>{' '}
  //                 <p className={`${styles.countries__list}`}>
  //                   {cardData?.user?.vendorDetails?.address || t('addressAlternative')}
  //                 </p>
  //               </div>
  //               {cardData?.user.vendorDetails?.description?.length !== 0 && (
  //                 <TextAreaUI
  //                   currentValue={cardData?.user.vendorDetails?.description || ''}
  //                   onSetValue={() => {}}
  //                   readOnly
  //                   maxRows={10}
  //                   theme='superWhite'
  //                   minRows={2}
  //                   autoResize
  //                   placeholder={t('description')}
  //                 />
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //         <div className={styles.buttons__box}>
  //           <button
  //             className={`${styles.telephone__button} ${!showPhone ? styles.telephone__button__hidden : styles.telephone__button__show} `}
  //             onClick={() => setShowPhone(true)}
  //           >
  //             {showPhone
  //               ? cardData?.user?.phoneNumber || cardData?.user.vendorDetails?.phoneNumbers?.[0] || 'Without phone'
  //               : t('showTelephone')}
  //           </button>
  //           <button className={styles.button__vendor__bottom} onClick={() => {}}>
  //             {t('showOnEmail')}
  //           </button>
  //           <button
  //             className={styles.button__vendor__bottom}
  //             onClick={(e) => {
  //               handkeRequestCallback(e)
  //             }}
  //           >
  //             {t('RequestCallback')}
  //           </button>
  //         </div>
  //       </ModalWindowDefault>
  //       <div className={`${styles.card__state__big}`}>
  //         <ul className={`${styles.prices__list}`}>
  //           {cardData?.prices.map((el, i) => {
  //             return (
  //               <li className={`${styles.prices__list_item}`} key={i}>
  //                 {!isReallyLoading ? (
  //                   <div className={`${styles.price__list__title}`}>
  //                     <span className={`${styles.price__range}`}>
  //                       {el.to == 999999
  //                         ? el.from + '+'
  //                         : el.from === el.to
  //                           ? el.from
  //                           : el.from + '\u00AD-\u00AD' + el.to}
  //                     </span>
  //                     <span className={`${styles.price__unit}`}>{el.unit}</span>
  //                   </div>
  //                 ) : (
  //                   <Skeleton style={{width: 100000, maxWidth: '45px'}} height={30} />
  //                 )}
  //                 {!isReallyLoading ? (
  //                   <p
  //                     style={{flexWrap: isWide ? 'wrap' : 'nowrap', justifyContent: isWide ? 'end' : 'center'}}
  //                     ref={priceUnitRef}
  //                     className={`${styles.price__list__value__start}`}
  //                   >
  //                     <span
  //                       className={`${styles.price__original__price} ${el.discountedPrice !== el.originalPrice && styles.price__original__with__discount}`}
  //                     >
  //                       {createPriceWithDot(el.originalPrice.toString())}
  //                     </span>
  //                     {el.originalPrice !== el.discountedPrice ? (
  //                       <span className={`${styles.discount__price}`}>
  //                         {createPriceWithDot(el.discountedPrice.toString())}
  //                       </span>
  //                     ) : (
  //                       ''
  //                     )}
  //                     <span className={`${styles.price__unit}`}>
  //                       {renderPriceUnit(
  //                         el.currency + `/` + el.unit,
  //                         [
  //                           styles.price__currency__first,
  //                           el.discountedPrice !== el.originalPrice ? styles.price__currency__first__active : ''
  //                         ],
  //                         [styles.price__unitMeasure]
  //                       )}
  //                     </span>
  //                   </p>
  //                 ) : (
  //                   <Skeleton style={{width: '100%', maxWidth: '150px'}} height={30} />
  //                 )}
  //               </li>
  //             )
  //           })}
  //         </ul>
  //         {!(Number(cardData?.daysBeforeDiscountExpires) <= 0) && (
  //           <div className={`${styles.discount__date__box}`}>
  //             <span className={`${styles.date__count}`}>
  //               {!isReallyLoading ? (
  //                 cardData?.daysBeforeDiscountExpires?.toString() + t('days')
  //               ) : (
  //                 <Skeleton style={{width: 100000, maxWidth: '45px'}} height={16} />
  //               )}
  //             </span>
  //             <span className={`${styles.date__text__end}`}>
  //               {!isReallyLoading ? (
  //                 ' ' + ' ' + t('discountDate')
  //               ) : (
  //                 <Skeleton style={{width: 100000, maxWidth: '100%'}} height={16} />
  //               )}
  //             </span>
  //           </div>
  //         )}
  //         <div
  //           style={{marginTop: Number(cardData?.daysBeforeDiscountExpires) <= 0 ? '15px' : '0'}}
  //           className={`${styles.min__weight}`}
  //         >
  //           {!isReallyLoading ? (
  //             `${t('minimumOrderQuantity')} ${cardData?.minimumOrderQuantity} ${cardData?.prices[0].unit}`
  //           ) : (
  //             <Skeleton style={{width: 100000, maxWidth: '100%'}} height={16} />
  //           )}
  //         </div>

  //         <div className={`${styles.buttons__box}`}>
  //           {!isReallyLoading ? (
  //             <button onClick={() => setPurchaseModalOpen(true)} className={`${styles.by__now__button}`}>
  //               {t('byNow')}
  //             </button>
  //           ) : (
  //             <Skeleton height={48} width={150} />
  //           )}
  //         </div>
  //         <div className={`${styles.buttons__box}`}>
  //           {!isReallyLoading ? (
  //             <div
  //               onClick={(event) => {
  //                 event.preventDefault()
  //                 setVendorModalOpen(true)
  //               }}
  //               className={`${styles.by__now__button} ${styles.by__now__button__vendor}`}
  //             >
  //               {t('showVendorData')}
  //             </div>
  //           ) : (
  //             <Skeleton height={48} width={150} />
  //           )}
  //         </div>
  //       </div>
  //       {(!!cardData?.deliveryMethodsDetails?.length || !!cardData?.packagingOptions?.length) && (
  //         <div className={`${styles.card__state__mini}`}>
  //           {!isReallyLoading ? (
  //             <h4 className={`${styles.state__mini__title}`}>{t('deliveryMethodsInfo')}</h4>
  //           ) : (
  //             <Skeleton style={{width: 100000, maxWidth: '100%', marginBottom: '16px'}} height={26} />
  //           )}
  //           <ul className={`${styles.state__mini__list}`}>
  //             {cardData?.deliveryMethodsDetails?.map((el, i) => {
  //               return (
  //                 <li key={el.name.toString() + i} className={`${styles.state__mini__list__item}`}>
  //                   {!isReallyLoading ? (
  //                     <p className={`${styles.state__mini__list__item__text}`}>{el.name}</p>
  //                   ) : (
  //                     <Skeleton style={{width: 100000, maxWidth: '70px'}} height={16} />
  //                   )}
  //                   {!isReallyLoading ? (
  //                     <p className={`${styles.state__mini__list__item__value}`}>{el.value}</p>
  //                   ) : (
  //                     <Skeleton style={{width: 100000, maxWidth: '100px'}} height={16} />
  //                   )}
  //                 </li>
  //               )
  //             })}
  //           </ul>
  //           {!isReallyLoading ? (
  //             <h4 className={`${styles.state__mini__title}`}>{t('packagingOptions')}</h4>
  //           ) : (
  //             <Skeleton style={{width: 100000, maxWidth: '100%', marginBottom: '16px'}} height={26} />
  //           )}

  //           <ul className={`${styles.state__mini__list}`}>
  //             {cardData?.packagingOptions?.map((el, i) => {
  //               return (
  //                 <li className={`${styles.state__mini__list__item}`} key={el.name.toString() + i}>
  //                   {!isReallyLoading ? (
  //                     <>
  //                       <p className={`${styles.state__mini__list__item__text}`}>{el.name}</p>
  //                       <p className={`${styles.state__mini__list__item__text}`}>{el.price + ' ' + el.priceUnit}</p>
  //                     </>
  //                   ) : (
  //                     <Skeleton style={{width: 100000, maxWidth: '70px'}} height={16} />
  //                   )}
  //                 </li>
  //               )
  //             })}
  //             {/* <li className={`${styles.state__mini__list__item}`}>
  //           {!isReallyLoading ? (
  //             <p className={`${styles.state__mini__list__item__text}`}>Коробки</p>
  //           ) : (
  //             <Skeleton style={{width: 100000, maxWidth: '70px'}} height={16} />
  //           )}
  //         </li> */}
  //           </ul>
  //         </div>
  //       )}
  //     </div>
  //   )
  // }

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
            // console.log('el url', el.url)
            return el.url
          })}
          isLoading={isReallyLoading}
          extraClass={styles.card__slider__box__extra}
        />
      </div>

      {/* Первая секция */}
      <span className={`${styles.card__row__info} ${styles.card__col__info__first}`}>
        {/* <div className={`${styles.card__mini__info}`}>
          <CardContent />
        </div> */}
        {/* <PriceAndDeliveryInfo /> */}
        <NewFullTopInfo />
      </span>

      {/* Вторая секция */}
      {/* <span className={`${styles.card__col__info} ${styles.card__col__info__secondary}`}>
        <div className={`${styles.card__mini__info}`}>
          <CardContent />
        </div>
        <PriceAndDeliveryInfo />
        
      </span> */}
      <PurchaseModal
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
