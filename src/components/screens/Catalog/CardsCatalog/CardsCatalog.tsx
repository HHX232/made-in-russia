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
  console.log('🎯 CardsCatalog: Component render')

  const {setCurrentSlide: setCurrentSlideRedux} = useActions()
  const {currentSlide: currentSlideRedux} = useTypedSelector((state) => state.sliderHomeSlice)
  // Селекторы и состояния
  const priceRange = useSelector((state: TypeRootState) => selectRangeFilter(state, 'priceRange'))
  const {selectedFilters, delivery, searchTitle} = useTypedSelector((state) => state.filters)
  const {addToLatestViews} = useActions()
  const accessToken = getAccessToken()

  // Slider page size
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
    console.log('📐 Slider page size updated:', width > 1315 ? 8 : width >= 769 ? 9 : 8)
  }, [width])

  // Состояния
  const [, setProductIds] = useState<Set<number>>(new Set())
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [numericFilters, setNumericFilters] = useState<number[]>([])
  const [isSliderInitialized, setIsSliderInitialized] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [sliderHeight, setSliderHeight] = useState<number | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const previousSlideRef = useRef<number>(currentSlide)
  useEffect(() => {
    previousSlideRef.current = currentSlide
  }, [currentSlide])

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const activeSlideRef = useRef<HTMLDivElement | null>(null)
  const isFirstRender = useRef(true)
  const hasRequestedMoreRef = useRef(false) // Флаг для предотвращения дублирования запросов

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

  console.log('📄 Current page params:', pageParams)

  // Загрузка продуктов
  const {
    data: pageResponse,
    isLoading,
    isError,
    isFetching,
    resData
  } = useProducts(
    pageParams,
    () => {
      console.log('🔄 Reset triggered, setting page to 0')
      setPageParams((prev) => ({...prev, page: 0}))
    },
    specialRoute,
    accessToken || ''
  )

  console.log('📦 Products state:', {
    totalProducts: resData.length,
    isLoading,
    isFetching,
    hasMore,
    isLoadingMore
  })

  // Мемоизированные данные
  const showSkeleton = useMemo(() => {
    const result = isLoading && resData.length === 0
    console.log('💀 Show skeleton:', result)
    return result
  }, [isLoading, resData.length])

  // Обработка продуктов
  const addProducts = useCallback((newProducts: Product[], replace: boolean = false) => {
    console.log(`➕ Adding products: ${newProducts.length} items, replace: ${replace}`)
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
        console.log(`✅ Total unique products: ${newIds.size}`)
        return newIds
      }
    })
  }, [])

  // Инициализация начальных продуктов
  useEffect(() => {
    if (initialProducts.length > 0 && isFirstRender.current) {
      console.log('🎬 Initial products loaded:', initialProducts.length)
      addProducts(initialProducts, true)
      setPageParams((prev) => ({
        ...prev,
        page: 1
      }))
      isFirstRender.current = false
    }
  }, [initialProducts, addProducts])

  // Обработка числовых фильтров
  useEffect(() => {
    const numericKeys = Object.keys(selectedFilters)
      .filter((key) => !isNaN(Number(key)))
      .map(Number)
    console.log('🔢 Numeric filters updated:', numericKeys)
    setNumericFilters(numericKeys)
  }, [selectedFilters])

  // Сброс при изменении поискового запроса
  useEffect(() => {
    console.log('🔍 Search title changed:', searchTitle)
    setProductIds(new Set())
    setPageParams((prev) => ({
      ...prev,
      page: 0,
      title: searchTitle
    }))
  }, [searchTitle])

  // Сброс при изменении фильтров
  useEffect(() => {
    console.log('🎛️ Filters changed:', {numericFilters, priceRange, delivery})
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
      console.log('👨‍💼 Admin approve status changed:', approveStatuses)
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
      console.log('🔀 Admin direction changed:', direction)
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
      console.log('📥 API response received:', {
        page: pageParams.page,
        contentLength: pageResponse.content.length,
        isLast: pageResponse.last,
        totalPages: pageResponse.totalPages
      })

      if (pageParams.page === 0) {
        addProducts(pageResponse.content, true)
      } else {
        addProducts(pageResponse.content, false)
      }

      const newHasMore = !pageResponse.last && pageResponse.content.length > 0
      console.log('🏁 Has more:', newHasMore)
      setHasMore(newHasMore)
      setIsLoadingMore(false)

      if (instanceRef.current && previousSlideRef.current !== undefined) {
        try {
          // если текущий активный слайд не выходит за границы страниц
          if (previousSlideRef.current < pages.length) {
            instanceRef.current.moveToIdx(previousSlideRef.current)
          }
        } catch (error) {
          console.error('Ошибка при восстановлении слайда:', error)
        }
      }

      // Сбрасываем флаг после успешной загрузки
      hasRequestedMoreRef.current = false
    }
  }, [pageResponse, pageParams.page, addProducts])

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

    console.log('📑 Pages created:', {
      totalPages: result.length,
      productsPerPage: sliderPageSize,
      totalProducts: resData.length
    })

    return result
  }, [resData, sliderPageSize])

  // КЛЮЧ для переинициализации слайдера
  const sliderKey = useMemo(() => {
    return `slider-${resData.length}-${pages.length}`
  }, [resData.length, pages.length])

  // Конфигурация слайдера
  const [sliderRef, instanceRef] = useKeenSlider({
    slides: {
      perView: 1,
      spacing: 0
    },
    loop: false,
    renderMode: 'precision',
    initial: currentSlideRedux,
    created: (s) => {
      console.log('🎨 Slider created, initial slide:', s.track.details.rel)
      setIsSliderInitialized(true)
      setCurrentSlide(s.track.details.rel)
    },
    slideChanged: (slider) => {
      const newSlide = slider.track.details.rel
      console.log('🔄 Slide changed:', {
        from: currentSlide,
        to: newSlide,
        totalSlides: pages.length
      })
      setCurrentSlide(newSlide)
      setCurrentSlideRedux(slider.track.details.rel)
    },
    updated: (slider) => {
      console.log('🔧 Slider updated, current slide:', slider.track.details.rel)
      setCurrentSlide(slider.track.details.rel)
      setCurrentSlideRedux(slider.track.details.rel)
      if (pages.length > 0) {
        setIsSliderInitialized(true)
      }
    },
    destroyed: () => {
      console.log('💥 Slider destroyed')
      setIsSliderInitialized(false)
      setCurrentSlide(0)
      setCurrentSlideRedux(0)
    }
  })

  useEffect(() => {
    if (instanceRef.current) {
      if (currentSlide < pages.length) {
        instanceRef.current.moveToIdx(currentSlide)
      }
    }
  }, [instanceRef, currentSlide, pages.length])
  // Эффект для сброса состояния при изменении данных
  useEffect(() => {
    console.log('🔄 Data changed:', {dataLength: resData.length, pagesLength: pages.length})

    if (resData.length === 0) {
      console.log('🔄 Reset slider state - no data')
      setIsSliderInitialized(false)
      setCurrentSlide(0)
      hasRequestedMoreRef.current = false // Сбрасываем флаг запроса
    } else if (resData.length > 0 && !isSliderInitialized) {
      console.log('🔄 Data loaded, waiting for slider init')
      const timer = setTimeout(() => {
        if (instanceRef.current) {
          console.log('✅ Slider ready after data load')
          setIsSliderInitialized(true)
          setCurrentSlide(0)
        }
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [resData.length, isSliderInitialized])

  // НОВАЯ ЛОГИКА: Загрузка при достижении последнего слайда
  // Когда пользователь доходит до последнего слайда (например, 7-й из 7),
  // автоматически загружаем следующую порцию данных
  useEffect(() => {
    // Проверяем, что слайдер инициализирован и есть страницы
    if (!isSliderInitialized || pages.length === 0) {
      console.log('⏸️ Skip load check - slider not ready', {isSliderInitialized, pagesLength: pages.length})
      return
    }

    // Проверяем, что текущий слайд - последний
    const isLastSlide = currentSlide === pages.length - 1
    console.log('🔍 Load check:', {
      currentSlide,
      totalPages: pages.length,
      isLastSlide,
      hasMore,
      isFetching,
      isLoadingMore,
      hasRequestedMore: hasRequestedMoreRef.current
    })

    // Если достигли последнего слайда и есть ещё данные для загрузки
    if (isLastSlide && hasMore && !isFetching && !isLoadingMore && !hasRequestedMoreRef.current) {
      console.log('🚀 Loading next page - reached last slide')
      hasRequestedMoreRef.current = true
      setIsLoadingMore(true)

      setPageParams((prev) => {
        const newPage = prev.page + 1
        console.log('📈 Page increment:', prev.page, '->', newPage)
        return {
          ...prev,
          page: newPage
        }
      })
    }
  }, [currentSlide, pages.length, isSliderInitialized, hasMore, isFetching, isLoadingMore])

  // Вычисление состояния стрелок
  const canGoPrev = useMemo(() => {
    const result = isSliderInitialized && currentSlide > 0 && pages.length > 1
    console.log('⬅️ Can go prev:', result, {
      isSliderInitialized,
      currentSlide,
      pagesLength: pages.length,
      hasInstance: !!instanceRef.current
    })
    return result
  }, [isSliderInitialized, currentSlide, pages.length])

  const canGoNext = useMemo(() => {
    const result = isSliderInitialized && currentSlide < pages.length - 1 && pages.length > 1
    console.log('➡️ Can go next:', result, {
      isSliderInitialized,
      currentSlide,
      pagesLength: pages.length,
      hasInstance: !!instanceRef.current
    })
    return result
  }, [isSliderInitialized, currentSlide, pages.length])

  console.log('⬅️➡️ Navigation state:', {canGoPrev, canGoNext, currentSlide, totalPages: pages.length})

  // Расчет высоты активного слайда
  useEffect(() => {
    const updateHeight = () => {
      if (activeSlideRef.current) {
        const height = activeSlideRef.current.scrollHeight
        console.log('📏 Updating slide height:', height)
        setSliderHeight(height)
      }
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(() => {
      console.log('📐 Resize detected, updating height')
      updateHeight()
    })

    if (activeSlideRef.current) {
      resizeObserver.observe(activeSlideRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [currentSlide, pages, showSkeleton])

  // Обработчики навигации
  const handlePrevClick = useCallback(() => {
    console.log('⬅️ Previous slide clicked', {canGoPrev, hasInstance: !!instanceRef.current})
    if (canGoPrev && instanceRef.current) {
      try {
        instanceRef.current.prev()
      } catch (error) {
        console.error('❌ Prev failed:', error)
      }
    }
  }, [canGoPrev])

  const handleNextClick = useCallback(() => {
    console.log('➡️ Next slide clicked', {canGoNext, hasInstance: !!instanceRef.current})
    if (canGoNext && instanceRef.current) {
      try {
        instanceRef.current.next()
      } catch (error) {
        console.error('❌ Next failed:', error)
      }
    }
  }, [canGoNext])

  if (isError) {
    console.error('❌ Error loading products')
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
            key={sliderKey}
            className={`keen-slider ${styled.swiper_wrapper}`}
            style={{
              minHeight: sliderHeight ? `${sliderHeight}px` : 'auto'
            }}
          >
            {pages.map((page, pageIndex) => {
              const isActive = pageIndex === currentSlide

              return (
                <div
                  className={`keen-slider__slide ${styled.slider__slide} ${isActive ? styled.slider__slide_active : ''}`}
                  key={`page-${pageIndex}`}
                  ref={(node) => {
                    if (isActive) {
                      activeSlideRef.current = node
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

            {showSkeleton && (
              <div
                className={`keen-slider__slide ${styled.slider__slide} ${styled.slider__slide_active}`}
                ref={activeSlideRef}
              >
                {Array.from({length: sliderPageSize}).map((_, index) => (
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

            {/* Индикатор загрузки дополнительных данных */}
            {isLoadingMore && !showSkeleton && hasMore && (
              <div
                className={`keen-slider__slide ${styled.slider__slide}`}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '400px'
                }}
              >
                <div style={{fontSize: '18px', color: '#666'}}>Загрузка новых товаров...</div>
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
            <Link href='#' className={`${styled.btn_accent} ${styled.btn_accent_bottom}`}>
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
