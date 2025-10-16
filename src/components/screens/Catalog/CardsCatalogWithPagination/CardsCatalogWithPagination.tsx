/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {FC, useEffect, useState, useRef, useCallback, useMemo} from 'react'
import styled from './CardsCatalogWithPagination.module.scss'
import Card from '@/components/UI-kit/elements/card/card'
import {Product} from '@/services/products/product.types'
import {selectRangeFilter} from '@/store/Filters/filters.slice'
import {useSelector} from 'react-redux'
import {TypeRootState} from '@/store/store'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useActions} from '@/hooks/useActions'
import {getAccessToken} from '@/services/auth/auth.helper'
import Link from 'next/link'
import useProductsWithPagination from './useProductsWithPagination'
import Image from 'next/image'

interface CardsCatalogWithPaginationProps {
  initialProducts?: Product[]
  initialTotalPages?: number
  initialCurrentPage?: number
  specialRoute?: string
  canCreateNewProduct?: boolean
  sortField?: string
  onPreventCardClick?: (item: Product) => void
  extraButtonsBoxClass?: string
  approveStatuses?: 'APPROVED' | 'PENDING' | 'ALL'
  direction?: 'asc' | 'desc'
  isForAdmin?: boolean
  pageSize?: number
  specialFilters?: {name: string; id: string}[]
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
  deliveryMethodIds?: string
  sort?: string
  [key: string]: any
}

const DEFAULT_PAGE_SIZE = 9

