/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import {FC, useEffect, useState, useRef, useCallback, useMemo} from 'react'
import styled from './CardsCatalog.module.scss'
import Card from '@/components/UI-kit/elements/card/card'
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
import {useTranslations} from 'next-intl'
import {useProducts, ProductQueryParams} from '@/hooks/useProducts'

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
  customMinHeight?: string
  extraSwiperClass?: string
  mathMinHeight?: boolean
  isShowPopulaTitle?: boolean
}

const SLIDES_COUNT = 5
const GAP = 22

const CardsCatalog: FC<CardsCatalogProps> = ({
  initialProducts = [],
  initialHasMore = true,
  specialRoute = undefined,
  canCreateNewProduct = false,
  onPreventCardClick,
  extraButtonsBoxClass,
  isForAdmin = false,
  direction = 'desc',
  approveStatuses = 'ALL',
  customMinHeight,
  extraSwiperClass,
  mathMinHeight = false,
  isShowPopulaTitle = true
}) => {
  const t = useTranslations('CardsCatalogNew')
  const {setCurrentSlide: setCurrentSlideRedux} = useActions()

  const priceRange = useSelector((state: TypeRootState) => selectRangeFilter(state, 'priceRange'))
  const {selectedFilters, delivery, searchTitle} = useTypedSelector((state) => state.filters)
  const {addToLatestViews} = useActions()
  const accessToken = getAccessToken()

  const [sliderPageSize, setSliderPageSize] = useState(8)
  const width = useWindowWidth()

  useEffect(() => {
    if (!width) return
    let itemsPerSlide: number
    if (width > 1270) {
      itemsPerSlide = 8
    } else if (width > 768) {
      itemsPerSlide = 9
    } else {
      itemsPerSlide = 8
    }
    setSliderPageSize(itemsPerSlide)
  }, [width])

  const totalProductsToLoad = useMemo(() => {
    return sliderPageSize * SLIDES_COUNT
  }, [sliderPageSize])

  const [numericFilters, setNumericFilters] = useState<number[]>([])
  const [isSliderInitialized, setIsSliderInitialized] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [sliderHeight, setSliderHeight] = useState<number | null>(null)
  const [cardHeight, setCardHeight] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const activeSlideRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const lastMeasuredWidth = useRef<number | null>(null)
  const lastMeasuredHeight = useRef<number | null>(null)

  const [queryParams, setQueryParams] = useState<ProductQueryParams>({
    page: 0,
    size: totalProductsToLoad,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    delivery: delivery || [],
    search: searchTitle,
    sort: 'creationDate',
    direction: direction,
    approveStatuses: approveStatuses
  })

  const resetPageParams = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      page: 0
    }))
    setCurrentSlide(0)
  }, [])

  const {
    resData: products,
    isLoading,
    isError,
    refetch
  } = useProducts(queryParams, resetPageParams, specialRoute, accessToken || '')

  useEffect(() => {
    setQueryParams((prev) => ({
      ...prev,
      size: totalProductsToLoad
    }))
  }, [totalProductsToLoad])

  useEffect(() => {
    const numericKeys = Object.keys(selectedFilters)
      .filter((key) => !isNaN(Number(key)))
      .map(Number)
    setNumericFilters(numericKeys)
  }, [selectedFilters])

  useEffect(() => {
    setCurrentSlide(0)
    setQueryParams((prev) => ({
      ...prev,
      page: 0,
      search: searchTitle
    }))
  }, [searchTitle])

  useEffect(() => {
    setCurrentSlide(0)
    setQueryParams((prev) => ({
      ...prev,
      page: 0,
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
      deliveryMethodIds: delivery?.join(',') || '',
      categoryIds: numericFilters.length > 0 ? numericFilters.join(',') : undefined
    }))
  }, [numericFilters, priceRange, delivery])

  useEffect(() => {
    if (isForAdmin) {
      setCurrentSlide(0)
      setQueryParams((prev) => ({
        ...prev,
        page: 0,
        approveStatuses: approveStatuses
      }))
    }
  }, [approveStatuses, isForAdmin])

  useEffect(() => {
    if (isForAdmin) {
      setCurrentSlide(0)
      setQueryParams((prev) => ({
        ...prev,
        page: 0,
        direction: direction
      }))
    }
  }, [direction, isForAdmin])

  const showSkeleton = useMemo(() => {
    return isLoading && products.length === 0
  }, [isLoading, products.length])

  const showEmptyMessage = useMemo(() => {
    return !isLoading && products.length === 0
  }, [isLoading, products.length])

  const pages = useMemo(() => {
    const result: Product[][] = []
    let pageIndex = 0

    products.forEach((product, index) => {
      if (index % sliderPageSize === 0) {
        result.push([])
        if (index !== 0) pageIndex++
      }
      result[pageIndex].push(product)
    })

    console.log('📑 Pages created:', result.length, 'Total products:', products.length)
    return result
  }, [products, sliderPageSize])

  const sliderKey = useMemo(() => {
    return `slider-${products.length}-${pages.length}-${sliderPageSize}`
  }, [products.length, pages.length, sliderPageSize])

  useEffect(() => {
    const measureCardHeight = () => {
      const firstCard = cardRefs.current.values().next().value
      if (firstCard) {
        const height = firstCard.offsetHeight

        if (height > 0 && (!lastMeasuredHeight.current || Math.abs(height - lastMeasuredHeight.current) > 5)) {
          setCardHeight(height)
          lastMeasuredHeight.current = height
          console.log('📏 Card height measured:', height)
        }
      }
    }

    if (!width || (lastMeasuredWidth.current && Math.abs(width - lastMeasuredWidth.current) < 50)) {
      return
    }

    lastMeasuredWidth.current = width

    const timer = setTimeout(measureCardHeight, 100)

    const resizeObserver = new ResizeObserver(measureCardHeight)
    const firstCard = cardRefs.current.values().next().value
    if (firstCard) {
      resizeObserver.observe(firstCard)
    }

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
    }
  }, [width, pages.length])

  const onImageLoad = () => {
    const firstCard = cardRefs.current.values().next().value
    if (firstCard && !cardHeight) {
      const height = firstCard.offsetHeight
      if (height > 0) {
        setCardHeight(height)
        lastMeasuredHeight.current = height
        console.log('📏 Card height measured on image load:', height)
      }
    }
  }

  const calculatedHeight = useMemo(() => {
    if (!mathMinHeight || !cardHeight) return null

    const currentPage = pages[currentSlide]
    if (!currentPage) return null

    const itemsCount = currentPage.length
    const currentWidth = width || 1920

    let itemsPerRow: number
    if (currentWidth > 1270) {
      itemsPerRow = 4
    } else if (currentWidth > 768) {
      itemsPerRow = 3
    } else {
      itemsPerRow = 2
    }

    const rowsCount = Math.ceil(itemsCount / itemsPerRow)
    const totalHeight = cardHeight * rowsCount + 20 + ((width || 1270) < 1420 ? 30 : GAP) * (rowsCount - 1)

    console.log('📐 Calculated height:', {
      cardHeight,
      itemsCount,
      itemsPerRow,
      rowsCount,
      totalHeight
    })

    return totalHeight
  }, [mathMinHeight, cardHeight, pages.length, currentSlide, width])

  const cardMaxWidth = useMemo(() => {
    if (!mathMinHeight) return undefined

    if (!cardHeight) {
      const currentWidth = width || 1920
      let defaultMaxWidth: number
      if (currentWidth > 1270) {
        defaultMaxWidth = 400
      } else if (currentWidth > 768) {
        defaultMaxWidth = 288
      } else {
        defaultMaxWidth = 240
      }
      console.log('📦 Card max-width (default):', defaultMaxWidth)
      return defaultMaxWidth
    }

    const calculatedMaxWidth = (cardHeight * 300) / 330
    console.log('📦 Card max-width calculated:', calculatedMaxWidth)
    return calculatedMaxWidth
  }, [mathMinHeight, cardHeight, width])

  const [sliderRef, instanceRef] = useKeenSlider({
    slides: {
      perView: 1,
      spacing: 0
    },
    loop: false,
    renderMode: 'precision',
    initial: 0,
    created: (s) => {
      console.log('🎨 Slider created')
      if (s.track.details) {
        setCurrentSlide(s.track.details.rel)
      } else {
        setCurrentSlide(0)
      }
      setIsSliderInitialized(true)
    },
    slideChanged: (slider) => {
      if (slider.track.details) {
        const newSlide = slider.track.details.rel
        console.log('🔄 Slide changed to:', newSlide)
        setCurrentSlide(newSlide)
        setCurrentSlideRedux(newSlide)
      }
    },
    updated: (slider) => {
      if (slider.track.details) {
        const currentRel = slider.track.details.rel
        console.log('🔧 Slider updated, slide:', currentRel)
        setCurrentSlide(currentRel)
        setCurrentSlideRedux(currentRel)
      }
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
    if (products.length === 0) {
      setIsSliderInitialized(false)
      setCurrentSlide(0)
    } else if (products.length > 0 && !isSliderInitialized) {
      const timer = setTimeout(() => {
        if (instanceRef.current) {
          setIsSliderInitialized(true)
          setCurrentSlide(0)
        }
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [products.length, isSliderInitialized])

  const canGoPrev = useMemo(() => {
    return isSliderInitialized && currentSlide > 0 && pages.length > 1
  }, [isSliderInitialized, currentSlide, pages.length])

  const canGoNext = useMemo(() => {
    return isSliderInitialized && currentSlide < pages.length - 1 && pages.length > 1
  }, [isSliderInitialized, currentSlide, pages.length])

  useEffect(() => {
    const updateHeight = () => {
      if (activeSlideRef.current) {
        const height = activeSlideRef.current.scrollHeight
        setSliderHeight(height)
      }
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(() => {
      updateHeight()
    })

    if (activeSlideRef.current) {
      resizeObserver.observe(activeSlideRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [currentSlide, pages, showSkeleton])

  const finalHeight = useMemo(() => {
    if (mathMinHeight && calculatedHeight !== null) {
      return `${calculatedHeight}px`
    }
    if (customMinHeight) {
      return customMinHeight
    }
    if (sliderHeight) {
      return `${sliderHeight}px`
    }
    return 'auto'
  }, [mathMinHeight, calculatedHeight, customMinHeight, sliderHeight])

  const handlePrevClick = useCallback(() => {
    if (canGoPrev && instanceRef.current) {
      try {
        instanceRef.current.prev()
      } catch (error) {
        console.error('❌ Prev failed:', error)
      }
    }
  }, [canGoPrev])

  const handleNextClick = useCallback(() => {
    if (canGoNext && instanceRef.current) {
      try {
        instanceRef.current.next()
      } catch (error) {
        console.error('❌ Next failed:', error)
      }
    }
  }, [canGoNext])

  const setCardRef = useCallback((key: string, element: HTMLDivElement | null) => {
    if (element) {
      cardRefs.current.set(key, element)
    } else {
      cardRefs.current.delete(key)
    }
  }, [])

  if (isError) {
    console.error('❌ Error loading products')
    return <div style={{marginBottom: '50px'}}>{t('notFound')}</div>
  }

  if (showEmptyMessage) {
    return (
      <section className={`section ${styled.popularprod}`}>
        <div>
          {isShowPopulaTitle && (
            <div className={`${styled.section_flexheader}`}>
              <div className={`${styled.section_flexheader__title}`}>{t('popularProducts')}</div>
            </div>
          )}
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              fontSize: '18px',
              color: '#666',
              marginBottom: '50px'
            }}
          >
            {t('nohavecards')}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`section ${styled.popularprod}`}>
      <div>
        <div className={`${styled.section_flexheader}`}>
          {isShowPopulaTitle && <div className={`${styled.section_flexheader__title}`}>{t('popularProducts')}</div>}

          <div
            className={`${styled.popularprod__header_group} ${styled.popularprod__header_group__for_vis}`}
            id='popularprod-navig-group'
          ></div>
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

        <div className={`${styled.swiper} ${extraSwiperClass}`} id='popularprod-swiper' ref={containerRef}>
          <div
            ref={sliderRef}
            key={sliderKey}
            className={`keen-slider ${styled.swiper_wrapper}`}
            style={{
              minHeight: finalHeight
            }}
          >
            {pages.length > 0 &&
              pages.map((page, pageIndex) => {
                const isActive = pageIndex === currentSlide

                return (
                  <div
                    className={`keen-slider__slide spec__keen-slider__slide ${styled.slider__slide} ${isActive ? styled.slider__slide_active : ''}`}
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
                        <div
                          style={{
                            maxWidth: cardMaxWidth
                          }}
                          ref={(el) => setCardRef(uniqueKey, el)}
                          className={styled.card_wrapper}
                          key={uniqueKey}
                        >
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
          ></div>
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
