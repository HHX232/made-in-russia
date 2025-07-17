/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {FC, useEffect, useState, useRef, useCallback} from 'react'
import styled from './CardsCatalog.module.scss'
import Card from '@/components/UI-kit/elements/card/card'
import {useProducts} from '@/hooks/useProducts'
import {Product} from '@/services/products/product.types'
import {selectRangeFilter} from '@/store/Filters/filters.slice'
import {useSelector} from 'react-redux'
import {TypeRootState} from '@/store/store'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useActions} from '@/hooks/useActions'
import Link from 'next/link'
import {useTranslations} from 'next-intl'

interface CardsCatalogProps {
  initialProducts?: Product[]
  initialHasMore?: boolean
  specialRoute?: string
  canCreateNewProduct?: boolean
  onPreventCardClick?: (item: Product) => void
}

const CardsCatalog: FC<CardsCatalogProps> = ({
  initialProducts = [],
  initialHasMore = true,
  specialRoute = undefined,
  canCreateNewProduct = false,
  onPreventCardClick
}) => {
  const priceRange = useSelector((state: TypeRootState) => selectRangeFilter(state, 'priceRange'))
  const {selectedFilters, delivery, searchTitle} = useTypedSelector((state) => state.filters)
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isFiltersChanged, setIsFiltersChanged] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastProductRef = useRef<HTMLDivElement | null>(null)
  const [numericFilters, setNumericFilters] = useState<number[]>([])
  const {addToLatestViews} = useActions()

  interface PageParams {
    page: number
    size: number
    minPrice?: number
    maxPrice?: number
    categoryIds?: string
    title?: string
    [key: string]: any
  }

  const [pageParams, setPageParams] = useState<PageParams>({
    page: initialProducts.length > 0 ? 2 : 0,
    size: 10,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    deliveryMethodIds: delivery?.join(',') ? delivery?.join(',') : '',
    title: searchTitle
  })
  const t = useTranslations('HomePage')
  useEffect(() => {
    const numericKeys = Object.keys(selectedFilters)
      .filter((key) => !isNaN(Number(key)))
      .map(Number)

    setNumericFilters(numericKeys)
  }, [selectedFilters])

  // Добавляем отдельный useEffect для searchTitle
  useEffect(() => {
    setIsFiltersChanged(true)
    setPageParams((prev) => ({
      ...prev,
      page: 0,
      title: searchTitle
    }))
  }, [searchTitle])

  useEffect(() => {
    // Устанавливаем флаг, что фильтры изменились
    setIsFiltersChanged(true)

    setPageParams((prev) => {
      const newParams: PageParams = {
        ...prev,
        page: 0,
        minPrice: priceRange?.min,
        maxPrice: priceRange?.max,
        deliveryMethodIds: delivery?.join(',') || ''
      }

      if (numericFilters.length > 0) {
        newParams.categoryIds = numericFilters.join(',')
      } else {
        if ('categoryIds' in newParams) {
          delete newParams.categoryIds
        }
      }

      return newParams
    })
  }, [numericFilters, priceRange, delivery])

  const {data: pageResponse, isLoading, isError, isFetching} = useProducts(pageParams, specialRoute)

  const showSkeleton = (isLoading || (isFetching && isFiltersChanged)) && allProducts.length === 0

  // useEffect(() => {
  //   initialProducts.map((item) => {
  //     console.log('item.previewImageUrl', item.previewImageUrl)
  //     if (
  //       item.previewImageUrl.includes('mp4') ||
  //       item.previewImageUrl.includes('mov') ||
  //       item.previewImageUrl.includes('avi')
  //     ) {
  //       console.log('Это ВИДЕО!')
  //     }
  //   })
  // }, [initialProducts])

  useEffect(() => {
    if (pageResponse) {
      if (pageParams.page === 0) {
        setAllProducts((prev) => [...prev, ...pageResponse.content])
        setIsFiltersChanged(false) // Сбрасываем флаг изменения фильтров
      } else {
        // При подгрузке следующих страниц добавляем уникальные товары
        const newProducts = pageResponse.content.filter(
          (newProduct) => !allProducts.some((existingProduct) => existingProduct.id === newProduct.id)
        )
        setAllProducts((prev) => [...prev, ...newProducts])
      }

      setHasMore(!pageResponse.last && pageResponse.content.length > 0)
    }
  }, [pageResponse, pageParams.page])

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (showSkeleton) return

      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      lastProductRef.current = node

      // Создаем новый observer
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageParams((prev) => ({
            ...prev,
            page: prev.page + 1
          }))
        }
      })

      // Начинаем наблюдение за последним элементом
      if (node) {
        observerRef.current.observe(node)
      }
    },
    [showSkeleton, hasMore]
  )

  if (isError) {
    return <div style={{marginBottom: '50px'}}>Еще не опубликовали первый товар</div>
  }

  return (
    <div className={styled.cardsCatalog__box}>
      {canCreateNewProduct && (
        <Link className={`${styled.cardsCatalog__create__link}`} href='/create-card'>
          <div className={`${styled.cardsCatalog__create}`}>
            <div className={`${styled.cardsCatalog__create__image}`}>+</div>
            <div className={`${styled.cardsCatalog__create__text}`}></div>
            <div className={`${styled.cardsCatalog__create__text}`}></div>
            <div className={`${styled.cardsCatalog__create__text}`}></div>
            <div className={`${styled.cardsCatalog__create__button}`}></div>
          </div>
        </Link>
      )}
      {!showSkeleton &&
        allProducts.map((product, index) => {
          const uniqueKey = `${product.id}-${index}`
          // Для последнего элемента добавляем ref
          if (index === allProducts.length - 1) {
            return (
              <div style={{height: '100%', width: '100%'}} key={uniqueKey} ref={lastElementRef}>
                <Card
                  onPreventCardClick={onPreventCardClick}
                  isLoading={false}
                  id={product.id}
                  title={product.title}
                  price={product.originalPrice}
                  discount={product.discount}
                  previewImageUrl={product.previewImageUrl}
                  discountedPrice={product.discountedPrice}
                  deliveryMethod={product.deliveryMethod}
                  fullProduct={product}
                  onClickFunction={() => {
                    addToLatestViews(product)
                  }}
                />
              </div>
            )
          } else {
            return (
              <Card
                onPreventCardClick={onPreventCardClick}
                canUpdateProduct={canCreateNewProduct}
                isLoading={false}
                key={uniqueKey}
                id={product.id}
                title={product.title}
                price={product.originalPrice}
                discount={product.discount}
                previewImageUrl={product.previewImageUrl}
                discountedPrice={product.discountedPrice}
                deliveryMethod={product.deliveryMethod}
                fullProduct={product}
                onClickFunction={() => {
                  addToLatestViews(product)
                }}
              />
            )
          }
        })}

      {showSkeleton && (
        <>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, i) => {
            return (
              <>
                <Card
                  isLoading={true}
                  key={`skeleton-${i}`}
                  id={Math.random()}
                  title='Загрузка...'
                  price={0}
                  discount={0}
                  previewImageUrl=''
                  discountedPrice={0}
                  deliveryMethod={'Самовывоз' as any}
                  fullProduct={{} as any}
                />
              </>
            )
          })}
        </>
      )}

      {!showSkeleton && allProducts.length === 0 && (
        <div className={styled.cardsCatalog__empty}>
          <p>{t('noResultsCatalog')}</p>
        </div>
      )}
    </div>
  )
}

export default CardsCatalog
