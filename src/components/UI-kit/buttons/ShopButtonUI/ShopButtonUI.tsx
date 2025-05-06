'use client'
import {FC, useEffect, useState} from 'react'
import Image from 'next/image'
import styles from './ShopButtonUI.module.scss'
import {useTypedSelector} from '@/hooks/useTypedSelector'
const basket = '/basket.svg'
const ShopButtonUI: FC = () => {
  const [basketCounter, setBasketCounter] = useState(0)
  const {productsInBasket} = useTypedSelector((state) => state.basket)

  useEffect(() => {
    setBasketCounter(productsInBasket.length)
  }, [productsInBasket])

  return (
    <div className={`${styles.basket__box}`}>
      <div className={`${basketCounter > 9 ? styles.basket_big : ''} ${styles.counter}`}>{basketCounter}</div>
      <Image
        onClick={() => {
          console.log('Click')
        }}
        className={`  ${styles.basket__img}`}
        style={{cursor: 'pointer'}}
        alt='basket image'
        src={basket}
        width={26}
        height={26}
      />
    </div>
  )
}

export default ShopButtonUI
