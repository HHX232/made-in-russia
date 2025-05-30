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

interface CardsCatalogProps {
  initialProducts?: Product[]
  initialHasMore?: boolean
}

const CardsCatalog: FC<CardsCatalogProps> = ({initialProducts = [], initialHasMore = true}) => {
  const priceRange = useSelector((state: TypeRootState) => selectRangeFilter(state, 'priceRange'))
  const {selectedFilters, delivery} = useTypedSelector((state) => state.filters)
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isFiltersChanged, setIsFiltersChanged] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastProductRef = useRef<HTMLDivElement | null>(null)
  const [numericFilters, setNumericFilters] = useState<number[]>([])
  // const {productInFavorites} = useTypedSelector((state) => state.favorites)

  interface PageParams {
    page: number
    size: number
    minPrice?: number
    maxPrice?: number
    categoryIds?: string
    [key: string]: any
  }
  // useEffect(() => {
  //   console.log('productInFavorites', productInFavorites)
  // }, [productInFavorites])

  const [pageParams, setPageParams] = useState<PageParams>({
    page: initialProducts.length > 0 ? 2 : 0,
    size: 10,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    deliveryMethodIds: delivery?.join(',') ? delivery?.join(',') : ''
  })

  useEffect(() => {
    const numericKeys = Object.keys(selectedFilters)
      .filter((key) => !isNaN(Number(key)))
      .map(Number)

    setNumericFilters(numericKeys)
    // console.log('numericFilters обновлен:', numericKeys)
  }, [selectedFilters])

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

    // При изменении фильтров не сбрасываем список продуктов сразу
    // Мы сделаем это после получения новых данных

    // console.log(
    //   'pageParams обновлены с фильтрами категорий:',
    //   numericFilters.length > 0 ? numericFilters.join(',') : 'нет'
    // )
  }, [numericFilters, priceRange, delivery])

  // Эффект для логирования параметров запроса при их изменении
  // useEffect(() => {
  //   console.log('Текущие параметры запроса:', pageParams)
  // }, [pageParams])

  const {data: pageResponse, isLoading, isError, isFetching} = useProducts(pageParams)

  // Используем isFetching для отслеживания любого запроса, включая фоновые
  // const showSkeleton = isLoading || (isFetching && isFiltersChanged)
  const showSkeleton = (isLoading || (isFetching && isFiltersChanged)) && allProducts.length === 0

  useEffect(() => {
    if (pageResponse) {
      // При получении первой страницы (после сброса фильтров), заменяем список
      if (pageParams.page === 0) {
        setAllProducts(pageResponse.content)
        setIsFiltersChanged(false) // Сбрасываем флаг изменения фильтров
      } else {
        // При подгрузке следующих страниц добавляем уникальные товары
        const newProducts = pageResponse.content.filter(
          (newProduct) => !allProducts.some((existingProduct) => existingProduct.id === newProduct.id)
        )
        setAllProducts((prev) => [...prev, ...newProducts])
      }

      setHasMore(!pageResponse.last && pageResponse.content.length > 0)
      // console.log('pageResponse получен:', pageResponse)
      // console.log('Товаров загружено:', pageResponse.content.length)
    }
  }, [pageResponse, pageParams.page])

  // Функция для наблюдения за последним элементом
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (showSkeleton) return

      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      // Сохраняем ссылку на последний элемент
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
    return <div>Error</div>
  }

  // При отображении решаем, что показывать:
  // 1. Если идет загрузка или изменились фильтры и происходит выборка - показываем скелетон
  // 2. Если не загружаем и есть товары - показываем их
  // 3. Если нет товаров и не загружаем - показываем сообщение "Ничего не найдено"

  return (
    <div className={styled.cardsCatalog__box}>
      {!showSkeleton &&
        allProducts.map((product, index) => {
          const uniqueKey = `${product.id}-${index}`
          // Для последнего элемента добавляем ref
          if (index === allProducts.length - 1) {
            return (
              <div key={uniqueKey} ref={lastElementRef}>
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
            )
          } else {
            return (
              <Card
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
              />
            )
          }
        })}

      {showSkeleton && (
        <>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, i) => {
            return (
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
            )
          })}
        </>
      )}

      {!showSkeleton && allProducts.length === 0 && (
        <div className={styled.cardsCatalog__empty}>
          <p>По вашему запросу ничего не найдено</p>
        </div>
      )}
    </div>
  )
}

export default CardsCatalog
