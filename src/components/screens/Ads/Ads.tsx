/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, {FC, useMemo, useState, useEffect, useRef} from 'react'
import styles from './Promo.module.scss'
import Link from 'next/link'
import {IPromoFromServer} from '@/app/page'
import Head from 'next/head'
import {
  generateMainPromoSchema,
  generateItemListSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  stripHtml
} from './ads.helpers'

import {useKeenSlider} from 'keen-slider/react'
import {useTranslations} from 'next-intl'

interface PromoItemOptimizedProps {
  ad: IPromoFromServer
  priority?: boolean
  sizes?: string
  onContentHeightChange?: (height: number) => void
}

const PromoItemOptimized: FC<PromoItemOptimizedProps> = ({ad, onContentHeightChange}) => {
  const t = useTranslations('PromoItem')
  const textBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textBoxRef.current && onContentHeightChange) {
      const updateHeight = () => {
        if (textBoxRef.current && window.innerWidth <= 576) {
          onContentHeightChange(textBoxRef.current.clientHeight)
        }
      }

      updateHeight()
      const timer = setTimeout(updateHeight, 100)

      return () => clearTimeout(timer)
    }
  }, [ad, onContentHeightChange])

  return (
    <div className={styles.marketing_card}>
      <div className={styles.marketing_card__container}>
        <div className={styles.marketing_card__content}>
          <div ref={textBoxRef}>
            <h3 className={styles.marketing_card__title} dangerouslySetInnerHTML={{__html: ad.title}} />

            <p className={styles.marketing_card__description} dangerouslySetInnerHTML={{__html: ad.subtitle}} />
          </div>

          <Link href={ad.link} className={styles.btn_accent}>
            {t('goToCategory')}
          </Link>
        </div>
        <div className={styles.marketing_card__overlay} />
      </div>

      <div className={styles.marketing_card__image}>
        <div className={styles.marketing_card__image_overlay} style={{backgroundImage: `url(${ad.imageUrl})`}} />
      </div>
    </div>
  )
}

interface NavigationGroupProps {
  currentSlide: number
  totalSlides: number
  onPrev: () => void
  onNext: () => void
  textContentHeight?: number
}

const NavigationGroup: FC<NavigationGroupProps> = ({currentSlide, totalSlides, onPrev, onNext, textContentHeight}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 576)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const style: React.CSSProperties = {
    ...(isMobile && textContentHeight ? {top: `${textContentHeight + 150}px`} : {}),
    ['--total-slides' as any]: totalSlides
  }

  return (
    <div className={styles.navigation_group} style={style}>
      <div className={styles.navigation_group__counter}>
        <span className={styles.current}>{currentSlide + 1}</span>/<span className={styles.total}>{totalSlides}</span>
      </div>

      <div className={styles.navigation_group__pagination}>
        <div className={styles.custom_pagination_bullet} style={{transform: `translateX(${currentSlide * 100}%)`}} />
      </div>

      <div className={styles.navigation_group__arrows}>
        <div
          className={`${styles.arrow} ${styles.arrow_left} ${currentSlide === 0 ? styles.arrow_disabled : ''}`}
          onClick={onPrev}
        />
        <div
          className={`${styles.arrow} ${styles.arrow_right} ${currentSlide === totalSlides - 1 ? styles.arrow_disabled : ''}`}
          onClick={onNext}
        />
      </div>
    </div>
  )
}

interface DynamicSliderProps {
  ads: IPromoFromServer[]
  isLoading: boolean
}

