'use client'
import {FC, useState} from 'react'
import Image from 'next/image'
import basket from '@/assets/images/basket.svg'
import styles from './ShopButtonUI.module.scss'

const ShopButtonUI: FC = () => {
  const [basketCounter, setBasketCounter] = useState(0)
  const setCounter = () => {
    setBasketCounter(Number((Math.random() * 50).toFixed(0)))
  }

  return (
    <div className={`${styles.basket__box}`}>
      <div className={`${basketCounter > 9 ? styles.basket_big : ''} ${styles.counter}`}>{basketCounter}</div>
      <Image
        onClick={setCounter}
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
