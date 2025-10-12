import Card from '@/components/UI-kit/elements/card/card'
import {useCurrentLanguage} from '@/hooks/useCurrentLanguage'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import ProductService from '@/services/products/product.service'
import {Product} from '@/services/products/product.types'
import {useTranslations} from 'next-intl'
import {FC, useState, useEffect} from 'react'
import styles from './FavoritesForProfile.module.scss'
const FavoritesForProfile: FC = () => {
  const {productInFavorites} = useTypedSelector((state) => state.favorites)
  const [isClient, setIsClient] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [productsIds, setProductsIds] = useState<number[]>([])
  const [freshProducts, setFreshProducts] = useState<Product[]>([])
  const t = useTranslations('ProfilePage')
  const currentLang = useCurrentLanguage()

  useEffect(() => {
    setIsClient(true)

    const calculateItemsPerPage = () => {
      const containerWidth = window.innerWidth - 80
      const minColWidth = 200
      const gap = 20

      // Рассчитываем количество колонок (минимум 2, максимум 3)
      let columns = Math.floor((containerWidth + gap) / (minColWidth + gap))
      columns = Math.max(2, Math.min(3, columns))

      // Всегда 2 строки × количество колонок
      setItemsPerPage(columns * 2)
    }

    calculateItemsPerPage()
    window.addEventListener('resize', calculateItemsPerPage)

    return () => window.removeEventListener('resize', calculateItemsPerPage)
  }, [])

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
  }, [productsIds, currentLang])

  const totalPages = Math.ceil(freshProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = freshProducts.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({top: 0, behavior: 'smooth'})
    }
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []

    // Первая страница
    pages.push(
      <a
        key={1}
        href='#'
        onClick={(e) => {
          e.preventDefault()
          handlePageChange(1)
        }}
        className={`${styles.exp_pagination__link} ${currentPage === 1 ? styles.exp_pagination__link_active : ''}`}
      >
        1
      </a>
    )

    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    // Многоточие после первой страницы
    if (startPage > 2) {
      pages.push(
        <span key='ellipsis-start' className={styles.exp_pagination__ellipsis}>
          ...
        </span>
      )
    }

    // Страницы в середине
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <a
          key={i}
          href='#'
          onClick={(e) => {
            e.preventDefault()
            handlePageChange(i)
          }}
          className={`${styles.exp_pagination__link} ${currentPage === i ? styles.exp_pagination__link_active : ''}`}
        >
          {i}
        </a>
      )
    }

    // Многоточие перед последней страницей
    if (endPage < totalPages - 1) {
      pages.push(
        <span key='ellipsis-end' className={styles.exp_pagination__ellipsis}>
          ...
        </span>
      )
    }

    // Последняя страница
    if (totalPages > 1) {
      pages.push(
        <a
          key={totalPages}
          href='#'
          onClick={(e) => {
            e.preventDefault()
            handlePageChange(totalPages)
          }}
          className={`${styles.exp_pagination__link} ${
            currentPage === totalPages ? styles.exp_pagination__link_active : ''
          }`}
        >
          {totalPages}
        </a>
      )
    }

    return (
      <div className={styles.justify_content_center}>
        <div className={styles.exp_pagination}>
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(currentPage - 1)
            }}
            className={`${styles.exp_pagination__link} ${styles.exp_pagination__link_prev} ${
              currentPage === 1 ? styles.exp_pagination__link_disabled : ''
            }`}
          />
          {pages}
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(currentPage + 1)
            }}
            className={`${styles.exp_pagination__link} ${styles.exp_pagination__link_next} ${
              currentPage === totalPages ? styles.exp_pagination__link_disabled : ''
            }`}
          />
        </div>
      </div>
    )
  }

  const isEmpty = productInFavorites.length === 0
  const isLoading = productInFavorites.length !== 0 && freshProducts.length === 0

  return (
    <div className={styles.account_tile}>
      {isClient && !isEmpty && (
        <>
          <div className={styles.account_vitrine}>
            <div className={styles.products_grid}>
              {isLoading &&
                productInFavorites.slice(startIndex, endIndex).map((product) => (
                  <div key={product.id} className={styles.product_card_wrapper}>
                    <Card
                      isLoading={true}
                      id={product.id}
                      title={product.title}
                      price={product.originalPrice}
                      discount={product.discount}
                      previewImageUrl={product.previewImageUrl}
                      discountedPrice={product.discountedPrice}
                      deliveryMethod={product.deliveryMethod}
                      fullProduct={product}
                    />
                  </div>
                ))}
              {!isLoading &&
                currentProducts.map((product) => (
                  <div key={product.id} className={styles.product_card_wrapper}>
                    <Card
                      isLoading={false}
                      id={product.id}
                      title={product.title}
                      price={product.originalPrice}
                      discount={product.discount}
                      previewImageUrl={product.previewImageUrl}
                      discountedPrice={product.discountedPrice}
                      deliveryMethod={product.deliveryMethod}
                      fullProduct={product}
                    />
                  </div>
                ))}
            </div>
          </div>
          {renderPagination()}
        </>
      )}
      {isClient && isEmpty && <p className={styles.empty__message}>{t('noFavorites')}</p>}
    </div>
  )
}

export default FavoritesForProfile
