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
import {getAccessToken} from '@/services/auth/auth.helper'
import DropList from '@/components/UI-kit/Texts/DropList/DropList'

interface CardsCatalogProps {
  initialProducts?: Product[]
  initialHasMore?: boolean
  specialRoute?: string
  canCreateNewProduct?: boolean
  onPreventCardClick?: (item: Product) => void
  extraButtonsBoxClass?: string
  approveStatuses?: 'APPROVED' | 'PENDING' | 'ALL'
  direction?: 'asc' | 'desc'
  isForAdmin?: boolean
}
interface PageParams {
  page: number
  size: number
  minPrice?: number
  maxPrice?: number
  categoryIds?: string
  title?: string
  approveStatuses?: 'APPROVED' | 'PENDING' | 'ALL' | ''
  direction?: 'asc' | 'desc'

  [key: string]: any
}

const CardsCatalog: FC<CardsCatalogProps> = ({
  initialProducts = [],
  initialHasMore = true,
  specialRoute = undefined,
  canCreateNewProduct = false,
  onPreventCardClick,
  extraButtonsBoxClass,
  isForAdmin = false,
  direction = 'desc',
  approveStatuses = 'ALL'
}) => {
  const priceRange = useSelector((state: TypeRootState) => selectRangeFilter(state, 'priceRange'))
  const {selectedFilters, delivery, searchTitle} = useTypedSelector((state) => state.filters)

  // Используем Set для хранения ID товаров и отдельный массив для отображения
  const [productIds, setProductIds] = useState<Set<number>>(new Set())
  const [hasMore, setHasMore] = useState(initialHasMore)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastProductRef = useRef<HTMLDivElement | null>(null)
  const [numericFilters, setNumericFilters] = useState<number[]>([])
  const {addToLatestViews} = useActions()
  const accessToken = getAccessToken()
  const [pageParams, setPageParams] = useState<PageParams>({
    page: 0, // Всегда начинаем с 0
    size: 10,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    deliveryMethodIds: delivery?.join(',') ? delivery?.join(',') : '',
    title: searchTitle,
    sort: 'creationDate',
    direction: direction || 'asc',
    approveStatuses: approveStatuses === 'ALL' ? '' : approveStatuses
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
    // Очищаем все товары при изменении поискового запроса
    setProductIds(new Set())
    setPageParams((prev) => ({
      ...prev,
      page: 0,
      title: searchTitle
    }))
  }, [searchTitle])

  // useEffect для остальных фильтров (исключая admin-специфичные параметры)
  useEffect(() => {
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

  // Отдельный useEffect для admin-специфичных параметров
  useEffect(() => {
    if (isForAdmin) {
      // Очищаем товары при изменении admin параметров
      setProductIds(new Set())
      setPageParams((prev) => ({
        ...prev,
        page: 0,
        approveStatuses: approveStatuses === 'ALL' ? '' : approveStatuses
      }))
    }
  }, [approveStatuses, isForAdmin])

  // Отдельный useEffect для direction
  useEffect(() => {
    if (isForAdmin) {
      // Очищаем товары при изменении направления сортировки
      setProductIds(new Set())
      setPageParams((prev) => ({
        ...prev,
        page: 0,
        direction: direction
      }))
    }
  }, [direction, isForAdmin])

  const {
    data: pageResponse,
    isLoading,
    isError,
    isFetching,
    resData
  } = useProducts(pageParams, () => setPageParams({...pageParams, page: 0}), specialRoute, accessToken || '')

  const showSkeleton = isLoading && resData.length === 0

  useEffect(() => {
    console.log('resData', resData)
  }, [resData])

  // Основной useEffect для обработки ответов API
  useEffect(() => {
    if (pageResponse) {
      if (pageParams.page === 0) {
        // Если это первая страница - заменяем
        addProducts(pageResponse.content, true)
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
    return <div style={{marginBottom: '50px'}}>Not found</div>
  }

  return (
    <div id='cy-cards-catalog' className={styled.cardsCatalog__box}>
      {isForAdmin && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '200px',
            justifyContent: 'space-evenly',
            background: 'white',
            borderRadius: '20px',
            padding: '10px 30px'
          }}
        >
          <DropList
            extraClass={styled.dropList__box__extra__index}
            title={
              pageParams.approveStatuses === '' || pageParams.approveStatuses === 'ALL'
                ? 'Все'
                : pageParams.approveStatuses === 'APPROVED'
                  ? 'Одобрено'
                  : 'Ожидает'
            }
            items={[
              <p
                key='all'
                onClick={() => {
                  setPageParams((prev) => {
                    return {...prev, page: 0, approveStatuses: ''}
                  })
                  setProductIds(new Set())
                }}
              >
                Все
              </p>,
              <p
                key='approved'
                onClick={() => {
                  setPageParams((prev) => {
                    return {...prev, page: 0, approveStatuses: 'APPROVED'}
                  })
                  setProductIds(new Set())
                }}
              >
                APPROVED
              </p>,
              <p
                key='pending'
                onClick={() => {
                  setPageParams((prev) => {
                    return {...prev, page: 0, approveStatuses: 'PENDING'}
                  })
                  setProductIds(new Set())
                }}
              >
                PENDING
              </p>
            ]}
          />
          <DropList
            title={pageParams.direction === 'asc' ? 'По возрастанию' : 'По убыванию'}
            items={[
              <p
                onClick={() => {
                  setPageParams((prev) => {
                    return {...prev, page: 0, direction: 'desc'}
                  })
                  setProductIds(new Set())
                }}
                key='desc'
              >
                С начала
              </p>,
              <p
                onClick={() => {
                  setPageParams((prev) => {
                    return {...prev, page: 0, direction: 'asc'}
                  })
                  setProductIds(new Set())
                }}
                key='asc'
              >
                С конца
              </p>
            ]}
          />
        </div>
      )}
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
        resData.map((product, index) => {
          const uniqueKey = `${product.id}-${index}`
          if (index === resData.length - 1) {
            return (
              <div style={{height: '100%', width: '100%'}} key={uniqueKey} ref={lastElementRef}>
                <Card
                  isForAdmin={isForAdmin}
                  approveStatus={product?.approveStatus}
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
                isForAdmin={isForAdmin}
                approveStatus={product?.approveStatus}
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

      {!showSkeleton && resData.length === 0 && (
        <div className={styled.cardsCatalog__empty}>
          <p>{t('noResultsCatalog')}</p>
        </div>
      )}
      {isForAdmin && (
        <button onClick={() => setPageParams((prev) => ({...prev, page: prev.page + 1}))}>Показать еще</button>
      )}
    </div>
  )
}

export default CardsCatalog
