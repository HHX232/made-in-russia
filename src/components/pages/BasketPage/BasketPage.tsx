'use client'
import Header from '@/components/MainComponents/Header/Header'
import {FC, useEffect, useState, useRef} from 'react'
import styles from './BasketPage.module.scss'
import BasketCard from '@/components/UI-kit/elements/BasketCard/BasketCard'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useActions} from '@/hooks/useActions'
import Footer from '@/components/MainComponents/Footer/Footer'
import {createPriceWithDot} from '@/utils/createPriceWithDot'

const BasketPage: FC = () => {
  const {productsInBasket, basketIsEmpty} = useTypedSelector((state) => state.basket)
  const {productInFavorites} = useTypedSelector((state) => state.favorites)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [favorites, setFavorites] = useState<string[]>([])
  const [totalPrice, setTotalPrice] = useState<number>(0)
  const [totalDiscount, setTotalDiscount] = useState<number>(0)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(true)
  const statusRef = useRef<HTMLDivElement>(null)
  const {toggleToFavorites} = useActions()

  useEffect(() => {
    // Логика для избранного
    const favArray = productInFavorites.filter((product) =>
      productsInBasket.some((basketProduct) => basketProduct.id === product.id)
    )
    setFavorites(favArray.map((product) => product.id.toString()))
  }, [productsInBasket, productInFavorites])

  // Вычисляем суммы при изменении корзины (включая countInBasket)
  useEffect(() => {
    const priceSum = productsInBasket.reduce(
      (acc, product) => acc + product.originalPrice * (product.countInBasket || 1),
      0
    )
    const discountSum = productsInBasket.reduce(
      (acc, product) => acc + (product.discountedPrice || 0) * (product.countInBasket || 1),
      0
    )
    const itemsCount = productsInBasket.reduce((acc, product) => acc + (product.countInBasket || 1), 0)

    setTotalPrice(priceSum)
    setTotalDiscount(priceSum - discountSum)
    setTotalItems(itemsCount)
  }, [JSON.stringify(productsInBasket)])

  // Наблюдаем за скроллом и позицией basket__status
  useEffect(() => {
    const handleScroll = () => {
      if (statusRef.current) {
        const statusRect = statusRef.current.getBoundingClientRect()
        // Если верхняя часть блока статуса видна на экране, скрываем мобильное меню
        if (statusRect.top < window.innerHeight && statusRect.bottom > 0) {
          setShowMobileMenu(false)
        } else {
          setShowMobileMenu(true)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    // Запускаем проверку при монтировании компонента
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div>
      <Header />
      <div className='container'>
        <h1 className={styles.basket__title}>Корзина</h1>
        <div className={styles.basket__content}>
          <ul className={styles.basket__list}>
            {basketIsEmpty ? (
              <li>Корзина пуста</li>
            ) : (
              productsInBasket.map((product) => (
                <BasketCard
                  onFavClick={() => {
                    toggleToFavorites(product)
                  }}
                  key={product.id}
                  product={product}
                />
              ))
            )}
          </ul>
          <div className={styles.basket__status} ref={statusRef}>
            <div className={`${styles.status__title__box}`}>
              <h2 className={`${styles.basket__status__title}`}>Ваша корзина</h2>
              <div className={`${styles.status__title__count}`}>
                <div className={`${styles.status__elements}`}>{`${productsInBasket.length} товаров `}</div>
                <div className={`${styles.line}`}></div>
                <div className={`${styles.status__elements__count}`}>{`${totalItems} шт.`}</div>
              </div>
            </div>
            <div className={`${styles.count__and__price}`}>
              <div className={`${styles.count__text}`}>{`Товары (${productsInBasket.length})`}</div>
              <div className={`${styles.count__price}`}>{createPriceWithDot(totalPrice.toString())} RUB</div>
            </div>
            <div className={`${styles.sell__box}`}>
              <div className={`${styles.sel__text}`}>Скидка</div>
              <div className={`${styles.sel__value}`}>{`- ${createPriceWithDot(totalDiscount.toString())} RUB`}</div>
            </div>
            <div className={`${styles.promo__box}`}>
              <div className={`${styles.promo__text}`}>Введите промокод</div>
              <label className={`${styles.promo__label}`} htmlFor='input123'>
                <input className={`${styles.promo__input}`} id='input123'></input>
              </label>
            </div>
            <div className={`${styles.delivery__box}`}>
              <div className={`${styles.delivery__text}`}>Способ доставки:</div>
              <div className={`${styles.delivery__value}`}>Доставка, Самовывоз</div>
            </div>
            <div className={styles.result__box}>
              <div className={styles.result__title}>Итог</div>
              <div className={styles.result__val}>
                {createPriceWithDot((totalPrice - totalDiscount).toString())} RUB
              </div>
            </div>
            <button className={`${styles.by__button}`}>Перейти к оформлению</button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {!basketIsEmpty && showMobileMenu && (
        <div className={styles.mobile__menu}>
          <div className={styles.mobile__menu__info}>
            <div className={styles.mobile__menu__count}>{`${totalItems} шт.`}</div>
            <div className={styles.mobile__menu__price}>
              {createPriceWithDot((totalPrice - totalDiscount).toString())} RUB
            </div>
          </div>
          <button className={styles.mobile__menu__button}>Оформить</button>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default BasketPage
