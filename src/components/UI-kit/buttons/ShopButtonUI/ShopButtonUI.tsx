'use client'
import {FC, useEffect, useState} from 'react'
import styles from './ShopButtonUI.module.scss'
import {useTypedSelector} from '@/hooks/useTypedSelector'

interface ShopButtonUIProps {
  extraClass?: string
  svgColor?: string
}

const ShopButtonUI: FC<ShopButtonUIProps> = ({extraClass = '', svgColor = 'white'}) => {
  const [basketCounter, setBasketCounter] = useState(0)
  const {productsInBasket} = useTypedSelector((state) => state.basket)

  useEffect(() => {
    setBasketCounter(productsInBasket.length)
  }, [productsInBasket])

  return (
    <div className={`${styles.basket__box} ${extraClass}`}>
      {basketCounter > 0 && (
        <div className={`${basketCounter > 9 ? styles.basket_big : ''} ${styles.counter}`}>{basketCounter}</div>
      )}
      <svg
        onClick={() => console.log('Click')}
        className={styles.basket__img}
        style={{cursor: 'pointer'}}
        width='26'
        height='26'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M5 10L6.36 18.164C6.39885 18.3977 6.51938 18.61 6.70014 18.7631C6.88089 18.9162 7.11012 19.0001 7.347 19H16.653C16.8897 18.9999 17.1187 18.9158 17.2992 18.7627C17.4798 18.6097 17.6002 18.3975 17.639 18.164L19 10M5 10H8M5 10H4M19 10H16M19 10H20M8 10L9 5M8 10H16M16 10L15 5M9 14V15M15 14V15M12 14V15'
          stroke={svgColor}
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  )
}

export default ShopButtonUI
