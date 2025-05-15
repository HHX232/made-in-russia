'use client'
import {FC, useEffect, useState} from 'react'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import styles from './BasketButtonUI.module.scss'
import Image from 'next/image'
import {useActions} from '@/hooks/useActions'
import {Product} from '@/services/products/product.types'
import {IProductInBasket} from '@/store/Basket/Basket.types'

const basket = '/miniBasket.svg'
interface IBasketButtonProps {
  product: Product // Принимаем весь продукт, а не только id
  extraClass?: string
}

const BasketButtonUI: FC<IBasketButtonProps> = ({product, extraClass = ''}) => {
  const {productsInBasket} = useTypedSelector((store) => store.basket)
  const [basketContainsProduct, setBasketContainsProduct] = useState(false)
  const {addToBasket, increaseCount, decreaseCount} = useActions()

  const currentProductInBasket: IProductInBasket | undefined = productsInBasket.find((productInB) => {
    const basketId = productInB?.id?.toString()
    const productId = product?.id?.toString()
    return basketId && productId && basketId === productId
  })

  // useEffect(() => {
  //   console.log('productsInBasket', productsInBasket)
  // }, [productsInBasket])

  useEffect(() => {
    const isInBasket = productsInBasket.some((item) => item.id === product.id)
    setBasketContainsProduct(isInBasket)
  }, [productsInBasket, product.id])

  const handleAddToBasket = () => {
    if (basketContainsProduct) return
    addToBasket({
      ...product
      // countInBasket: 1 // Добавляем начальное количество
    })
  }

  return (
    <div
      onClick={handleAddToBasket}
      className={` ${basketContainsProduct && styles.count__active} ${styles.button__box} ${extraClass}`}
    >
      {!basketContainsProduct ? (
        <div className={styles.add__box}>
          Добавить
          <Image src={basket} alt='add in basket' width={16} height={14} />
        </div>
      ) : (
        <div className={`${styles.count__box}`}>
          <div
            onClick={() => {
              decreaseCount(product.id.toString())
            }}
            className={`${styles.decrease__text}`}
          >
            -
          </div>
          <div className={`${styles.count__inBox}`}>{currentProductInBasket?.countInBasket}</div>
          <div
            onClick={() => {
              increaseCount(product.id.toString())
            }}
            className={`${styles.increase__text}`}
          >
            +
          </div>
        </div>
      )}
    </div>
  )
}

export default BasketButtonUI
