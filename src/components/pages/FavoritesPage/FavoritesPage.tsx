'use client'
import {FC, useEffect, useRef, useState} from 'react'
import styles from './FavoritesPage.module.scss'
import Header from '@/components/MainComponents/Header/Header'
import Footer from '@/components/MainComponents/Footer/Footer'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import Card from '@/components/UI-kit/elements/card/card'
import ProductService from '@/services/products/product.service'
import {Product} from '@/services/products/product.types'
import {useTranslations} from 'next-intl'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
const FavoritesPage: FC = () => {
  const {productInFavorites} = useTypedSelector((state) => state.favorites)
  const [productsIds, setProductsIds] = useState<number[]>([])
  const [freshProducts, setFreshProducts] = useState<Product[]>([])
  const headerRef = useRef<HTMLDivElement>(null)
  const headerHeight = headerRef.current?.offsetHeight
  const footerRef = useRef<HTMLDivElement>(null)
  const footerHeight = footerRef.current?.offsetHeight
  const t = useTranslations('Favorites')
  const currentLang = useCurrentLanguage()
  useEffect(() => {
    const ids = productInFavorites.map((product) => product.id)
    setProductsIds(ids)
  }, [productInFavorites])

  useEffect(() => {
    const fetchProducts = async () => {
      if (productsIds.length === 0) {
        setFreshProducts([])
        return
      }
      try {
        const products = await ProductService.getByIds(productsIds, currentLang)
        setFreshProducts(products)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }
    fetchProducts()
  }, [productsIds])

  return (
    <div className={styles.favorites__page}>
      <div ref={headerRef}>
        <Header />
      </div>
      <div
        style={{minHeight: `calc(100vh - ${headerHeight}px - ${footerHeight}px - 40px)`}}
        className={`container ${styles.fav__box}`}
      >
        <h1 className={styles.fav__title}>{t('title')}</h1>
        <div className={styles.fav__cards}>
          {freshProducts.length != 0 &&
            freshProducts.map((product) => (
              <Card
                id={product.id}
                key={product.id}
                title={product.title}
                price={product.originalPrice}
                discount={product.discount}
                previewImageUrl={product.previewImageUrl}
                discountedPrice={product.discountedPrice}
                deliveryMethod={product.deliveryMethod}
                fullProduct={product}
              />
            ))}
          {productInFavorites.length === 0 && <p>{t('noFavorites')}</p>}
          {productInFavorites.length !== 0 &&
            freshProducts.length === 0 &&
            productInFavorites.map((product) => (
              <Card
                isLoading
                id={product.id}
                key={product.id}
                title={product.title}
                price={product.originalPrice}
                discount={product.discount}
                previewImageUrl={product.previewImageUrl}
                discountedPrice={product.discountedPrice}
                deliveryMethod={product.deliveryMethod}
                fullProduct={product}
              />
            ))}
        </div>
      </div>
      <div
        style={{
          position: productInFavorites.length === 0 ? 'fixed' : 'static',
          bottom: productInFavorites.length === 0 ? '0' : 'auto'
        }}
        ref={footerRef}
      >
        <Footer />
      </div>
    </div>
  )
}

export default FavoritesPage
