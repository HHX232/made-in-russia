/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO добавить сео посты скрытые
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
}

const PromoItemOptimized: FC<PromoItemOptimizedProps> = ({ad}) => {
  const t = useTranslations('PromoItem')
  return (
    <div className={styles.marketing_card}>
      <div className={styles.marketing_card__container}>
        <div className={styles.marketing_card__content}>
          <h3 className={styles.marketing_card__title} dangerouslySetInnerHTML={{__html: ad.title}} />

          <p className={styles.marketing_card__description} dangerouslySetInnerHTML={{__html: ad.subtitle}} />

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
  contentHeight?: number
}

const NavigationGroup: FC<NavigationGroupProps> = ({currentSlide, totalSlides, onPrev, onNext, contentHeight}) => {
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
    ...(isMobile && contentHeight ? {top: `${contentHeight + 70}px`} : {}),
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
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined)
  const contentRef = useRef<HTMLDivElement>(null)
  const [opacities, setOpacities] = useState<number[]>([])
  const [sliderHeight, setSliderHeight] = useState<number | undefined>(undefined)

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

  const updateContentHeight = () => {
    if (window.innerWidth <= 580 && contentRef.current) {
      const activeContent = contentRef.current.querySelector(
        `.keen-slider__slide:nth-child(${currentSlide + 1}) .${styles.marketing_card__content}`
      )
      if (activeContent) {
        setContentHeight(activeContent.clientHeight)
      }
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

      // Update content height for mobile
      updateContentHeight()
    },
    detailsChanged(s) {
      const new_opacities = s.track.details.slides.map((slide) => slide.portion)
      console.log('new_opacities', new_opacities)
      setOpacities(new_opacities)
    },
    created() {
      updateContentHeight()
    }
  })

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 576) {
        setContentHeight(undefined)
      } else {
        updateContentHeight()
      }
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
        contentHeight={contentHeight}
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
          <div
            style={{opacity: opacities[index]}}
            className='keen-slider__slide keen_without_transform'
            key={ad.id}
            ref={index === 0 ? contentRef : null}
          >
            <PromoItemOptimized ad={ad} priority={index === 0} sizes='100vw' />
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
// url('./images/main/main-10-bg.webp' './images/main/main-12-bg.webp' ./images/main/main-13-bg.webp
const Promo: FC<PromoProps> = ({
  ads,
  organizationName = 'Exporteru',
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://exporteru.com',
  siteTitle = 'Exporteru.com'
}) => {
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const t = useTranslations('PromoItem')
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const schemas = useMemo(() => {
    const mainPromoSchema = generateMainPromoSchema(ads, organizationName, baseUrl)
    const itemListSchema = generateItemListSchema(ads, baseUrl)
    const organizationSchema = generateOrganizationSchema(organizationName, baseUrl)

    return {
      '@context': 'https://schema.org',
      '@graph': [organizationSchema, mainPromoSchema, itemListSchema]
    }
  }, [ads, organizationName, baseUrl, siteTitle])

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
          <DynamicSlider ads={ads} isLoading={!isPageLoaded} />
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

// /* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client'
// import React, {FC, useMemo, useState, useEffect, useRef} from 'react'
// import styles from './Promo.module.scss'
// import Link from 'next/link'
// import Image from 'next/image'
// import {IPromoFromServer} from '@/app/page'
// import Head from 'next/head'
// import {
//   generateMainPromoSchema,
//   generateItemListSchema,
//   generateOrganizationSchema,
//   generateWebSiteSchema,
//   generateBreadcrumbSchema,
//   stripHtml
// } from './ads.helpers'

// import {useKeenSlider} from 'keen-slider/react'

// interface PromoItemOptimizedProps {
//   ad: IPromoFromServer
//   priority?: boolean
//   sizes?: string
//   extraClass?: string
//   extraStyle?: React.CSSProperties
//   isSmall?: boolean
//   isMobile?: boolean
// }

// const PromoItemOptimized: FC<PromoItemOptimizedProps> = ({
//   ad,
//   priority = false,
//   sizes = '(max-width: 768px) 100vw, (max-width: 993px) 50vw, 33vw',
//   extraClass,
//   extraStyle,
//   isSmall = false,
//   isMobile = false
// }) => {
//   return (
//     <Link
//       draggable='false'
//       style={{...extraStyle}}
//       href={ad.link}
//       className={`${styles.promo__item_box} ${extraClass || ''}`}
//     >
//       <div className={styles.promo__item_bg}>
//         <Image
//           src={ad.imageUrl}
//           alt={ad.title}
//           fill
//           sizes={sizes}
//           priority={priority}
//           quality={priority ? 90 : 75}
//           placeholder='blur'
//           blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgW0ATZ4AAAAASUVORK5CYII='
//           style={{
//             objectFit: 'cover',
//             objectPosition: 'center'
//           }}
//         />
//         <div className={styles.promo__gradient_overlay} />
//       </div>

//       <div className={styles.promo__item_box__inner}>
//         {isSmall ? (
//           <>
//             <h3
//               className={`${styles.second__title} fontInstrument`}
//               {...(!isMobile && {dangerouslySetInnerHTML: {__html: ad.title}})}
//             >
//               {isMobile ? ad.title : undefined}
//             </h3>
//             <p
//               className={`${styles.second__subtitle} fontInstrument`}
//               {...(!isMobile && {dangerouslySetInnerHTML: {__html: ad.subtitle}})}
//             >
//               {isMobile ? ad.subtitle : undefined}
//             </p>
//             {ad.thirdText && (
//               <p
//                 className={`${styles.third__text} fontInstrument`}
//                 {...(!isMobile && {dangerouslySetInnerHTML: {__html: ad.thirdText}})}
//               >
//                 {isMobile ? ad.thirdText : undefined}
//               </p>
//             )}
//           </>
//         ) : (
//           <>
//             <h2 className={`${styles.el__title} fontInstrument`}>{ad.title}</h2>
//             <p className={`${styles.el__subtitle} fontInstrument`}>{ad.subtitle}</p>
//             {ad.thirdText && (
//               <p dangerouslySetInnerHTML={{__html: ad.thirdText}} className={`${styles.spec__text} fontInstrument`} />
//             )}
//           </>
//         )}
//       </div>
//     </Link>
//   )
// }

// interface KeenSliderProps {
//   children: React.ReactNode[]
//   slidesToShow: number
//   loop?: boolean
//   autoplay?: boolean
//   autoplaySpeed?: number
//   className?: string
//   sliderRefCb?: (ref: HTMLDivElement | null) => void
//   beforeChange?: (currentSlide: number) => void
// }

// const KeenSliderWrapper: FC<KeenSliderProps> = ({
//   children,
//   slidesToShow,
//   loop = true,
//   autoplay = false,
//   autoplaySpeed = 4500,
//   className,
//   sliderRefCb,
//   beforeChange
// }) => {
//   const timer = useRef<NodeJS.Timeout | null>(null)

//   const [sliderRef] = useKeenSlider<HTMLDivElement>(
//     {
//       loop,
//       slides: {
//         perView: slidesToShow,
//         spacing: 10
//       },
//       slideChanged(s) {
//         if (beforeChange) beforeChange(s.track.details.rel)
//       }
//     },
//     [
//       // Autoplay plugin
//       (slider) => {
//         function clearNextTimeout() {
//           if (timer.current) {
//             clearTimeout(timer.current)
//             timer.current = null
//           }
//         }
//         function nextTimeout() {
//           clearNextTimeout()
//           if (!autoplay) return

//           timer.current = setTimeout(() => {
//             slider.next()
//           }, autoplaySpeed)
//         }

//         slider.on('created', () => {
//           nextTimeout()
//         })
//         slider.on('dragStarted', () => {
//           clearNextTimeout()
//         })
//         slider.on('animationEnded', () => {
//           nextTimeout()
//         })
//         slider.on('updated', () => {
//           nextTimeout()
//         })
//         slider.on('destroyed', () => {
//           clearNextTimeout()
//         })
//       }
//     ]
//   )

//   // Pass ref to parent if needed
//   useEffect(() => {
//     if (sliderRefCb) sliderRefCb((sliderRef as any)?.current)
//   }, [sliderRef, sliderRefCb])

//   return (
//     <div ref={sliderRef} className={`keen-slider ${className || ''}`} style={{height: '100%'}}>
//       {children.map((child, i) => (
//         <div className='keen-slider__slide' key={i} style={{height: '100%'}}>
//           {child}
//         </div>
//       ))}
//     </div>
//   )
// }

// interface DynamicSliderProps {
//   ads: IPromoFromServer[]
//   isLoading: boolean
// }

// const DynamicSlider: FC<DynamicSliderProps> = ({ads, isLoading}) => {
//   // We maintain a loaded flag to fall back properly
//   const [sliderReady, setSliderReady] = useState(false)

//   const bigAds = useMemo(() => ads.filter((ad) => ad.isBig), [ads])
//   const smallAds = useMemo(() => ads.filter((ad) => !ad.isBig), [ads])

//   useEffect(() => {
//     // Simulate a small delay for UX or loading if needed
//     if (!isLoading) {
//       const timer = setTimeout(() => {
//         setSliderReady(true)
//       }, 100)
//       return () => clearTimeout(timer)
//     }
//   }, [isLoading])

//   // Fallback just renders static layout
//   if (!sliderReady) {
//     return <StaticPromoFallback ads={ads} />
//   }

//   // Render big promo items for slider (usually 1 item show)
//   const bigAdItems = bigAds.map((ad, index) => (
//     <div key={ad.id} itemScope itemType='https://schema.org/PromotionalOffer' style={{height: '100%'}}>
//       <PromoItemOptimized
//         ad={ad}
//         priority={index === 0}
//         sizes='(max-width: 768px) 100vw, (max-width: 993px) 100vw, 66vw'
//         extraClass={styles.promo__item_box_1}
//         extraStyle={{padding: '0 5px', marginLeft: '5px', marginRight: '5px', height: '100%'}}
//       />
//     </div>
//   ))

//   // Small ads items for desktop slider (2 items shown)
//   const smallAdItems = smallAds.map((ad) => (
//     <div
//       key={ad.id}
//       style={{height: '100%'}}
//       className={styles.full__height}
//       itemScope
//       itemType='https://schema.org/CreativeWork'
//     >
//       <PromoItemOptimized
//         ad={ad}
//         priority={false}
//         sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
//         extraStyle={{height: '100%', marginLeft: '5px', marginRight: '5px'}}
//         isSmall={true}
//       />
//     </div>
//   ))

//   // Small ads items for mobile slider (1 item per slide)
//   const smallAdItemsForMobile = smallAds.map((ad) => (
//     <div
//       key={ad.id}
//       className={styles.full__height}
//       style={{height: '100%'}}
//       itemScope
//       itemType='https://schema.org/CreativeWork'
//     >
//       <PromoItemOptimized
//         ad={ad}
//         priority={false}
//         sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
//         extraClass={styles.promo__item_box_4}
//         extraStyle={{height: '100%'}}
//         isSmall={true}
//         isMobile={true}
//       />
//     </div>
//   ))

//   return (
//     <div className={styles.promo_box__inner}>
//       {/* Большие рекламы слайдер — показываем по одному */}
//       <div className={styles.promo__item_box_1} style={{height: '100%'}}>
//         <KeenSliderWrapper autoplay slidesToShow={1} autoplaySpeed={4500} className=''>
//           {bigAdItems}
//         </KeenSliderWrapper>
//       </div>

//       {/* Маленькие рекламы слайдер для десктопа, 2 на слайд */}
//       <div
//         style={{height: '100%', display: 'block', minWidth: 0}}
//         className={`${styles.promo__item_box_2} ${styles.desktop_only} ${styles.slider__box__custom}`}
//       >
//         <KeenSliderWrapper autoplay slidesToShow={1} autoplaySpeed={4500} className=''>
//           {smallAdItems}
//         </KeenSliderWrapper>
//       </div>

//       {/* Дублирование маленьких реклам (реверс) */}
//       <div
//         style={{height: '100%', display: 'block', minWidth: 0}}
//         className={`${styles.promo__item_box_2} ${styles.desktop_only} ${styles.slider__box__custom}`}
//       >
//         <KeenSliderWrapper autoplay slidesToShow={1} autoplaySpeed={4500} className=''>
//           {[...smallAdItems].reverse()}
//         </KeenSliderWrapper>
//       </div>

//       {/* Мобильная версия маленьких слайдеров, показываем по одному */}
//       <div style={{height: '100%'}} className={`${styles.slider__box__custom} ${styles.slider__box__custom__hidden}`}>
//         <KeenSliderWrapper autoplay slidesToShow={1} autoplaySpeed={4500} className=''>
//           {smallAdItemsForMobile}
//         </KeenSliderWrapper>
//       </div>
//     </div>
//   )
// }

// const StaticPromoFallback: FC<{ads: IPromoFromServer[]}> = ({ads}) => {
//   const bigAd = ads.find((ad) => ad.isBig)
//   const smallAds = ads.filter((ad) => !ad.isBig).slice(0, 2)

//   return (
//     <div className={styles.promo_box__inner}>
//       {/* Большая реклама */}
//       {bigAd && (
//         <div className={styles.promo__item_box_1}>
//           <PromoItemOptimized
//             ad={bigAd}
//             priority={true}
//             sizes='(max-width: 768px) 100vw, (max-width: 993px) 100vw, 66vw'
//             extraClass={styles.promo__item_box_1}
//             extraStyle={{padding: '0 5px', marginLeft: '5px', marginRight: '5px'}}
//           />
//         </div>
//       )}

//       {/* Маленькие рекламы */}
//       {smallAds.map((ad) => (
//         <div
//           key={ad.id}
//           className={`${styles.promo__item_box_2} ${styles.desktop_only}`}
//           style={{height: '100%', display: 'block', minWidth: '0'}}
//         >
//           <PromoItemOptimized
//             ad={ad}
//             priority={false}
//             sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
//             extraStyle={{height: '100%', marginLeft: '5px', marginRight: '5px'}}
//             isSmall={true}
//           />
//         </div>
//       ))}

//       {/* Мобильная версия - показываем только первые 2 */}
//       <div className={`${styles.slider__box__custom} ${styles.slider__box__custom__hidden}`}>
//         <div style={{display: 'flex', gap: '10px'}}>
//           {smallAds.map((ad) => (
//             <div key={ad.id} style={{flex: '0 0 50%'}}>
//               <PromoItemOptimized
//                 ad={ad}
//                 priority={false}
//                 sizes='(max-width: 768px) 50vw, (max-width: 993px) 50vw, 33vw'
//                 extraClass={styles.promo__item_box_4}
//                 extraStyle={{height: '100%'}}
//                 isSmall={true}
//                 isMobile={true}
//               />
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// interface PromoProps {
//   ads: IPromoFromServer[]
//   organizationName?: string
//   baseUrl?: string
//   siteTitle?: string
// }

// const Promo: FC<PromoProps> = ({
//   ads,
//   organizationName = 'Exporteru',
//   baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://exporteru.com',
//   siteTitle = 'Exporteru.com'
// }) => {
//   const [isPageLoaded, setIsPageLoaded] = useState(false)

//   // Оптимизированная загрузка
//   useEffect(() => {
//     // Устанавливаем флаг загрузки после монтирования
//     const timer = setTimeout(() => {
//       setIsPageLoaded(true)
//     }, 1000)

//     return () => clearTimeout(timer)
//   }, [])

//   // Генерируем схемы только один раз
//   const schemas = useMemo(() => {
//     const mainPromoSchema = generateMainPromoSchema(ads, organizationName, baseUrl)
//     const itemListSchema = generateItemListSchema(ads, baseUrl)
//     const organizationSchema = generateOrganizationSchema(organizationName, baseUrl)
//     // const webSiteSchema = generateWebSiteSchema(baseUrl, siteTitle, organizationName)

//     return {
//       '@context': 'https://schema.org',
//       '@graph': [organizationSchema, mainPromoSchema, itemListSchema]
//     }
//   }, [ads, organizationName, baseUrl, siteTitle])

//   return (
//     <>
//       {/* Schema.org JSON-LD */}
//       <Head>
//         <script
//           type='application/ld+json'
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify(schemas, null, 2)
//           }}
//         />
//       </Head>

//       <div className={styles.promo_box} itemScope itemType='https://schema.org/WebPageElement'>
//         <meta itemProp='name' content='Promotional Section' />
//         <meta itemProp='description' content='Featured promotional content and offers' />

//         <div id='promo-list' className='container'>
//           <DynamicSlider ads={ads} isLoading={!isPageLoaded} />
//         </div>
//       </div>
//     </>
//   )
// }

// export default Promo

// // Дополнительные утилиты для экспорта
// export {
//   generateMainPromoSchema,
//   generateItemListSchema,
//   generateOrganizationSchema,
//   generateBreadcrumbSchema,
//   generateWebSiteSchema,
//   stripHtml
// }
