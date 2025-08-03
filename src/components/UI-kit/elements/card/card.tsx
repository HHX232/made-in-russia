'use client'
import {DeliveryMethod, Product} from '@/services/products/product.types'
import {memo, useId} from 'react'
import Image, {StaticImageData} from 'next/image'
import styles from './card.module.scss'
import {createPriceWithDot} from '@/utils/createPriceWithDot'
// import BasketButtonUI from '../../buttons/BasketButtonUI/BasketButtonUI'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import ToggleFavoritesButtonUI from '../../buttons/toggleFavoritesButtonUI/toggleFavoritesButtonUI'
import {useActions} from '@/hooks/useActions'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import Link from 'next/link'
import {useTranslations} from 'next-intl'
import instance from '@/api/api.interceptor'
import {toast} from 'sonner'

const t1 = '/tree.jpg'
const t2 = '/tree2.jpg'

export interface ICardProps {
  id: number
  deliveryMethod: Omit<DeliveryMethod, 'creationDate' | 'lastModificationDate'>
  title: string
  price: number
  discount: number
  previewImageUrl: string | StaticImageData
  discountedPrice: number
  fullProduct?: Product
  isLoading?: boolean
  onClickFunction?: (e: React.MouseEvent<HTMLDivElement | HTMLSpanElement>) => void
  canUpdateProduct?: boolean
  onPreventCardClick?: (item: Product) => void
  isShowButton?: boolean
  specialButtonText?: string
}

