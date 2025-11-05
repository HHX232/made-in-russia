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
import useProductsWithPagination from './useProductsWithPagination'
import Image from 'next/image'
import {useTranslations} from 'next-intl'
import useWindowWidth from '@/hooks/useWindoWidth'

interface CardsCatalogWithPaginationProps {
  initialProducts?: Product[]
  initialTotalPages?: number
  initialCurrentPage?: number
  specialRoute?: string
  canCreateNewProduct?: boolean
  sortField?: string
  onPreventCardClick?: (item: Product) => void
  extraButtonsBoxClass?: string
  approveStatuses?: 'APPROVED' | 'PENDING' | 'ALL' | '' | 'REJECTED'
  direction?: 'asc' | 'desc'
  showTableFilters?: boolean
  showSearchFilters?: boolean
  isForAdmin?: boolean
  pageSize?: number
  specialFilters?: {name: string; id: string}[]
  showAdminStatusFilters?: boolean
  onApproveStatusChange?: (status: 'APPROVED' | 'PENDING' | 'ALL' | 'REJECTED') => void
}

interface PageParams {
  page: number
  size: number
  minPrice?: number
  maxPrice?: number
  categoryIds?: string
  title?: string
  approveStatuses?: 'APPROVED' | 'PENDING' | 'ALL' | '' | 'REJECTED'
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
  showTableFilters = true,
  specialFilters,
  showAdminStatusFilters = false,
  onApproveStatusChange
}) => {
  const t = useTranslations('CardsCatalogWithPagination')
  const windowWidth = useWindowWidth()

  // Динамическое определение размера страницы в зависимости от ширины экрана
  const dynamicPageSize = useMemo(() => {
    if (!windowWidth) return pageSize

    // >1200 = 9 товаров, <=1200 = 10 товаров
    if (windowWidth > 1200) {
      return 9
    } else {
      return 10
    }
  }, [windowWidth, pageSize])

  // Селекторы и состояния
  const priceRange = useSelector((state: TypeRootState) => selectRangeFilter(state, 'priceRange'))
  const {selectedFilters, delivery, searchTitle} = useTypedSelector((state) => state.filters)
  const {addToLatestViews, setFilter} = useActions()
  const accessToken = getAccessToken()
  const filtersContainerRef = useRef<HTMLDivElement>(null)
  const gridContainerRef = useRef<HTMLDivElement>(null)

  // Локальное состояние для статуса
  const [localApproveStatus, setLocalApproveStatus] = useState<'APPROVED' | 'PENDING' | 'ALL' | '' | 'REJECTED'>(
    approveStatuses
  )
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const statusDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateFiltersWidth = () => {
      if (filtersContainerRef.current && gridContainerRef.current) {
        const gridWidth = gridContainerRef.current.getBoundingClientRect().width
        filtersContainerRef.current.style.maxWidth = `${gridWidth}px`
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      updateFiltersWidth()
    })

    if (gridContainerRef.current) {
      resizeObserver.observe(gridContainerRef.current)
    }

    updateFiltersWidth()

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
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
    size: dynamicPageSize,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    deliveryMethodIds: delivery?.join(',') || '',
    title: searchTitle,
    sort: sortField || 'creationDate',
    direction: direction,
    approveStatuses: localApproveStatus === 'ALL' ? '' : localApproveStatus
  })

  // Обновляем размер страницы при изменении ширины экрана
  useEffect(() => {
    setPageParams((prev) => ({
      ...prev,
      size: dynamicPageSize
    }))
  }, [dynamicPageSize])

  useEffect(() => {
    setPageParams((prev) => ({
      ...prev,
      sort: sortField,
      direction: direction
    }))
  }, [direction, sortField])

  // Загрузка продуктов
  const {
    data: pageResponse,
    products,
    isLoading,
    isError,
    isFetching
  } = useProductsWithPagination(pageParams, undefined, specialRoute, accessToken || undefined)

  useEffect(() => {
    console.log('products in catalog', products)
  }, [products])

  // Мемоизированные данные
  const showSkeleton = useMemo(() => {
    const result = isLoading && products.length === 0
    return result
  }, [isLoading, products.length])

  // Общее количество страниц
  const totalPages = pageResponse?.totalPages || 0

  // Инициализация начальных продуктов
  useEffect(() => {
    if (initialProducts.length > 0 && isFirstRender.current) {
      isFirstRender.current = false
    }
  }, [initialProducts])

  // Обработка числовых фильтров
  useEffect(() => {
    const numericKeys = Object.keys(selectedFilters)
      .filter((key) => !isNaN(Number(key)))
      .map(Number)
    setNumericFilters(numericKeys)
  }, [selectedFilters])

  // Сброс при изменении поискового запроса
  useEffect(() => {
    setCurrentPage(0)
    setPageParams((prev) => ({
      ...prev,
      page: 0,
      title: searchTitle
    }))
  }, [searchTitle])

  // Сброс при изменении фильтров
  useEffect(() => {
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
      setCurrentPage(0)
      setPageParams((prev) => ({
        ...prev,
        page: 0,
        approveStatuses: localApproveStatus === 'ALL' ? '' : localApproveStatus
      }))
    }
  }, [localApproveStatus, isForAdmin])

  // Сброс для админки при изменении направления
  useEffect(() => {
    if (isForAdmin) {
      setCurrentPage(0)
      setPageParams((prev) => ({
        ...prev,
        page: 0,
        direction: direction
      }))
    }
  }, [direction, isForAdmin])

  // Обработчик изменения статуса
  const handleStatusChange = useCallback(
    (status: 'APPROVED' | 'PENDING' | 'ALL') => {
      setLocalApproveStatus(status)
      setIsStatusDropdownOpen(false)
      if (onApproveStatusChange) {
        onApproveStatusChange(status)
      }
    },
    [onApproveStatusChange]
  )

  // Генерация массива номеров страниц для пагинации
  const getPageNumbers = useCallback(() => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const current = currentPage + 1

      if (current <= 4) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (current >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
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

      setCurrentPage(page)
      setPageParams((prev) => ({
        ...prev,
        page: page
      }))

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
    if (currentPage > 0) {
      handlePageChange(currentPage - 1)
    }
  }, [currentPage, handlePageChange])

  const handleNextClick = useCallback(() => {
    if (currentPage < totalPages - 1) {
      handlePageChange(currentPage + 1)
    }
  }, [currentPage, totalPages, handlePageChange])

  // Получение текста для статуса
  const getStatusText = (status: 'APPROVED' | 'PENDING' | 'ALL' | 'REJECTED' | '') => {
    switch (status) {
      case 'APPROVED':
        return t('approved') || 'Одобренные'
      case 'PENDING':
        return t('pending') || 'На рассмотрении'
      case 'ALL':
        return t('all') || 'Все'
      case 'REJECTED':
        return t('rejected') || 'Отклоненные'
      default:
        return t('all') || 'Все'
    }
  }

  if (isError) {
    console.error('❌ Error loading products')
    return <div style={{marginBottom: '50px'}}>{t('notFound')}</div>
  }

  return (
    <section className={`section ${styled.catalog}`} ref={catalogRef}>
      <div>
        {/* Сетка товаров */}
        <div className={`${styled.catalog__vitrine}`}>
          <div ref={gridContainerRef} className={styled.vitrine__grid}>
            {(showTableFilters && !!specialFilters && specialFilters?.length !== 0) || showAdminStatusFilters ? (
              <div className={`${styled.section_flexheader}`}>
                <div ref={filtersContainerRef} className={styled.filters_scroll_container}>
                  <ul className={styled.absolute__list}>
                    {/* Фильтры статусов для админки */}
                    {showAdminStatusFilters && (
                      <li className={styled.status_filter_wrapper}>
                        <div ref={statusDropdownRef} className={styled.status_dropdown}>
                          <button
                            className={styled.status_dropdown_button}
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                          >
                            <span>{getStatusText(localApproveStatus)}</span>
                            <svg
                              width='16'
                              height='16'
                              viewBox='0 0 16 16'
                              fill='none'
                              style={{
                                transform: isStatusDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                              }}
                            >
                              <path
                                d='M4 6L8 10L12 6'
                                stroke='currentColor'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </button>
                          {isStatusDropdownOpen && (
                            <div className={styled.status_dropdown_menu}>
                              <button
                                className={`${styled.status_dropdown_item} ${localApproveStatus === 'ALL' ? styled.active : ''}`}
                                onClick={() => handleStatusChange('ALL')}
                              >
                                {getStatusText('ALL')}
                              </button>
                              <button
                                className={`${styled.status_dropdown_item} ${localApproveStatus === 'APPROVED' ? styled.active : ''}`}
                                onClick={() => handleStatusChange('APPROVED')}
                              >
                                {getStatusText('APPROVED')}
                              </button>
                              <button
                                className={`${styled.status_dropdown_item} ${localApproveStatus === 'PENDING' ? styled.active : ''}`}
                                onClick={() => handleStatusChange('PENDING')}
                              >
                                {getStatusText('PENDING')}
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    )}

                    {/* Обычные фильтры */}
                    {showTableFilters &&
                      specialFilters?.map((filter) => {
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

                    {((showTableFilters && !!specialFilters && specialFilters?.length !== 0) ||
                      showAdminStatusFilters) && (
                      <div
                        style={{backgroundColor: 'transparent', minWidth: '65px', height: '10px'}}
                        className=''
                      ></div>
                    )}
                  </ul>
                </div>
              </div>
            ) : null}

            {showSkeleton
              ? Array.from({length: dynamicPageSize}).map((_, index) => (
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
              : products.map((product) => (
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
              <button
                onClick={handlePrevClick}
                disabled={currentPage === 0}
                className={`${styled.exp_pagination__link} ${styled.exp_pagination__link_prev} ${
                  currentPage === 0 ? styled.exp_pagination__link_disabled : ''
                }`}
                aria-label={t('prevPage')}
              >
                <Image
                  style={{transform: 'rotate(180deg)'}}
                  width={24}
                  height={24}
                  alt='prev button'
                  src={'/iconsNew/arrow-right-def.svg'}
                />
              </button>

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

              <button
                onClick={handleNextClick}
                disabled={currentPage === totalPages - 1}
                className={`${styled.exp_pagination__link} ${styled.exp_pagination__link_next} ${
                  currentPage === totalPages - 1 ? styled.exp_pagination__link_disabled : ''
                }`}
                aria-label={t('nextPage')}
              >
                <Image width={24} height={24} alt='next button' src={'/iconsNew/arrow-right-def.svg'} />
              </button>
            </div>
          </div>
        )}

        {isFetching && !showSkeleton && (
          <div className={styled.loading_indicator}>
            <div className={styled.loading_spinner} />
            <span>{t('loadingCards')}</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default CardsCatalogWithPagination