const DynamicSlider: FC<DynamicSliderProps> = ({ads, isLoading}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [sliderReady, setSliderReady] = useState(false)
  const [textContentHeight, setTextContentHeight] = useState<number | undefined>(undefined)
  const [opacities, setOpacities] = useState<number[]>([])
  const [sliderHeight, setSliderHeight] = useState<number | undefined>(undefined)
  const contentHeightsRef = useRef<{[key: number]: number}>({})

  const updateSliderHeight = () => {
    const activeSlide = document.querySelector(`.keen-slider__slide:nth-child(${currentSlide + 1})`) as HTMLElement
    if (activeSlide) {
      setSliderHeight(activeSlide.offsetHeight)
    }
  }

  useEffect(() => {
    if (sliderReady) {
      updateSliderHeight()
    }
  }, [sliderReady, currentSlide])

  useEffect(() => {
    updateSliderHeight()
  }, [currentSlide, ads])

  useEffect(() => {
    window.addEventListener('resize', updateSliderHeight)
    return () => window.removeEventListener('resize', updateSliderHeight)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setSliderReady(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  const updateTextContentHeight = () => {
    if (window.innerWidth <= 576) {
      const height = contentHeightsRef.current[currentSlide]
      if (height !== undefined) {
        setTextContentHeight(height)
      }
    } else {
      setTextContentHeight(undefined)
    }
  }

  useEffect(() => {
    updateTextContentHeight()
  }, [currentSlide])

  const handleContentHeightChange = (index: number) => (height: number) => {
    contentHeightsRef.current[index] = height
    if (index === currentSlide) {
      updateTextContentHeight()
    }
  }

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    slides: {
      perView: 1,
      spacing: 0
    },
    slideChanged(slider) {
      const newSlide = slider.track.details.rel
      setCurrentSlide(newSlide)
      updateTextContentHeight()
    },
    detailsChanged(s) {
      const new_opacities = s.track.details.slides.map((slide) => slide.portion)
      setOpacities(new_opacities)
    },
    created() {
      updateTextContentHeight()
    }
  })

  useEffect(() => {
    const handleResize = () => {
      updateTextContentHeight()
      updateSliderHeight()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentSlide])

  if (!sliderReady) {
    return <StaticPromoFallback ads={ads} />
  }

  const handlePrev = () => {
    instanceRef.current?.prev()
  }

  const handleNext = () => {
    instanceRef.current?.next()
  }

  return (
    <div style={{transform: 'none'}} className={`${styles.marketing_swiper} `}>
      <NavigationGroup
        currentSlide={currentSlide}
        totalSlides={ads.length}
        onPrev={handlePrev}
        onNext={handleNext}
        textContentHeight={textContentHeight}
      />

      <div
        style={{
          transform: 'none',
          position: 'relative',
          height: `${sliderHeight}px`
        }}
        ref={sliderRef}
        className={`keen-slider ${styles.fade_slider}`}
      >
        {ads.map((ad, index) => (
          <div style={{opacity: opacities[index]}} className='keen-slider__slide keen_without_transform' key={ad.id}>
            <PromoItemOptimized
              ad={ad}
              priority={index === 0}
              sizes='100vw'
              onContentHeightChange={handleContentHeightChange(index)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const StaticPromoFallback: FC<{ads: IPromoFromServer[]}> = ({ads}) => {
  const firstAd = ads[0]

  if (!firstAd) return null

  return (
    <div className={styles.marketing_swiper}>
      <PromoItemOptimized ad={firstAd} priority={true} sizes='100vw' />
    </div>
  )
}

interface PromoProps {
  ads: IPromoFromServer[]
  organizationName?: string
  baseUrl?: string
  siteTitle?: string
}

const extractOrderNumber = (text: string): {order: number; cleanText: string} => {
  // Словарь китайских цифр
  const chineseNumbers: {[key: string]: number} = {
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
    零: 0,
    〇: 0
  }

  // Проверяем арабские цифры в начале с пробелом или без
  const arabicMatch = text.match(/^(\d+)\s*(.*)/)
  if (arabicMatch && arabicMatch[2]) {
    return {
      order: parseInt(arabicMatch[1], 10),
      cleanText: arabicMatch[2]
    }
  }

  // Проверяем китайские цифры в начале
  const firstChar = text.charAt(0)
  if (firstChar in chineseNumbers) {
    return {
      order: chineseNumbers[firstChar],
      cleanText: text.substring(1)
    }
  }

  return {
    order: Infinity,
    cleanText: text
  }
}

const sortAndCleanAds = (ads: IPromoFromServer[]): IPromoFromServer[] => {
  return ads
    .map((ad) => {
      const titleData = extractOrderNumber(ad.title)
      const subtitleData = extractOrderNumber(ad.subtitle)

      return {
        ...ad,
        title: titleData.cleanText,
        subtitle: subtitleData.cleanText,
        order: titleData.order
      }
    })
    .sort((a, b) => a.order - b.order)
}

const Promo: FC<PromoProps> = ({
  ads,
  organizationName = 'Exporteru',
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://exporteru.com',
  siteTitle = 'Exporteru.com'
}) => {
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const t = useTranslations('PromoItem')

  const sortedAds = useMemo(() => sortAndCleanAds(ads), [ads])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const schemas = useMemo(() => {
    const mainPromoSchema = generateMainPromoSchema(sortedAds, organizationName, baseUrl)
    const itemListSchema = generateItemListSchema(sortedAds, baseUrl)
    const organizationSchema = generateOrganizationSchema(organizationName, baseUrl)

    return {
      '@context': 'https://schema.org',
      '@graph': [organizationSchema, mainPromoSchema, itemListSchema]
    }
  }, [sortedAds, organizationName, baseUrl, siteTitle])

  return (
    <>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemas, null, 2)
          }}
        />
      </Head>

      <section style={{overflow: 'hidden'}} className={styles.marketing}>
        <h2 className={styles.visually_hidden}>{t('title')}</h2>
        <div className={`${styles.container_full} container`}>
          <DynamicSlider ads={sortedAds} isLoading={!isPageLoaded} />
        </div>
      </section>
    </>
  )
}

export default Promo

export {
  generateMainPromoSchema,
  generateItemListSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateWebSiteSchema,
  stripHtml
}
