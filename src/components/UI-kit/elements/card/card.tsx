'use client'
import {DeliveryMethod, Product} from '@/services/products/product.types'
import {FC, useId} from 'react'
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
}

const Card: FC<ICardProps> = ({
  id,
  // deliveryMethod = 'Доставка',
  title = 'Выгодный товар',
  price = '10000',
  discount = '0',
  previewImageUrl = t1,
  discountedPrice = '10000',
  fullProduct = {} as Product,
  isLoading = false,
  onClickFunction
}) => {
  const idFromHook = useId()
  const {toggleToFavorites} = useActions()
  const {productInFavorites} = useTypedSelector((state) => state.favorites)

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
        priceCurrency: 'RUB',
        price: hasDiscount ? discountedPrice : price,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        ...(hasDiscount && {
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: discountedPrice,
            priceCurrency: 'RUB',
            referencePrice: {
              '@type': 'UnitPriceSpecification',
              price: price,
              priceCurrency: 'RUB'
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
        <span className={`${styles.button__span}`}>
          <Skeleton style={{margin: '25px auto 0 auto', maxWidth: '150px', height: '32px', borderRadius: '20px'}} />
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

      <Link
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
              alt={`Изображение товара ${title}`}
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

          <p className={`${styles.card__title} fontInstrument`} itemProp='name'>
            {title}
          </p>

          <div className={`${styles.price__box}`} itemScope itemType='https://schema.org/Offer'>
            <meta itemProp='priceCurrency' content='RUB' />
            <meta itemProp='availability' content='https://schema.org/InStock' />
            <meta itemProp='url' content={`/card/${id}`} />

            <span style={{display: 'flex'}}>
              {discount !== 0 && price !== discountedPrice && discountedPrice !== null && (
                <div className={`${styles.discount__price} fontInstrument`} itemProp='price'>
                  {createPriceWithDot(discountedPrice.toString()) + ' RUB'}
                </div>
              )}
              <div
                className={`${styles.price} ${discount !== 0 && price !== discountedPrice ? styles.discount__gray__price : ''} fontInstrument`}
                {...(!(discount !== 0 && price !== discountedPrice && discountedPrice !== null) && {
                  itemProp: 'price'
                })}
              >
                {price !== null && createPriceWithDot(price.toString()) + ' RUB'}
              </div>
            </span>
          </div>
        </div>

        <span onClick={(e) => onClickFunction?.(e)} className={`${styles.button__span}`}>
          {/* <BasketButtonUI product={fullProduct as Product} /> */}
          Просмотреть
        </span>
      </Link>
    </>
  )
}

export default Card