const CardsCatalogWithPagination: FC<CardsCatalogWithPaginationProps> = ({
  initialProducts = [],
  specialRoute = undefined,
  canCreateNewProduct = false,
  onPreventCardClick,
  extraButtonsBoxClass,
  isForAdmin = false,
  direction = 'desc',
  sortField = 'creationDate',
  approveStatuses = 'ALL',
  pageSize = DEFAULT_PAGE_SIZE,
  specialFilters = [
    {name: '1 hello test', id: '1'},
    {name: '2 hello test', id: '2'},
    {name: '3 hello test', id: '3'},
    {name: '4 hello test', id: '4'},
    {name: '5 hello test', id: '5'},
    {name: '6 hello test', id: '6'},
    {name: '7 hello test', id: '7'},
    {name: '8 hello test', id: '8'},
    {name: '9 hello test', id: '9'}
  ]
}) => {
  // console.log('🎯 CardsCatalogWithPagination: Component render')

  // Селекторы и состояния
  const priceRange = useSelector((state: TypeRootState) => selectRangeFilter(state, 'priceRange'))
  const {selectedFilters, delivery, searchTitle} = useTypedSelector((state) => state.filters)
  const {addToLatestViews, setFilter} = useActions()
  const accessToken = getAccessToken()
  const filtersContainerRef = useRef<HTMLDivElement>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const updateFiltersWidth = () => {
      if (filtersContainerRef.current && gridContainerRef.current) {
        const gridWidth = gridContainerRef.current.getBoundingClientRect().width
        filtersContainerRef.current.style.maxWidth = `${gridWidth}px`
        // console.log('📏 Filters width updated:', gridWidth)
      }
    }

    // Используем ResizeObserver для отслеживания изменений размера грида
    const resizeObserver = new ResizeObserver(() => {
      updateFiltersWidth()
    })

    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current)
    }

    // Также обновляем при первом рендере
    updateFiltersWidth()

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Состояния
  const [numericFilters, setNumericFilters] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const isFirstRender = useRef(true)
  const catalogRef = useRef<HTMLDivElement>(null)

  // Параметры пагинации
  const [pageParams, setPageParams] = useState<PageParams>({
    page: 0,
    size: pageSize,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    deliveryMethodIds: delivery?.join(',') || '',
    title: searchTitle,
    sort: sortField || 'creationDate',
    direction: direction,
    approveStatuses: approveStatuses === 'ALL' ? '' : approveStatuses
  })
  useEffect(() => {
    setPageParams((prev) => ({
      ...prev,
      sort: sortField,
      direction: direction
    }))
  }, [direction, sortField])

  // console.log('📄 Current page params:', pageParams)

  // Загрузка продуктов
  const {
    data: pageResponse,
    products,
    isLoading,
    isError,
    isFetching
  } = useProductsWithPagination(pageParams, undefined, specialRoute, accessToken || undefined)

  // console.log('📦 Products state:', {
  //   productsOnPage: products.length,
  //   isLoading,
  //   isFetching,
  //   currentPage: pageParams.page,
  //   totalPages: pageResponse?.totalPages || 0
  // })

  useEffect(() => {
    console.log('products in catalog', products)
    // originalPrice
    // creationDate
  }, [products])
  // Мемоизированные данные
  const showSkeleton = useMemo(() => {
    const result = isLoading && products.length === 0
    // console.log('💀 Show skeleton:', result)
    return result
  }, [isLoading, products.length])

  // Общее количество страниц
  const totalPages = pageResponse?.totalPages || 0

  // Инициализация начальных продуктов
  useEffect(() => {
    if (initialProducts.length > 0 && isFirstRender.current) {
      // console.log('🎬 Initial products loaded:', initialProducts.length)
      isFirstRender.current = false
    }
  }, [initialProducts])

  // Обработка числовых фильтров
  useEffect(() => {
    const numericKeys = Object.keys(selectedFilters)
      .filter((key) => !isNaN(Number(key)))
      .map(Number)
    // console.log('🔢 Numeric filters updated:', numericKeys)
    setNumericFilters(numericKeys)
  }, [selectedFilters])

  // Сброс при изменении поискового запроса
  useEffect(() => {
    // console.log('🔍 Search title changed:', searchTitle)
    setCurrentPage(0)
    setPageParams((prev) => ({
      ...prev,
      page: 0,
      title: searchTitle
    }))
  }, [searchTitle])

  // Сброс при изменении фильтров
  useEffect(() => {
    // console.log('🎛️ Filters changed:', {numericFilters, priceRange, delivery})
    setCurrentPage(0)
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
        delete newParams.categoryIds
      }

      return newParams
    })
  }, [numericFilters, priceRange, delivery])

  // Сброс для админки при изменении статусов
  useEffect(() => {
    if (isForAdmin) {
      // console.log('👨‍💼 Admin approve status changed:', approveStatuses)
      setCurrentPage(0)
      setPageParams((prev) => ({
        ...prev,
        page: 0,
        approveStatuses: approveStatuses === 'ALL' ? '' : approveStatuses
      }))
    }
  }, [approveStatuses, isForAdmin])

  // Сброс для админки при изменении направления
  useEffect(() => {
    if (isForAdmin) {
      // console.log('🔀 Admin direction changed:', direction)
      setCurrentPage(0)
      setPageParams((prev) => ({
        ...prev,
        page: 0,
        direction: direction
      }))
    }
  }, [direction, isForAdmin])

  // Генерация массива номеров страниц для пагинации
  const getPageNumbers = useCallback(() => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      // Показываем все страницы
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Сложная логика с многоточием
      const current = currentPage + 1 // Преобразуем в 1-based индекс

      if (current <= 4) {
        // Начало
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (current >= totalPages - 3) {
        // Конец
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Середина
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }, [currentPage, totalPages])

  const pageNumbers = useMemo(() => getPageNumbers(), [getPageNumbers])

  // Обработчик смены страницы
  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 0 || page >= totalPages || page === currentPage) return

      // console.log('📄 Page change:', currentPage, '->', page)
      setCurrentPage(page)
      setPageParams((prev) => ({
        ...prev,
        page: page
      }))

      // Скролл к началу каталога
      if (catalogRef.current) {
        const offsetTop = catalogRef.current.offsetTop - 100
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        })
      }
    },
    [currentPage, totalPages]
  )

  // Обработчики навигации
  const handlePrevClick = useCallback(() => {
    // console.log('⬅️ Previous page clicked')
    if (currentPage > 0) {
      handlePageChange(currentPage - 1)
    }
  }, [currentPage, handlePageChange])

  const handleNextClick = useCallback(() => {
    // console.log('➡️ Next page clicked')
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1)
    }
  }, [currentPage, totalPages, handlePageChange])

  if (isError) {
    console.error('❌ Error loading products')
    return <div style={{marginBottom: '50px'}}>Not found</div>
  }

  return (
    <section className={`section ${styled.catalog}`} ref={catalogRef}>
      <div>
        {/* Заголовок */}

        {/* Сетка товаров */}
        <div className={`${styled.catalog__vitrine}`}>
          <div ref={gridContainerRef} className={styled.vitrine__grid}>
            {!!specialFilters && specialFilters?.length !== 0 && (
              <div className={`${styled.section_flexheader}`}>
                <div ref={filtersContainerRef} className={styled.filters_scroll_container}>
                  <ul className={styled.absolute__list}>
                    {specialFilters?.map((filter) => {
                      const isActive = Object.keys(selectedFilters).includes(filter.id)
                      return (
                        <li
                          style={{cursor: 'pointer'}}
                          onClick={() => {
                            setFilter({filterName: filter.id, checked: !isActive})
                          }}
                          key={filter.id}
                          className={`${styled.section_flexheader__title} ${
                            isActive ? styled.section_flexheader__title__active : ''
                          }`}
                        >
                          {filter.name}
                        </li>
                      )
                    })}
                    {!!specialFilters && specialFilters?.length !== 0 && (
                      <div
                        style={{backgroundColor: 'transparent', minWidth: '65px', height: '10px'}}
                        className=''
                      ></div>
                    )}
                  </ul>
                </div>
              </div>
            )}
            {showSkeleton
              ? // Скелетоны при загрузке
                Array.from({length: pageSize}).map((_, index) => (
                  <div key={`skeleton-${index}`} className={styled.card_wrapper}>
                    <Card
                      isForAdmin={isForAdmin}
                      approveStatus={'PENDING'}
                      extraButtonsBoxClass={extraButtonsBoxClass}
                      onPreventCardClick={onPreventCardClick}
                      canUpdateProduct={canCreateNewProduct}
                      isLoading={true}
                      id={-1}
                      title={''}
                      price={-1}
                      discount={-1}
                      previewImageUrl={''}
                      discountedPrice={-1}
                      deliveryMethod={{} as any}
                      fullProduct={null as any}
                    />
                  </div>
                ))
              : // Реальные карточки товаров
                products.map((product) => (
                  <div className={styled.card_wrapper} key={product.id}>
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
                ))}
          </div>
        </div>

        {/* Пагинация */}
        {!showSkeleton && totalPages > 1 && (
          <div className={styled.catalog__pagination}>
            <div className={styled.exp_pagination}>
              {/* Кнопка "Назад" */}
              <button
                onClick={handlePrevClick}
                disabled={currentPage === 0}
                className={`${styled.exp_pagination__link} ${styled.exp_pagination__link_prev} ${
                  currentPage === 0 ? styled.exp_pagination__link_disabled : ''
                }`}
                aria-label='Предыдущая страница'
              >
                <Image
                  style={{transform: 'rotate(180deg)'}}
                  width={24}
                  height={24}
                  alt='prev button'
                  src={'/iconsNew/arrow-right-def.svg'}
                />
              </button>

              {/* Номера страниц */}
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className={styled.exp_pagination__ellipsis}>
                      ...
                    </span>
                  )
                }

                const pageNum = page as number
                const isActive = pageNum - 1 === currentPage

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum - 1)}
                    className={`${styled.exp_pagination__link} ${isActive ? styled.exp_pagination__link_active : ''}`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              {/* Кнопка "Вперед" */}
              <button
                onClick={handleNextClick}
                disabled={currentPage === totalPages - 1}
                className={`${styled.exp_pagination__link} ${styled.exp_pagination__link_next} ${
                  currentPage === totalPages - 1 ? styled.exp_pagination__link_disabled : ''
                }`}
                aria-label='Следующая страница'
              >
                <Image width={24} height={24} alt='next button' src={'/iconsNew/arrow-right-def.svg'} />
              </button>
            </div>
          </div>
        )}

        {/* Индикатор загрузки */}
        {isFetching && !showSkeleton && (
          <div className={styled.loading_indicator}>
            <div className={styled.loading_spinner} />
            <span>Загрузка товаров...</span>
          </div>
        )}

        {/* Мобильная кнопка */}
        <div
          className={`${styled.catalog__header_group} ${styled.catalog__header_group__for_unvis}`}
          id='catalog-header-group-mobile'
        >
          <Link href='#' className={`${styled.btn_accent} ${styled.btn_accent_bottom}`}>
            Смотреть все
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CardsCatalogWithPagination
