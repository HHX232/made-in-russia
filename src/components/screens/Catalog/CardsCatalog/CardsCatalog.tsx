/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {FC, useEffect, useState, useRef, useCallback, useMemo} from 'react'
import styled from './CardsCatalog.module.scss'
import Card from '@/components/UI-kit/elements/card/card'
import {useProducts} from '@/hooks/useProducts'
import {Product} from '@/services/products/product.types'
import {selectRangeFilter} from '@/store/Filters/filters.slice'
import {useSelector} from 'react-redux'
import {TypeRootState} from '@/store/store'
import {useTypedSelector} from '@/hooks/useTypedSelector'
import {useActions} from '@/hooks/useActions'
import {getAccessToken} from '@/services/auth/auth.helper'
import {useKeenSlider} from 'keen-slider/react'
import Link from 'next/link'
import Image from 'next/image'
import useWindowWidth from '@/hooks/useWindoWidth'

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
  deliveryMethodIds?: string
  sort?: string
  [key: string]: any
}

// Константы
// >1315 -> 8 ; 1315px -> 9; 768 -> 8
const SLIDER_PAGE_SIZE = 9 // 4 колонки × 2 ряда
const INITIAL_PAGE_SIZE = 10

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
  // Селекторы и состояния
  const priceRange = useSelector((state: TypeRootState) => selectRangeFilter(state, 'priceRange'))
  const {selectedFilters, delivery, searchTitle} = useTypedSelector((state) => state.filters)
  const {addToLatestViews} = useActions()
  const accessToken = getAccessToken()
  // Only client hook
  const [sliderPageSize, setSliderPageSize] = useState(9)
  const width = useWindowWidth()

  useEffect(() => {
    if (!width) return
    if (width > 1315) {
      setSliderPageSize(8)
    } else if (width >= 769 && width <= 1315) {
      setSliderPageSize(9)
    } else {
      setSliderPageSize(8)
    }
  }, [width])

  // Состояния
  const [, setProductIds] = useState<Set<number>>(new Set())
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [numericFilters, setNumericFilters] = useState<number[]>([])
  const [isSliderInitialized, setIsSliderInitialized] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [sliderHeight, setSliderHeight] = useState<number | null>(null)

  // Refs
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastProductRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeSlideRef = useRef<HTMLDivElement | null>(null)

  // Параметры пагинации
  const [pageParams, setPageParams] = useState<PageParams>({
    page: 0,
    size: INITIAL_PAGE_SIZE,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    deliveryMethodIds: delivery?.join(',') || '',
    title: searchTitle,
    sort: 'creationDate',
    direction: direction,
    approveStatuses: approveStatuses === 'ALL' ? '' : approveStatuses
  })

  // Загрузка продуктов
  const {
    data: pageResponse,
    isLoading,
    isError,
    isFetching,
    resData
  } = useProducts(pageParams, () => setPageParams((prev) => ({...prev, page: 0})), specialRoute, accessToken || '')

  // Мемоизированные данные
  const showSkeleton = useMemo(() => isLoading && resData.length === 0, [isLoading, resData.length])

  // Обработка продуктов
  const addProducts = useCallback((newProducts: Product[], replace: boolean = false) => {
    setProductIds((prev) => {
      if (replace) {
        return new Set(newProducts.map((p) => p.id))
      } else {
        const newIds = new Set(prev)
        newProducts.forEach((product) => {
          if (!newIds.has(product.id)) {
            newIds.add(product.id)
          }
        })
        return newIds
      }
    })
  }, [])

  // Инициализация начальных продуктов
  useEffect(() => {
    if (initialProducts.length > 0) {
      addProducts(initialProducts, true)
      setPageParams((prev) => ({
        ...prev,
        page: 1
      }))
    }
  }, [initialProducts, addProducts])

  // Обработка числовых фильтров
  useEffect(() => {
    const numericKeys = Object.keys(selectedFilters)
      .filter((key) => !isNaN(Number(key)))
      .map(Number)
    setNumericFilters(numericKeys)
  }, [selectedFilters])

  // Сброс при изменении поискового запроса
  useEffect(() => {
    setProductIds(new Set())
    setPageParams((prev) => ({
      ...prev,
      page: 0,
      title: searchTitle
    }))
  }, [searchTitle])

  // Сброс при изменении фильтров
  useEffect(() => {
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
        delete newParams.categoryIds
      }

      return newParams
    })
  }, [numericFilters, priceRange, delivery])

  // Сброс для админки при изменении статусов
  useEffect(() => {
    if (isForAdmin) {
      setProductIds(new Set())
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
      setProductIds(new Set())
      setPageParams((prev) => ({
        ...prev,
        page: 0,
        direction: direction
      }))
    }
  }, [direction, isForAdmin])

  // Обработка ответа от API
  useEffect(() => {
    if (pageResponse) {
      if (pageParams.page === 0) {
        addProducts(pageResponse.content, true)
      } else {
        addProducts(pageResponse.content, false)
      }
      setHasMore(!pageResponse.last && pageResponse.content.length > 0)
    }
  }, [pageResponse, pageParams.page, addProducts])

  // Infinite Scroll
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

  // Разделение данных на страницы для слайдера
  const pages = useMemo(() => {
    const result: Product[][] = []
    let pageIndex = 0

    resData.forEach((product, index) => {
      if (index % sliderPageSize === 0) {
        result.push([])
        if (index !== 0) pageIndex++
      }
      result[pageIndex].push(product)
    })
    return result
  }, [resData, sliderPageSize])

  // Конфигурация слайдера
  const [sliderRef, instanceRef] = useKeenSlider({
    slides: {
      perView: 1,
      spacing: 0
    },
    loop: false,
    renderMode: 'precision',
    created: (s) => {
      setIsSliderInitialized(true)
      setCurrentSlide(s.track.details.rel)
    },
    slideChanged: (slider) => {
      setCurrentSlide(slider.track.details.rel)
    }
  })

  // Вычисление состояния стрелок
  const canGoPrev = useMemo(() => {
    return isSliderInitialized && currentSlide > 0
  }, [isSliderInitialized, currentSlide])

  const canGoNext = useMemo(() => {
    return isSliderInitialized && currentSlide < pages.length - 1
  }, [isSliderInitialized, currentSlide, pages.length])

  // Принудительное обновление слайдера при изменении данных
  useEffect(() => {
    if (instanceRef.current && pages.length > 0) {
      const timer = setTimeout(() => {
        try {
          instanceRef.current?.update()
          setIsSliderInitialized(true)
        } catch (error) {
          console.warn('Slider update failed:', error)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [pages.length, instanceRef])

  // Расчет высоты активного слайда
  useEffect(() => {
    const updateHeight = () => {
      if (activeSlideRef.current) {
        const height = activeSlideRef.current.scrollHeight
        setSliderHeight(height)
      }
    }

    // Обновляем высоту при изменении слайда
    updateHeight()

    // Обновляем высоту при изменении размера окна
    const resizeObserver = new ResizeObserver(updateHeight)
    if (activeSlideRef.current) {
      resizeObserver.observe(activeSlideRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [currentSlide, pages, showSkeleton])

  // Обработчики навигации
  const handlePrevClick = useCallback(() => {
    if (canGoPrev && instanceRef.current) {
      instanceRef.current.prev()
    }
  }, [canGoPrev, instanceRef])

  const handleNextClick = useCallback(() => {
    if (canGoNext && instanceRef.current) {
      instanceRef.current.next()
    }
  }, [canGoNext, instanceRef])

  if (isError) {
    return <div style={{marginBottom: '50px'}}>Not found</div>
  }

  return (
    <section className={`section ${styled.popularprod}`}>
      <div>
        <div className={`${styled.section_flexheader}`}>
          <div className={`${styled.section_flexheader__title}`}>Популярные товары</div>

          <div
            className={`${styled.popularprod__header_group} ${styled.popularprod__header_group__for_vis}`}
            id='popularprod-navig-group'
          >
            <Link href='#' className={`${styled.btn_accent}`}>
              Смотреть все
            </Link>
          </div>
          <div className={`${styled.popularprod__navigation_wrap} ${styled.popularprod__navigation_wrap__for_vis}`}>
            <Image
              style={{
                transform: 'rotate(180deg)',
                cursor: canGoPrev ? 'pointer' : 'not-allowed',
                opacity: canGoPrev ? 1 : 0.3
              }}
              onClick={handlePrevClick}
              src={'/iconsNew/arrow-right-def.svg'}
              alt='arrow-left'
              width={24}
              height={24}
            />

            <Image
              onClick={handleNextClick}
              style={{
                cursor: canGoNext ? 'pointer' : 'not-allowed',
                opacity: canGoNext ? 1 : 0.3
              }}
              src={'/iconsNew/arrow-right-def.svg'}
              alt='arrow-right'
              width={24}
              height={24}
            />
          </div>
        </div>

        <div className={`${styled.swiper}`} id='popularprod-swiper' ref={containerRef}>
          <div
            ref={sliderRef}
            className={`keen-slider ${styled.swiper_wrapper}`}
            style={{
              minHeight: sliderHeight ? `${sliderHeight}px` : 'auto'
            }}
          >
            {pages.map((page, pageIndex) => {
              const isLastSlide = pageIndex === pages.length - 1
              const isActive = pageIndex === currentSlide

              return (
                <div
                  className={`keen-slider__slide ${styled.slider__slide} ${isActive ? styled.slider__slide_active : ''}`}
                  key={`page-${pageIndex}`}
                  ref={(node) => {
                    if (isActive) {
                      activeSlideRef.current = node
                    }
                    if (isLastSlide) {
                      lastElementRef(node)
                    }
                  }}
                >
                  {page.map((product, productIndex) => {
                    const uniqueKey = `${product.id}-${pageIndex}-${productIndex}`

                    return (
                      <div className={styled.card_wrapper} key={uniqueKey}>
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
                  })}
                </div>
              )
            })}

            {/* Скелетоны при загрузке */}
            {showSkeleton && (
              <div
                className={`keen-slider__slide ${styled.slider__slide} ${styled.slider__slide_active}`}
                ref={activeSlideRef}
              >
                {Array.from({length: SLIDER_PAGE_SIZE}).map((_, index) => (
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
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '35px'
          }}
          className='bottom_flex'
        >
          <div
            style={{order: '-1'}}
            className={`${styled.popularprod__header_group} ${styled.popularprod__header_group__for_unvis}`}
            id='popularprod-navig-group'
          >
            <Link href='#' className={`${styled.btn_accent}`}>
              Смотреть все
            </Link>
          </div>
          <div className={`${styled.popularprod__navigation_wrap} ${styled.popularprod__navigation_wrap__for_unvis}`}>
            <Image
              style={{
                transform: 'rotate(180deg)',
                cursor: canGoPrev ? 'pointer' : 'not-allowed',
                opacity: canGoPrev ? 1 : 0.3
              }}
              onClick={handlePrevClick}
              src={'/iconsNew/arrow-right-def.svg'}
              alt='arrow-left'
              width={24}
              height={24}
            />

            <Image
              onClick={handleNextClick}
              style={{
                cursor: canGoNext ? 'pointer' : 'not-allowed',
                opacity: canGoNext ? 1 : 0.3
              }}
              src={'/iconsNew/arrow-right-def.svg'}
              alt='arrow-right'
              width={24}
              height={24}
            />
          </div>
        </div>
        <div className={`${styled.popularprod__sm_navigation}`} id='popularprod-sm-place'></div>
      </div>
    </section>
  )
}

export default CardsCatalog
