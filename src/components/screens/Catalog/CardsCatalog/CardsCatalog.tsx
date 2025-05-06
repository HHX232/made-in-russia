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
  const {selectedFilters} = useTypedSelector((state) => state.filters)
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastProductRef = useRef<HTMLDivElement | null>(null)
  const [numericFilters, setNumericFilters] = useState<number[]>([])

  // Определяем тип для параметров запроса
  interface PageParams {
    page: number
    size: number
    minPrice?: number
    maxPrice?: number
    categoryIds?: string
    [key: string]: any // Для поддержки других динамических свойств
  }

  // Обновление pageParams как объект с поддержкой динамических свойств
  const [pageParams, setPageParams] = useState<PageParams>({
    page: initialProducts.length > 0 ? 2 : 0,
    size: 10,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max
  })

  // Отслеживаем изменения в selectedFilters и обновляем numericFilters
  useEffect(() => {
    // Фильтруем ключи, которые являются числами
    const numericKeys = Object.keys(selectedFilters)
      .filter((key) => !isNaN(Number(key))) // Проверяем, что ключ - число
      .map(Number) // Преобразуем строки в числа

    setNumericFilters(numericKeys)
    console.log('numericFilters обновлен:', numericKeys)
  }, [selectedFilters])

  // Отдельный эффект для обновления параметров запроса при изменении фильтров
  useEffect(() => {
    setPageParams((prev) => {
      // Создаем объект с базовыми параметрами
      const newParams: PageParams = {
        ...prev,
        page: 0, // Сбрасываем пагинацию при изменении фильтров
        minPrice: priceRange?.min,
        maxPrice: priceRange?.max
      }

      // Если есть фильтры по категориям, объединяем их в строку с запятыми
      if (numericFilters.length > 0) {
        newParams.categoryIds = numericFilters.join(',')
      } else {
        // Удаляем параметр categoryId, если фильтры не выбраны
        if ('categoryIds' in newParams) {
          delete newParams.categoryIds
        }
      }

      return newParams
    })

    // Очистим предыдущие результаты при изменении фильтров
    setAllProducts(initialProducts)
    setHasMore(initialHasMore)

    console.log(
      'pageParams обновлены с фильтрами категорий:',
      numericFilters.length > 0 ? numericFilters.join(',') : 'нет'
    )
  }, [numericFilters, priceRange, initialProducts, initialHasMore])

  // Эффект для логирования параметров запроса при их изменении
  useEffect(() => {
    console.log('Текущие параметры запроса:', pageParams)
  }, [pageParams])

  const {data: pageResponse, isLoading, isError} = useProducts(pageParams)

  useEffect(() => {
    if (pageResponse) {
      // При получении первой страницы (после сброса фильтров), заменяем список
      if (pageParams.page === 0) {
        setAllProducts(pageResponse.content)
      } else {
        // При подгрузке следующих страниц добавляем уникальные товары
        const newProducts = pageResponse.content.filter(
          (newProduct) => !allProducts.some((existingProduct) => existingProduct.id === newProduct.id)
        )
        setAllProducts((prev) => [...prev, ...newProducts])
      }

      setHasMore(!pageResponse.last && pageResponse.content.length > 0)
      console.log('pageResponse получен:', pageResponse)
      console.log('Товаров загружено:', pageResponse.content.length)
    }
  }, [pageResponse, pageParams.page])

  // Функция для наблюдения за последним элементом
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return

      // Отключаем предыдущий observer
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      // Сохраняем ссылку на последний элемент
      lastProductRef.current = node

      // Создаем новый observer
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          // Если последний элемент виден и есть еще данные, загружаем следующую страницу
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
    [isLoading, hasMore]
  )

  if (isError) {
    return <div>Error</div>
  }

  return (
    <div className={styled.cardsCatalog__box}>
      {allProducts.map((product, index) => {
        const uniqueKey = `${product.id}-${index}`

        // Для последнего элемента добавляем ref
        if (index === allProducts.length - 1) {
          return (
            <div key={uniqueKey} ref={lastElementRef}>
              <Card
                isLoading={isLoading}
                id={product.id}
                title={product.title}
                price={product.price}
                discount={product.discount}
                imageUrl={product.imageUrl}
                discountedPrice={product.discountedPrice}
                deliveryMethod={product.deliveryMethod}
                fullProduct={product}
              />
            </div>
          )
        } else {
          return (
            <Card
              isLoading={isLoading}
              key={uniqueKey}
              id={product.id}
              title={product.title}
              price={product.price}
              discount={product.discount}
              imageUrl={product.imageUrl}
              discountedPrice={product.discountedPrice}
              deliveryMethod={product.deliveryMethod}
              fullProduct={product}
            />
          )
        }
      })}
      {isLoading && (
        <>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, i) => {
            return (
              <Card
                isLoading={isLoading}
                key={`skeleton-${i}`}
                id={Math.random()}
                title='Загрузка...'
                price={0}
                discount={0}
                imageUrl=''
                discountedPrice={0}
                deliveryMethod={'Самовывоз' as any}
                fullProduct={{} as any}
              />
            )
          })}
        </>
      )}
    </div>
  )
}

export default CardsCatalog
