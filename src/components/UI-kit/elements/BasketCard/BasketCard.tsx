import {IProductInBasket} from '@/store/Basket/Basket.types'
import styles from './BasketCard.module.scss'
import Image from 'next/image'
import ToggleFavoritesButtonUI from '../../buttons/toggleFavoritesButtonUI/toggleFavoritesButtonUI'
import BasketButtonUI from '../../buttons/BasketButtonUI/BasketButtonUI'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {createPriceWithDot} from '@/utils/createPriceWithDot'
import {useActions} from '@/hooks/useActions'
import {useEffect} from 'react'
const trash = '/trash.svg'

const BasketCard = ({product, onFavClick}: {product: IProductInBasket; onFavClick: () => void}) => {
  const {productInFavorites} = useTypedSelector((state) => state.favorites)
  const isProductInFavorites = productInFavorites.some((el) => el.id.toString() === product.id.toString())
  const {removeFromBasket} = useActions()

  useEffect(() => {
    console.log('product ', product)
  }, [product])

  return (
    <li className={styles.basket__item}>
      <div className={`${styles.item__image__box}`}>
        <Image
          className={styles.basket__image}
          src={product.previewImageUrl}
          alt={product.title}
          width={100}
          height={100}
        />
        <ToggleFavoritesButtonUI
          onClick={onFavClick}
          extraClass={`${styles.star__extra}`}
          isActive={isProductInFavorites}
        />
        <BasketButtonUI
          extraClass={`${styles.info__buttons__extra} ${styles.info__buttons__extra__little}`}
          product={product}
        />
      </div>
      <div className={`${styles.info__box}`}>
        <div className={`${styles.info__top__box}`}>
          <div className={`${styles.top__texts}`}>
            <div className={`${styles.info__title}`}>{product.title}</div>
            <div className={`${styles.info__subtitle}`}>
              {'Описание ' +
                product.title +
                ' ' +
                product.title +
                ' ' +
                product.title +
                ' ' +
                product.title +
                ' ' +
                product.title}
            </div>
            <div className={`${styles.info__descr}`}>{`Мини ${product.title}`}</div>
            <div
              className={`${styles.info__delivery}`}
            >{`${product?.deliveryMethod?.name && (product?.deliveryMethod?.name || product.deliveryMethods.map((el) => el.name))}`}</div>
          </div>
          <div className={`${styles.top__price__box}`}>
            {product.discountedPrice !== product.originalPrice && (
              <div className={`${styles.spec__price} `}>
                {createPriceWithDot(product.discountedPrice.toString()) + ' RUB'}
              </div>
            )}
            <div
              className={`${styles.price} ${product.discountedPrice !== product.originalPrice && styles.spec__price_discount}`}
            >
              {createPriceWithDot(product.originalPrice.toString()) + ' RUB'}
            </div>
          </div>
        </div>
        <div className={`${styles.info__buttons__box}`}>
          <Image
            onClick={() => removeFromBasket(product.id.toString())}
            className={styles.info__buttons__trash_image}
            src={trash}
            alt='trash'
            width={16}
            height={18}
          />
          <BasketButtonUI
            extraClass={`${styles.info__buttons__extra} ${styles.info__buttons__extra__big}`}
            product={product}
          />
        </div>
      </div>
    </li>
  )
}

export default BasketCard
