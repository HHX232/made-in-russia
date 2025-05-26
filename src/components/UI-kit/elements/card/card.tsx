'use client'
import {DeliveryMethod, Product} from '@/services/products/product.types'
import {FC, useId} from 'react'

import Image, {StaticImageData} from 'next/image'
import styles from './card.module.scss'
import {createPriceWithDot} from '@/utils/createPriceWithDot'
import BasketButtonUI from '../../buttons/BasketButtonUI/BasketButtonUI'
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
  isLoading = false
}) => {
  const idFromHook = useId()
  const {toggleToFavorites} = useActions()
  const {productInFavorites} = useTypedSelector((state) => state.favorites)
  return (
    <Link href={`/card/${id}`} key={id + idFromHook} className={`${styles.card__box}`}>
      <div>
        <div className={`${styles.image__box}`}>
          {!isLoading ? (
            <Image
              className={`${styles.card__image}`}
              width={250}
              height={250}
              alt='product Image'
              src={previewImageUrl || t2}
            />
          ) : (
            <Skeleton className={`${styles.card__image__skeleton}`} count={1} />
          )}
          {!isLoading && discount !== 0 && price !== discountedPrice ? (
            <div className={`${styles.discount__box}`}>{discount + '%'}</div>
          ) : (
            ''
          )}
          {!isLoading ? (
            <ToggleFavoritesButtonUI
              extraClass={`${styles.star__image}`}
              isActive={productInFavorites.some((product) => product.id === (fullProduct.id ? fullProduct.id : {}))}
              onClick={() => {
                toggleToFavorites(fullProduct as Product)
              }}
            />
          ) : (
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
          )}
        </div>

        {!isLoading ? (
          <p className={`${styles.card__title}`}>{title}</p>
        ) : (
          <Skeleton count={2} style={{marginBottom: '7px', borderRadius: '6px'}} />
        )}
        <div className={`${styles.price__box}`}>
          <span style={{display: 'flex'}}>
            {!isLoading && discount !== 0 && price !== discountedPrice ? (
              <div className={`${styles.discount__price} fontInstrument`}>
                {createPriceWithDot(discountedPrice.toString()) + ' RUB'}{' '}
              </div>
            ) : (
              ''
            )}
            {!isLoading ? (
              <div
                className={`${styles.price} ${discount !== 0 && price !== discountedPrice ? styles.discount__gray__price : ''} fontInstrument`}
              >
                {' '}
                {createPriceWithDot(price.toString()) + ' RUB'}
              </div>
            ) : (
              <Skeleton style={{maxWidth: '140px', borderRadius: '6px'}} />
            )}
          </span>
        </div>
      </div>

      <span className={`${styles.button__span}`}>
        {!isLoading ? (
          <BasketButtonUI product={fullProduct as Product} />
        ) : (
          <Skeleton style={{margin: '25px auto 0 auto', maxWidth: '150px', height: '32px', borderRadius: '20px'}} />
        )}
      </span>
    </Link>
  )
}

export default Card
