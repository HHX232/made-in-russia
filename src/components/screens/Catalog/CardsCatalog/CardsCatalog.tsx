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
  extraButtonsBoxClass?: string
}
interface PageParams {
  page: number
  size: number
  minPrice?: number
  maxPrice?: number
  categoryIds?: string
  title?: string
  [key: string]: any
}

const CardsCatalog: FC<CardsCatalogProps> = ({
  initialProducts = [],
  initialHasMore = true,
  specialRoute = undefined,
  canCreateNewProduct = false,
  onPreventCardClick,
  extraButtonsBoxClass
}) => {
  const priceRange = useSelector((state: TypeRootState) => selectRangeFilter(state, 'priceRange'))
  const {selectedFilters, delivery, searchTitle} = useTypedSelector((state) => state.filters)

  // Используем Set для хранения ID товаров и отдельный массив для отображения
  const [productIds, setProductIds] = useState<Set<number>>(new Set())
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isFiltersChanged, setIsFiltersChanged] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastProductRef = useRef<HTMLDivElement | null>(null)
  const [numericFilters, setNumericFilters] = useState<number[]>([])
  const {addToLatestViews} = useActions()

  const [pageParams, setPageParams] = useState<PageParams>({
    page: 0, // Всегда начинаем с 0
    size: 10,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    deliveryMethodIds: delivery?.join(',') ? delivery?.join(',') : '',
    title: searchTitle
  })

  const t = useTranslations('HomePage')

  // Функция для добавления товаров с использованием Set
  const addProducts = (newProducts: Product[], replace: boolean = false) => {
    if (replace) {
      // Заменяем все товары
      const newIds = new Set(newProducts.map((p) => p.id))
      setProductIds(newIds)
    } else {
      // Добавляем только уникальные товары
      const currentIds = productIds
      const uniqueProducts = newProducts.filter((product) => !currentIds.has(product.id))

      if (uniqueProducts.length > 0) {
        const newIds = new Set([...currentIds, ...uniqueProducts.map((p) => p.id)])
        setProductIds(newIds)
      }
    }
  }

  // Инициализация с initialProducts
  useEffect(() => {
    if (initialProducts.length > 0) {
      addProducts(initialProducts, true)
      // Устанавливаем следующую страницу для пагинации
      setPageParams((prev) => ({
        ...prev,
        page: 1
      }))
    }
  }, []) // Выполняется только один раз при монтировании

  useEffect(() => {
    const numericKeys = Object.keys(selectedFilters)
      .filter((key) => !isNaN(Number(key)))
      .map(Number)

    setNumericFilters(numericKeys)
  }, [selectedFilters])

  // useEffect для searchTitle
  useEffect(() => {
    setIsFiltersChanged(true)
    // Очищаем все товары при изменении поискового запроса
    setProductIds(new Set())
    setPageParams((prev) => ({
      ...prev,
      page: 0,
      title: searchTitle
    }))
  }, [searchTitle])

  // useEffect для остальных фильтров
  useEffect(() => {
    setIsFiltersChanged(true)
    // Очищаем все товары при изменении фильтров
    setProductIds(new Set())

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

  const {data: pageResponse, isLoading, isError, isFetching, resData} = useProducts(pageParams, specialRoute)

  const showSkeleton = (isLoading || (isFetching && isFiltersChanged)) && (resData || initialProducts).length === 0

  // Основной useEffect для обработки ответов API
  useEffect(() => {
    if (pageResponse) {
      if (isFiltersChanged || pageParams.page === 0) {
        // Если фильтры изменились или это первая страница - заменяем
        addProducts(pageResponse.content, true)
        setIsFiltersChanged(false)
      } else {
        // Иначе добавляем к существующим
        addProducts(pageResponse.content, false)
      }

      setHasMore(!pageResponse.last && pageResponse.content.length > 0)
    }
  }, [pageResponse])

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (showSkeleton) return

      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      lastProductRef.current = node

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setPageParams((prev) => ({
            ...prev,
            page: prev.page + 1
          }))
        }
      })

      if (node) {
        observerRef.current.observe(node)
      }
    },
    [showSkeleton, hasMore, isFetching]
  )

  if (isError) {
    return <div style={{marginBottom: '50px'}}>Еще не опубликовали первый товар</div>
  }

  return (
    <div id='cy-cards-catalog' className={styled.cardsCatalog__box}>
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
        (resData || initialProducts).map((product, index) => {
          const uniqueKey = `${product.id}-${index}`
          if (index === (resData || initialProducts).length - 1) {
            return (
              <div style={{height: '100%', width: '100%'}} key={uniqueKey} ref={lastElementRef}>
                <Card
                  extraButtonsBoxClass={extraButtonsBoxClass}
                  onPreventCardClick={onPreventCardClick}
                  canUpdateProduct={canCreateNewProduct}
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
                extraButtonsBoxClass={extraButtonsBoxClass}
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
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((el, i) => {
            return (
              <Card
                isLoading={true}
                key={`skeleton-${i}`}
                id={el}
                title='Загрузка...'
                price={0}
                discount={0}
                previewImageUrl=''
                discountedPrice={0}
                deliveryMethod={'Самовывоз' as any}
                fullProduct={{} as any}
              />
            )
          })}
        </>
      )}

      {!showSkeleton && (resData || initialProducts).length === 0 && (
        <div className={styled.cardsCatalog__empty}>
          <p>{t('noResultsCatalog')}</p>
        </div>
      )}
    </div>
  )
}

export default CardsCatalog