const Card = memo<ICardProps>(
  ({
    id,
    // deliveryMethod = 'Доставка',
    title = 'default Title',
    price = '10000',
    discount = '0',
    previewImageUrl = t1,
    discountedPrice = '10000',
    fullProduct = {} as Product,
    isLoading = false,
    onClickFunction,
    canUpdateProduct = false,
    onPreventCardClick,
    specialButtonText,
    isShowButton = true
  }) => {
    const idFromHook = useId()
    const {toggleToFavorites} = useActions()
    const {productInFavorites} = useTypedSelector((state) => state.favorites)
    const t = useTranslations('CardComponent')
    console.log(fullProduct)
    const generateStructuredData = () => {
      // TODO Заменить на правильный домен
      const baseUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SITE_URL : 'https://yourdomain.com'
      const hasDiscount = discount !== 0 && price !== discountedPrice && discountedPrice !== null

      return {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: title,
        image:
          typeof previewImageUrl === 'string'
            ? previewImageUrl.startsWith('http')
              ? previewImageUrl
              : `${baseUrl}${previewImageUrl}`
            : `${baseUrl}${t1}`,
        sku: `product-${id}`,
        identifier: {
          '@type': 'PropertyValue',
          name: 'Product ID',
          value: id.toString()
        },
        offers: {
          '@type': 'Offer',
          url: `${baseUrl}/card/${id}`,
          priceCurrency: fullProduct?.priceCurrency || 'RUB',
          price: hasDiscount ? discountedPrice : price,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          ...(hasDiscount && {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: discountedPrice,
              priceCurrency: fullProduct?.priceCurrency || 'RUB',
              referencePrice: {
                '@type': 'UnitPriceSpecification',
                price: price,
                priceCurrency: fullProduct?.priceCurrency || 'RUB'
              }
            }
          })
        },
        ...(hasDiscount && {
          additionalProperty: {
            '@type': 'PropertyValue',
            name: 'Discount',
            value: `${discount}%`
          }
        })
      }
    }

    const deleteProduct = async (id: string) => {
      const loadingToast = toast.loading('processing...')
      try {
        const res = await instance.delete(`/products/${id}`)
        console.log(res)
        toast.dismiss(loadingToast)
        toast.success(
          <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
            <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>Успешно!</strong>
            <span>Товар успешно удален</span>
          </div>,
          {
            style: {
              background: '#2E7D32'
            }
          }
        )
      } catch (e) {
        console.log(e)
        toast.dismiss(loadingToast)
        toast.error(
          <div style={{lineHeight: 1.5, marginLeft: '10px'}}>
            <strong style={{display: 'block', marginBottom: 4, fontSize: '18px'}}>Ошибка!</strong>
            <span>Ошибка удаления товара</span>
          </div>,
          {
            style: {
              background: '#AC2525'
            }
          }
        )
      }
    }
    if (isLoading) {
      return (
        <div className={`${styles.card__box}`}>
          <div>
            <div className={`${styles.image__box}`}>
              <Skeleton className={`${styles.card__image__skeleton}`} count={1} />
              <Skeleton
                style={{
                  width: '20px',
                  height: '20px',
                  maxWidth: '20px',
                  marginLeft: 'auto',
                  borderRadius: '10px',
                  position: 'absolute',
                  content: '',
                  top: '10px',
                  right: '10px'
                }}
              />
            </div>
            <Skeleton count={2} style={{marginBottom: '7px', borderRadius: '6px'}} />
            <div className={`${styles.price__box}`}>
              <Skeleton style={{maxWidth: '140px', borderRadius: '6px'}} />
            </div>
          </div>
          <span style={{backgroundColor: 'transparent', border: 'none'}} className={`${styles.button__span}`}>
            <Skeleton style={{margin: '25px auto 0 auto', maxWidth: '250px', height: '32px', borderRadius: '20px'}} />
          </span>
        </div>
      )
    }

    return (
      <>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData())
          }}
        />
        {!!onPreventCardClick && (
          <div
            id='cy-card'
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onPreventCardClick(fullProduct)
            }}
            key={id + idFromHook}
            className={`${styles.card__box}`}
            itemScope
            itemType='https://schema.org/Product'
          >
            <div>
              <div className={`${styles.image__box}`}>
                {typeof previewImageUrl === 'string' &&
                (previewImageUrl?.includes('.mp4') ||
                  previewImageUrl?.includes('.webm') ||
                  previewImageUrl?.includes('.mov')) ? (
                  <video className={`${styles.card__image}`} width={250} height={250} autoPlay loop muted playsInline>
                    <source src={previewImageUrl as string} type='video/mp4' />
                  </video>
                ) : (
                  <Image
                    className={`${styles.card__image}`}
                    width={250}
                    height={250}
                    alt={`${t('cardImageAlt')} ${title}`}
                    src={previewImageUrl || t2}
                    itemProp='image'
                  />
                )}
                {discount !== 0 && price !== discountedPrice && (
                  <div className={`${styles.discount__box}`}>{discount + '%'}</div>
                )}
                <ToggleFavoritesButtonUI
                  extraClass={`${styles.star__image}`}
                  isActive={productInFavorites.some((product) => product.id === (fullProduct.id ? fullProduct.id : {}))}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    e.preventDefault()
                    toggleToFavorites(fullProduct as Product)
                  }}
                />
              </div>

              <p id='cy-card-title' className={`${styles.card__title} fontInstrument`} itemProp='name'>
                {title}
              </p>

              <div className={`${styles.price__box}`} itemScope itemType='https://schema.org/Offer'>
                <meta itemProp='priceCurrency' content={fullProduct?.priceCurrency || 'RUB'} />
                <meta itemProp='availability' content='https://schema.org/InStock' />
                <meta itemProp='url' content={`/card/${id}`} />

                <span style={{display: 'flex'}}>
                  {discount !== 0 && price !== discountedPrice && discountedPrice !== null && (
                    <div className={`${styles.discount__price} fontInstrument`} itemProp='price'>
                      {createPriceWithDot(discountedPrice.toString()) + ' ' + fullProduct?.priceCurrency}
                    </div>
                  )}
                  <div
                    className={`${styles.price} ${discount !== 0 && price !== discountedPrice ? styles.discount__gray__price : ''} fontInstrument`}
                    {...(!(discount !== 0 && price !== discountedPrice && discountedPrice !== null) && {
                      itemProp: 'price'
                    })}
                  >
                    {price !== null && createPriceWithDot(price.toString()) + ' ' + fullProduct?.priceCurrency}
                  </div>
                </span>
              </div>
            </div>

            {!isLoading && isShowButton && !canUpdateProduct && (
              <span onClick={(e) => onClickFunction?.(e)} className={`${styles.button__span}`}>
                {/* <BasketButtonUI product={fullProduct as Product} /> */}
                {specialButtonText || t('saw')}
              </span>
            )}

            {!isLoading && isShowButton && canUpdateProduct && (
              <div className={styles.update__buttons__box}>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    deleteProduct(id.toString())
                  }}
                  className={styles.deleate__button}
                >
                  <svg width='17' height='19' viewBox='0 0 17 19' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M5.96204 2.75C6.32239 1.73046 7.29475 1 8.43767 1C9.5806 1 10.553 1.73046 10.9133 2.75'
                      stroke='#F4F7FF'
                      stroke-width='1.3'
                      stroke-linecap='round'
                    />
                    <path d='M15.8751 4.5H1' stroke='#F4F7FF' stroke-width='1.3' stroke-linecap='round' />
                    <path
                      d='M14.4166 6.6875L14.0141 12.7242C13.8592 15.0472 13.7818 16.2088 13.0249 16.9169C12.2681 17.625 11.104 17.625 8.77575 17.625H8.09911C5.77087 17.625 4.60677 17.625 3.84989 16.9169C3.09301 16.2088 3.01557 15.0472 2.8607 12.7242L2.45825 6.6875'
                      stroke='#F4F7FF'
                      stroke-width='1.3'
                      stroke-linecap='round'
                    />
                    <path d='M6.25 8.875L6.6875 13.25' stroke='#F4F7FF' stroke-width='1.3' stroke-linecap='round' />
                    <path d='M10.625 8.875L10.1875 13.25' stroke='#F4F7FF' stroke-width='1.3' stroke-linecap='round' />
                  </svg>
                </button>

                <Link href={`/create-card/${id}`} className={`${styles.button__span}`}>
                  {/* <BasketButtonUI product={fullProduct as Product} /> */}
                  {specialButtonText || t('edit')}
                </Link>
              </div>
            )}
          </div>
        )}
        {!onPreventCardClick && (
          <Link
            id='cy-card'
            onClick={(e) => onClickFunction?.(e)}
            href={`/card/${id}`}
            key={id + idFromHook}
            className={`${styles.card__box}`}
            itemScope
            itemType='https://schema.org/Product'
          >
            <div>
              <div className={`${styles.image__box}`}>
                <Image
                  className={`${styles.card__image}`}
                  width={250}
                  height={250}
                  alt={`${t('cardImageAlt')} ${title}`}
                  src={previewImageUrl || t2}
                  itemProp='image'
                />
                {discount !== 0 && price !== discountedPrice && (
                  <div className={`${styles.discount__box}`}>{discount + '%'}</div>
                )}
                <ToggleFavoritesButtonUI
                  extraClass={`${styles.star__image}`}
                  isActive={productInFavorites.some((product) => product.id === (fullProduct.id ? fullProduct.id : {}))}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    e.preventDefault()
                    toggleToFavorites(fullProduct as Product)
                  }}
                />
              </div>

              <p id='cy-card-title' className={`${styles.card__title} fontInstrument`} itemProp='name'>
                {title}
              </p>

              <div className={`${styles.price__box}`} itemScope itemType='https://schema.org/Offer'>
                <meta itemProp='priceCurrency' content={fullProduct?.priceCurrency || 'RUB'} />
                <meta itemProp='availability' content='https://schema.org/InStock' />
                <meta itemProp='url' content={`/card/${id}`} />

                <span style={{display: 'flex'}}>
                  {discount !== 0 && price !== discountedPrice && discountedPrice !== null && (
                    <div className={`${styles.discount__price} fontInstrument`} itemProp='price'>
                      {createPriceWithDot(discountedPrice.toString()) + ' ' + fullProduct?.priceCurrency}
                    </div>
                  )}
                  <div
                    className={`${styles.price} ${discount !== 0 && price !== discountedPrice ? styles.discount__gray__price : ''} fontInstrument`}
                    {...(!(discount !== 0 && price !== discountedPrice && discountedPrice !== null) && {
                      itemProp: 'price'
                    })}
                  >
                    {price !== null && createPriceWithDot(price.toString()) + ' ' + fullProduct?.priceCurrency}
                  </div>
                </span>
              </div>
            </div>

            {!isLoading && isShowButton && !canUpdateProduct && (
              <span onClick={(e) => onClickFunction?.(e)} className={`${styles.button__span}`}>
                {/* <BasketButtonUI product={fullProduct as Product} /> */}
                {specialButtonText || t('saw')}
              </span>
            )}
            {!isLoading && isShowButton && canUpdateProduct && (
              <div className={styles.update__buttons__box}>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    deleteProduct(id.toString())
                  }}
                  className={styles.deleate__button}
                >
                  <svg width='17' height='19' viewBox='0 0 17 19' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M5.96204 2.75C6.32239 1.73046 7.29475 1 8.43767 1C9.5806 1 10.553 1.73046 10.9133 2.75'
                      stroke='#F4F7FF'
                      stroke-width='1.3'
                      stroke-linecap='round'
                    />
                    <path d='M15.8751 4.5H1' stroke='#F4F7FF' stroke-width='1.3' stroke-linecap='round' />
                    <path
                      d='M14.4166 6.6875L14.0141 12.7242C13.8592 15.0472 13.7818 16.2088 13.0249 16.9169C12.2681 17.625 11.104 17.625 8.77575 17.625H8.09911C5.77087 17.625 4.60677 17.625 3.84989 16.9169C3.09301 16.2088 3.01557 15.0472 2.8607 12.7242L2.45825 6.6875'
                      stroke='#F4F7FF'
                      stroke-width='1.3'
                      stroke-linecap='round'
                    />
                    <path d='M6.25 8.875L6.6875 13.25' stroke='#F4F7FF' stroke-width='1.3' stroke-linecap='round' />
                    <path d='M10.625 8.875L10.1875 13.25' stroke='#F4F7FF' stroke-width='1.3' stroke-linecap='round' />
                  </svg>
                </button>

                <Link href={`/create-card/${id}`} className={`${styles.button__span}`}>
                  {/* <BasketButtonUI product={fullProduct as Product} /> */}
                  {specialButtonText || t('edit')}
                </Link>
              </div>
            )}
          </Link>
        )}
      </>
    )
  }
)
Card.displayName = 'CardMemo'

export default Card
