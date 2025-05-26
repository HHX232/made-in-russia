'use client'
import {FC, useEffect, useState} from 'react'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import styles from './BasketButtonUI.module.scss'
import Image from 'next/image'
import {useActions} from '@/hooks/useActions'
import {Product} from '@/services/products/product.types'
import {IProductInBasket} from '@/store/Basket/Basket.types'

const basket = '/miniBasket.svg'
const darkBasket = '/dark_basket.svg'
interface IBasketButtonProps {
  product: Product // Принимаем весь продукт, а не только id
  extraClass?: string
  textColor?: 'dark' | 'white'
  iconColor?: 'dark' | 'white'
}

const BasketButtonUI: FC<IBasketButtonProps> = ({
  product,
  extraClass = '',
  textColor = 'white',
  iconColor = 'white'
}) => {
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
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        handleAddToBasket()
      }}
      className={` ${basketContainsProduct && styles.count__active} ${styles.button__box} ${extraClass}`}
    >
      {!basketContainsProduct ? (
        <div className={` ${styles.add__box} ${textColor === 'dark' ? styles.dark__text : styles.white__text}`}>
          Добавить
          <Image src={iconColor === 'dark' ? darkBasket : basket} alt='add in basket' width={16} height={14} />
        </div>
      ) : (
        <div className={`${styles.count__box}`}>
          <div
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              decreaseCount(product.id.toString())
            }}
            className={`${styles.decrease__text}`}
          >
            -
          </div>
          <div className={`${styles.count__inBox}`}>{currentProductInBasket?.countInBasket}</div>
          <div
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
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
